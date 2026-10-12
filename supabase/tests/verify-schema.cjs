// Runs PostgreSQL via PGlite in memory. It never connects to the hosted project.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const { PGlite } = require(require.resolve('@electric-sql/pglite', {
  paths: [root, path.join(root, '.codex-artifacts/supabase-validation')],
}));
const schema = fs.readFileSync(path.join(root, 'supabase/setup.sql'), 'utf8');
const demoSeed = fs.readFileSync(path.join(root, 'supabase/seed-demo.sql'), 'utf8');
const homepageSeed = fs.readFileSync(path.join(root, 'supabase/homepage-sections.sql'), 'utf8');
const legacy = fs.readFileSync(path.join(__dirname, 'fixtures/catalog-only.sql'), 'utf8');
const seller = '20000000-0000-4000-8000-000000000001';
const buyer = '20000000-0000-4000-8000-000000000002';
const outsider = '20000000-0000-4000-8000-000000000003';
let checks = 0;
function equal(actual, expected, label) { assert.deepEqual(actual, expected, label); checks++; }
async function denied(action, code = '42501') {
  await assert.rejects(action, error => error.code === code);
  checks++;
}
async function bootstrap(db) {
  // Minimal stand-ins for managed Supabase roles, Auth, and Storage, not app tables.
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (
      id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb,
      created_at timestamptz default now(), updated_at timestamptz default now(),
      aud text, role text, raw_app_meta_data jsonb default '{}'::jsonb,
      banned_until timestamptz
    );
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean default false);
    create table storage.objects (
      id uuid primary key default gen_random_uuid(),
      bucket_id text references storage.buckets(id), name text
    );
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon, authenticated;
    grant select on storage.objects to anon, authenticated;
    create function storage.foldername(name text) returns text[] language sql immutable as $$
      select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1]
    $$;
    create table public.realtime_existing (id int);
    create publication supabase_realtime for table public.realtime_existing;
  `);
}
async function as(db, role, id, action) {
  assert.ok(['anon', 'authenticated'].includes(role));
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id || '']);
  try { return await action(); }
  finally {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub', '', false)");
  }
}
async function count(db, table) {
  return (await db.query(`select count(*)::int as n from public.${table}`)).rows[0].n;
}

async function freshSchema() {
  const db = new PGlite();
  try {
    await bootstrap(db);
    await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)',
      [seller, 'seller@example.test', { full_name: 'Seller', picture: '/seller.jpg' }]);
    await db.exec(schema);
    equal(await count(db, 'products'), 8, 'Eight image drafts');
    equal(await count(db, 'users'), 1, 'Preexisting Auth account was backfilled');
    equal((await db.query('select display_name, avatar_url from public.users where id=$1', [seller])).rows[0],
      { display_name: 'Seller', avatar_url: '/seller.jpg' }, 'Google metadata mapping');
    for (const [id, email, name] of [[buyer, 'buyer@example.test', 'Buyer'], [outsider, 'outsider@example.test', 'Outsider']]) {
      await db.query('insert into auth.users (id,email,raw_user_meta_data) values ($1,$2,$3)',
        [id, email, { display_name: name, is_verified_seller: true, rating: 5 }]);
    }
    equal(await count(db, 'users'), 3, 'Signup trigger');
    equal((await db.query('select rating::int as rating,is_verified_seller from public.users where id=$1', [buyer])).rows[0],
      { rating: 0, is_verified_seller: false }, 'Untrusted metadata cannot grant seller verification');
    await db.query("update auth.users set email='changed@example.test', raw_user_meta_data=$1 where id=$2",
      [{ display_name: 'Buyer Updated', avatar_url: '/updated.jpg' }, buyer]);
    equal((await db.query('select email,display_name,avatar_url from public.users where id=$1', [buyer])).rows[0],
      { email: 'changed@example.test', display_name: 'Buyer Updated', avatar_url: '/updated.jpg' }, 'Auth update sync');

    const fkNames = (await db.query(`select conname from pg_constraint
      where contype='f' and conrelid in ('public.products'::regclass,'public.messages'::regclass,'public.conversations'::regclass)`))
      .rows.map(row => row.conname).sort();
    equal(fkNames, ['conversations_buyer_id_fkey', 'conversations_seller_id_fkey',
      'messages_conversation_id_fkey', 'messages_sender_id_fkey', 'products_seller_id_fkey'], 'Exact PostgREST relationships');
    equal((await db.query("select tablename from pg_publication_tables where pubname='supabase_realtime' order by tablename")).rows,
      [{ tablename: 'messages' }, { tablename: 'realtime_existing' }], 'Realtime preserves preexisting tables');
    equal((await db.query("select count(*)::int as n from pg_tables where schemaname='public' and rowsecurity")).rows[0].n,
      5, 'RLS on all application tables');

    await as(db, 'anon', null, async () => {
      equal((await db.query('select id,display_name,avatar_url,rating,is_verified_seller from public.users')).rows.length,
        3, 'Public profile columns readable');
      await denied(() => db.query('select email from public.users'));
      equal(await count(db, 'products'), 0, 'Unpriced drafts hidden');
      await denied(() => db.query('select * from public.orders'));
      await denied(() => db.query('select * from public.messages'));
    });
    await as(db, 'authenticated', buyer, async () => {
      // Same columns and onConflict=id as checkout's Supabase upsert.
      await db.query(`insert into public.users(id,display_name,avatar_url) values ($1,'Buyer Local','/local.jpg')
        on conflict(id) do update set id=excluded.id,display_name=excluded.display_name,avatar_url=excluded.avatar_url`, [buyer]);
      equal((await db.query('select display_name from public.users where id=$1', [buyer])).rows[0].display_name,
        'Buyer Local', 'Checkout profile upsert allowed');
      await denied(() => db.query('select email from public.users'));
      await denied(() => db.query('update public.users set is_verified_seller=true where id=$1', [buyer]));
      await denied(() => db.query('update public.users set rating=5 where id=$1', [buyer]));
      equal((await db.query("update public.users set display_name='Spoofed' where id=$1 returning id", [seller])).rows.length,
        0, 'Cannot edit another profile');
      await denied(() => db.query("insert into public.products(seller_id,title) values ($1,'Forged')", [seller]));
    });

    let draft, firstProduct, secondProduct;
    await as(db, 'authenticated', seller, async () => {
      draft = (await db.query("insert into public.products(seller_id,title) values ($1,'Seller Draft') returning id", [seller])).rows[0].id;
      equal(await count(db, 'products'), 1, 'Seller sees own draft');
      await denied(() => db.query("update public.products set status='published' where id=$1", [draft]), '23514');
      firstProduct = (await db.query(`insert into public.products(seller_id,title,price,status)
        values ($1,'Published One',10,'published') returning id`, [seller])).rows[0].id;
      secondProduct = (await db.query(`insert into public.products(seller_id,title,price,status)
        values ($1,'Published Two',20,'published') returning id`, [seller])).rows[0].id;
    });
    await as(db, 'anon', null, async () => equal(await count(db, 'products'), 2, 'Public sees only published listings'));
    await as(db, 'authenticated', buyer, async () => {
      equal((await db.query("update public.products set price=1 where id=$1 returning id", [firstProduct])).rows.length,
        0, 'Buyer cannot alter seller pricing');
      equal((await db.query('delete from public.products where id=$1 returning id', [draft])).rows.length,
        0, 'Buyer cannot delete seller listing');
      equal((await db.query(`select p.id,u.display_name,u.avatar_url,u.rating,u.is_verified_seller
        from public.products p left join public.users u on u.id=p.seller_id where p.id=$1`, [firstProduct])).rows.length,
        1, 'Product-to-seller join');
    });

    let conversation;
    await as(db, 'authenticated', buyer, async () => {
      conversation = (await db.query(`insert into public.conversations(seller_id,buyer_id,listing_title)
        values ($1,$2,'Published One') returning id,unread_for_seller,unread_for_buyer`, [seller, buyer])).rows[0];
      equal([conversation.unread_for_seller, conversation.unread_for_buyer], [0, 0], 'Counter defaults');
      await denied(() => db.query(`insert into public.conversations(seller_id,buyer_id,listing_title)
        values ($1,$2,'Published One')`, [seller, buyer]), '23505');
      await denied(() => db.query('insert into public.messages(conversation_id,sender_id,text) values ($1,$2,$3)',
        [conversation.id, seller, 'Forged sender']));
      await denied(() => db.query('insert into public.messages(conversation_id,sender_id,text) values ($1,$2,$3)',
        [conversation.id, buyer, '  ']), '23514');
      await db.query(`insert into public.messages(conversation_id,sender_id,text)
        values ($1,$2,'Hello'),($1,$2,'Second message')`, [conversation.id, buyer]);
    });
    equal((await db.query('select unread_for_seller,unread_for_buyer from public.conversations where id=$1', [conversation.id])).rows[0],
      { unread_for_seller: 2, unread_for_buyer: 0 }, 'Atomic buyer-to-seller counts');
    await as(db, 'authenticated', seller, async () => {
      equal(await count(db, 'messages'), 2, 'Seller reads thread');
      await db.query('update public.conversations set unread_for_seller=0 where id=$1', [conversation.id]);
      await db.query("insert into public.messages(conversation_id,sender_id,text) values ($1,$2,'Seller reply')",
        [conversation.id, seller]);
      await denied(() => db.query('update public.conversations set unread_for_buyer=0 where id=$1', [conversation.id]));
      await denied(() => db.query('update public.conversations set buyer_id=$1 where id=$2', [outsider, conversation.id]));
      await denied(() => db.query("update public.messages set text='Edited' where conversation_id=$1", [conversation.id]));
    });
    equal((await db.query('select unread_for_seller,unread_for_buyer from public.conversations where id=$1', [conversation.id])).rows[0],
      { unread_for_seller: 0, unread_for_buyer: 1 }, 'Seller reply increments exactly once');
    await as(db, 'authenticated', outsider, async () => {
      equal(await count(db, 'messages'), 0, 'Outsider cannot read messages');
      equal(await count(db, 'conversations'), 0, 'Outsider cannot read threads');
      await denied(() => db.query("insert into public.messages(conversation_id,sender_id,text) values ($1,$2,'Intrusion')",
        [conversation.id, outsider]));
      await denied(() => db.query("insert into public.conversations(seller_id,buyer_id) values ($1,$2)", [seller, buyer]));
    });

    // Backend writes after Stripe verification; browser accounts cannot forge completed orders.
    await db.query(`insert into public.orders(buyer_id,product_id,quantity,total_price,currency,status,stripe_payment_intent)
      values ($1,$2,1,10,'USD','completed','pi_test_multiple'),($1,$3,2,40,'USD','completed','pi_test_multiple')`,
      [buyer, firstProduct, secondProduct]);
    await denied(() => db.query(`insert into public.orders(buyer_id,product_id,quantity,total_price,stripe_payment_intent)
      values ($1,$2,1,10,'pi_test_multiple')`, [buyer, firstProduct]), '23505');
    await db.query(`insert into public.orders(buyer_id,product_id,quantity,total_price,status,stripe_payment_intent)
      values ($1,null,1,5,'completed','pi_test_topup'),($1,null,1,5,'completed','pi_test_topup')`, [buyer]);
    await as(db, 'authenticated', buyer, async () => {
      await db.query('update public.conversations set unread_for_buyer=0 where id=$1', [conversation.id]);
      equal(await count(db, 'orders'), 4, 'Buyer reads backend-confirmed orders');
      await denied(() => db.query(`insert into public.orders(buyer_id,product_id,quantity,total_price,status,stripe_payment_intent)
        values ($1,$2,1,0,'completed','pi_forged_order')`, [buyer, firstProduct]));
      await denied(() => db.query(`insert into public.orders(buyer_id,quantity,total_price,stripe_payment_intent)
        values ($1,1,10,'pi_forged_buyer')`, [seller]));
      await denied(() => db.query("update public.orders set status='refunded' where buyer_id=$1", [buyer]));
    });
    await as(db, 'authenticated', seller, async () => equal(await count(db, 'orders'), 2, 'Seller reads orders for own listings'));
    await as(db, 'authenticated', outsider, async () => equal(await count(db, 'orders'), 0, 'Outsider cannot read orders'));
    await db.query("insert into storage.objects(bucket_id,name) values ('Image','popular_game/known.jpg'),('Image','private/hidden.jpg')");
    await as(db, 'anon', null, async () => equal((await db.query('select name from storage.objects')).rows,
      [{ name: 'popular_game/known.jpg' }], 'Storage folder policy'));
    equal((await db.query("select has_function_privilege('authenticated','public.marketplace_message_inserted()','EXECUTE') as allowed")).rows[0].allowed,
      false, 'Privileged trigger is not callable as a public RPC');
    await db.exec(schema);
    equal(await count(db, 'orders'), 4, 'Rerun preserves orders');
    equal(await count(db, 'messages'), 3, 'Rerun preserves messages');
    equal(await count(db, 'products'), 11, 'Rerun does not duplicate seeds');
    equal((await db.query('select display_name from public.users where id=$1', [buyer])).rows[0].display_name,
      'Buyer Local', 'Rerun preserves edited profile');
    await as(db, 'authenticated', seller, async () => { await db.query('delete from public.products where id=$1', [firstProduct]); });
    equal((await db.query("select count(*)::int as n from public.orders where stripe_payment_intent='pi_test_multiple' and product_id is null")).rows[0].n,
      1, 'Deleting a listing preserves order history');
    await db.query('delete from auth.users where id=$1', [buyer]);
    equal(await count(db, 'conversations'), 0, 'Deleting an Auth account cleans up threads');
    equal(await count(db, 'messages'), 0, 'Thread message cascade');
    equal(await count(db, 'orders'), 4, 'Order records survive account deletion');
  } finally { await db.close(); }
}

async function upgradeSchema() {
  const db = new PGlite();
  try {
    await bootstrap(db);
    await db.exec(legacy);
    await db.exec("update public.products set price=42,stock=9,status='published' where sort_order=1");
    await db.exec(schema);
    equal((await db.query('select price::int as price,stock,status from public.products where sort_order=1')).rows[0],
      { price: 42, stock: 9, status: 'published' }, 'Catalog-only upgrade preserves existing edits');
    equal((await db.query("select count(*)::int as n from pg_constraint where conrelid='public.products'::regclass and conname='products_seller_id_fkey'")).rows[0].n,
      1, 'Upgrade adds seller relationship');
    await db.exec(schema);
    equal(await count(db, 'products'), 8, 'Upgrade rerun keeps eight seeds');
  } finally { await db.close(); }
}

async function demoCatalog() {
  const db = new PGlite();
  const demoSeller = '30000000-0000-4000-8000-000000000001';
  try {
    await bootstrap(db);
    await db.exec(schema);
    await db.exec(demoSeed);
    equal(await count(db, 'users'), 1, 'Demo seed creates one profile');
    equal((await db.query('select display_name, rating::int, is_verified_seller from public.users')).rows,
      [{ display_name: 'Demo Game Store', rating: 0, is_verified_seller: false }],
      'Demo seller does not invent reviews or verification');
    equal((await db.query("select count(*)::int as n from auth.users where id=$1 and banned_until='infinity'", [demoSeller])).rows[0].n,
      1, 'Display-only demo Auth account is disabled');
    const visible = await as(db, 'anon', null, () => db.query(`
      select p.id, p.title, p.price, p.image_url, p.sort_order, u.display_name
      from public.products p join public.users u on u.id=p.seller_id
      where p.is_popular=true and p.status='published' order by p.sort_order
    `));
    equal(visible.rows.length, 8, 'Anonymous home page can read all eight demo products');
    equal(visible.rows.map(row => row.sort_order), [1, 2, 3, 4, 5, 6, 7, 8], 'Demo catalog order');
    equal(visible.rows.every(row => Number(row.price) > 0 &&
      row.display_name === 'Demo Game Store' && row.image_url.includes('/Image/popular_game/')),
      true, 'Demo products have prices, seller joins and Storage image paths');
    await db.exec(demoSeed);
    equal(await count(db, 'users'), 1, 'Demo rerun does not duplicate profiles');
    equal(await count(db, 'products'), 8, 'Demo rerun does not duplicate products');
    await db.query('insert into auth.users (id,email) values ($1,$2)', [outsider, 'another@example.test']);
    await db.query('update public.products set seller_id=$1 where sort_order=1', [outsider]);
    await denied(() => db.exec(demoSeed), 'P0001');
    await db.exec('rollback');
    equal((await db.query('select seller_id from public.products where sort_order=1')).rows[0].seller_id,
      outsider, 'Demo rerun protects a listing claimed by another seller');
  } finally { await db.close(); }
}

async function homepageSections() {
  const db = new PGlite();
  const demoSeller = '30000000-0000-4000-8000-000000000001';
  try {
    await bootstrap(db);
    await db.exec(schema);
    await db.exec(demoSeed);
    // Simulate the hosted table before this incremental migration.
    await db.exec(`alter table public.products drop column is_upcoming,
      drop column is_new, drop column is_weekly, drop column is_under_price,
      drop column release_date`);
    await db.exec('drop policy "Read homepage game images" on storage.objects');
    const folders = ['new_on_difmark', 'up_coming', 'weekly_chart', 'under_price'];
    const weeklyFiles = [
      'doom-eternal-pc_icon-510x300_1.jpg', 'doom-pc_icon-510x300_3.jpg',
      'doom-plus-doom-ii-pc_icon-510x300_1.jpg', 'fallout-76-pc_icon-510x300_1.jpg',
      'grand-theft-auto-vi-ps5_icon-510x300_1.jpg', 'peak-pc_icon-510x300_4.jpg',
      'psychonauts-2-pc_icon-510x300_1.jpg', 'shape-of-dreams-pc_icon-510x300_1.jpg',
    ];
    for (const folder of folders) {
      for (let i = 0; i < 8; i++) {
        const name = folder === 'weekly_chart' ? weeklyFiles[i] : `fixture-game-${i + 1}-pc_icon-510x300_1.jpg`;
        await db.query("insert into storage.objects(bucket_id,name) values ('Image',$1)", [`${folder}/${name}`]);
      }
    }
    for (const name of ['weekly_chart/notes.txt', 'weekly_chart/nested/skip.jpg', 'private/secret.jpg']) {
      await db.query("insert into storage.objects(bucket_id,name) values ('Image',$1)", [name]);
    }
    const existingId = '40000000-0000-4000-8000-000000000001';
    const existingImage = 'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/new_on_difmark/fixture-game-1-pc_icon-510x300_1.jpg';
    await db.query(`insert into public.products(id,title,price,stock,image_url)
      values ($1,'Existing custom title',77.77,7,$2)`, [existingId, existingImage]);
    await db.exec(homepageSeed);
    equal(await count(db, 'products'), 40, 'Imports 32 Storage images, reusing existing image row');
    equal(await count(db, 'users'), 1, 'Homepage import reuses the demo seller');
    equal((await db.query(`select column_name from information_schema.columns
      where table_schema='public' and table_name='products'
      and column_name in ('is_upcoming','is_new','is_weekly','is_under_price','release_date')
      order by column_name`)).rows.map(row => row.column_name),
      ['is_new', 'is_under_price', 'is_upcoming', 'is_weekly', 'release_date'], 'Migration adds all missing section fields');
    for (const flag of ['is_upcoming', 'is_new', 'is_weekly', 'is_under_price']) {
      const extra = flag === 'is_under_price' ? " and currency='USD' and price<100" : '';
      const rows = await as(db, 'anon', null, () => db.query(`
        select id from public.products where ${flag}=true and status='published'${extra}
        order by sort_order,id limit 8`));
      equal(rows.rows.length, 8, `Public homepage reads eight ${flag} listings`);
    }
    equal((await db.query(`select title,platform from public.products
      where is_weekly and title='Grand Theft Auto VI'`)).rows,
      [{ title: 'Grand Theft Auto VI', platform: 'PS5' }], 'Storage slug produces a clean title and platform');
    equal((await db.query(`select count(*)::int as n from public.products
      where is_upcoming and release_date is not null`)).rows[0].n,
      0, 'No release dates invented from filenames');
    equal((await db.query('select title,price::text,stock,seller_id from public.products where id=$1', [existingId])).rows[0],
      { title: 'Existing custom title', price: '77.77', stock: 7, seller_id: demoSeller }, 'Existing image row keeps ID and custom catalog values');
    const images = await as(db, 'anon', null, () => db.query("select name from storage.objects where name='weekly_chart/peak-pc_icon-510x300_4.jpg'"));
    equal(images.rows.length, 1, 'Public Storage listing can read a new home folder');
    const privateImages = await as(db, 'anon', null, () => db.query("select name from storage.objects where name='private/secret.jpg'"));
    equal(privateImages.rows.length, 0, 'Other Storage folders stay private');
    await db.query('update public.products set price=12.34,release_date=$1 where id=$2', ['2027-01-02', existingId]);
    await db.exec('alter policy "Read homepage game images" on storage.objects using (false)');
    const disabledPolicy = await as(db, 'anon', null, () => db.query("select name from storage.objects where name='weekly_chart/peak-pc_icon-510x300_4.jpg'"));
    equal(disabledPolicy.rows.length, 0, 'Existing homepage policy can be restricted before migration');
    await db.exec(homepageSeed);
    const updatedPolicy = await as(db, 'anon', null, () => db.query("select name from storage.objects where name='weekly_chart/peak-pc_icon-510x300_4.jpg'"));
    equal(updatedPolicy.rows.length, 1, 'Migration updates an existing policy without removing it');
    equal(await count(db, 'products'), 40, 'Homepage import rerun creates no duplicates');
    equal((await db.query('select price::text,release_date::text from public.products where id=$1', [existingId])).rows[0],
      { price: '12.34', release_date: '2027-01-02' }, 'Rerun preserves price and release-date edits');
    await db.exec(schema);
    equal(await count(db, 'products'), 40, 'Full schema rerun preserves imported catalog');
    const afterRerun = await as(db, 'anon', null, () => db.query("select name from storage.objects where name like 'weekly_chart/%'"));
    equal(afterRerun.rows.length > 0, true, 'Full setup keeps the expanded homepage Storage policy');
    await db.query('insert into auth.users(id,email) values ($1,$2)', [outsider, 'owner@example.test']);
    await db.query('update public.products set seller_id=$1 where id=$2', [outsider, existingId]);
    await denied(() => db.exec(homepageSeed), 'P0001');
    await db.exec('rollback');
    equal((await db.query('select seller_id from public.products where id=$1', [existingId])).rows[0].seller_id,
      outsider, 'Homepage import will not take over another seller listing');
  } finally { await db.close(); }
}

(async () => {
  await freshSchema();
  await upgradeSchema();
  await demoCatalog();
  await homepageSections();
  console.log(`PASS: ${checks} PostgreSQL checks (fresh setup, upgrade, rerun, RLS, Auth, chat, orders, Storage, Realtime publication, demo catalog, homepage sections).`);
})().catch(error => { console.error(error); process.exitCode = 1; });
