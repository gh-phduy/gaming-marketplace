-- Complete schema for the current application. Run the whole file in SQL Editor.
-- Safe to rerun; also upgrades the earlier catalog-only setup-products.sql.
-- It does not restore deleted users, purchases, messages, or Storage files.
begin;

-- 1. Public profiles. Email stays private; Auth owns its synchronization.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'User',
  avatar_url text not null default '/avt-placeholder.jpg',
  rating numeric(3, 2) not null default 0 check (rating between 0 and 5),
  is_verified_seller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.marketplace_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.marketplace_sync_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id, new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'username', ''),
      nullif(split_part(new.email, '@', 1), ''), 'User'
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', ''), '/avt-placeholder.jpg'
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists marketplace_sync_auth_user on auth.users;
create trigger marketplace_sync_auth_user
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.marketplace_sync_auth_user();

-- Backfill accounts registered before this script, without replacing profiles.
insert into public.users (id, email, display_name, avatar_url, created_at)
select id, email,
  coalesce(nullif(raw_user_meta_data ->> 'display_name', ''),
    nullif(raw_user_meta_data ->> 'full_name', ''),
    nullif(raw_user_meta_data ->> 'name', ''),
    nullif(raw_user_meta_data ->> 'username', ''),
    nullif(split_part(email, '@', 1), ''), 'User'),
  coalesce(nullif(raw_user_meta_data ->> 'avatar_url', ''),
    nullif(raw_user_meta_data ->> 'picture', ''), '/avt-placeholder.jpg'),
  coalesce(created_at, now())
from auth.users
on conflict (id) do nothing;

-- 2. Listings and the home-page catalog. Nullable price supports unpriced drafts.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid,
  title text not null,
  description text not null default '',
  price numeric(12, 2) check (price >= 0),
  currency text not null default 'USD',
  category text not null default 'game-keys',
  platform text not null default 'PC',
  region text not null default 'Global',
  edition text not null default 'Standard',
  delivery text not null default 'Instant',
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  video_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'paused')),
  views integer not null default 0 check (views >= 0),
  sales integer not null default 0 check (sales >= 0),
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_published_price_required
    check (status <> 'published' or price is not null)
);

-- Explicit home-page section flags; also upgrade existing product tables.
alter table public.products
  add column if not exists is_upcoming boolean not null default false,
  add column if not exists is_new boolean not null default false,
  add column if not exists is_weekly boolean not null default false,
  add column if not exists is_under_price boolean not null default false,
  add column if not exists release_date date;

alter table public.products
  add column if not exists edition text not null default 'Standard',
  add column if not exists delivery text not null default 'Instant';

-- Add this relation even if setup-products.sql already created the table.
do $$
begin
  if not exists (select 1 from pg_constraint
    where conrelid = 'public.products'::regclass and conname = 'products_seller_id_fkey') then
    alter table public.products add constraint products_seller_id_fkey
      foreign key (seller_id) references public.users(id) on delete set null;
  end if;
end;
$$;

-- 3. One row per cart line, not one row per payment.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'cancelled', 'failed', 'refunded')),
  stripe_payment_intent text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A payment may contain multiple products. NULL product IDs are valid for top-ups.
-- Top-up retry deduplication uses the backend's deterministic order UUID.
create unique index if not exists orders_payment_product_idx
  on public.orders (buyer_id, stripe_payment_intent, product_id)
  where product_id is not null;

-- 4. The FK names below are explicitly referenced by frontend select strings.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null,
  buyer_id uuid not null,
  listing_title text not null default 'General Inquiry',
  unread_for_seller integer not null default 0 check (unread_for_seller >= 0),
  unread_for_buyer integer not null default 0 check (unread_for_buyer >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_seller_id_fkey
    foreign key (seller_id) references public.users(id) on delete cascade,
  constraint conversations_buyer_id_fkey
    foreign key (buyer_id) references public.users(id) on delete cascade,
  constraint conversations_distinct_participants check (seller_id <> buyer_id),
  constraint conversations_participants_listing_key unique (seller_id, buyer_id, listing_title)
);

-- 5. Message INSERT is the single source of unread-count updates.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  text text not null check (length(btrim(text)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists users_verified_rating_idx
  on public.users (rating desc) where is_verified_seller;
create index if not exists users_display_name_idx on public.users (lower(display_name));
create index if not exists products_popular_sort_idx
  on public.products (sort_order) where is_popular and status = 'published';
create index if not exists products_upcoming_sort_idx
  on public.products (sort_order, id) where is_upcoming and status = 'published';
create index if not exists products_new_sort_idx
  on public.products (sort_order, id) where is_new and status = 'published';
create index if not exists products_weekly_sort_idx
  on public.products (sort_order, id) where is_weekly and status = 'published';
create index if not exists products_under_price_sort_idx
  on public.products (sort_order, id) where is_under_price and status = 'published';
create index if not exists products_seller_updated_idx
  on public.products (seller_id, updated_at desc);
create index if not exists products_status_idx on public.products (status);
create index if not exists orders_buyer_created_idx on public.orders (buyer_id, created_at desc);
create index if not exists orders_product_idx on public.orders (product_id);
create index if not exists conversations_seller_updated_idx
  on public.conversations (seller_id, updated_at desc);
create index if not exists conversations_buyer_updated_idx
  on public.conversations (buyer_id, updated_at desc);
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index if not exists messages_sender_idx on public.messages (sender_id);

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at before update on public.users
for each row execute function public.marketplace_touch_updated_at();
-- Replace the earlier product-only trigger; preserve existing rows.
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products
for each row execute function public.marketplace_touch_updated_at();
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders
for each row execute function public.marketplace_touch_updated_at();
drop trigger if exists conversations_touch_updated_at on public.conversations;
create trigger conversations_touch_updated_at before update on public.conversations
for each row execute function public.marketplace_touch_updated_at();

create or replace function public.marketplace_message_inserted()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.conversations set
    unread_for_seller = unread_for_seller + case when new.sender_id = buyer_id then 1 else 0 end,
    unread_for_buyer = unread_for_buyer + case when new.sender_id = seller_id then 1 else 0 end,
    updated_at = now()
  where id = new.conversation_id
    and new.sender_id in (seller_id, buyer_id);
  if not found then
    raise exception 'Message sender must be a conversation participant' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists marketplace_message_inserted on public.messages;
create trigger marketplace_message_inserted after insert on public.messages
for each row execute function public.marketplace_message_inserted();

-- Client updates can reset their own counter, never the other person's counter.
-- The definer message trigger and SQL Editor run as the privileged DB owner.
create or replace function public.marketplace_guard_conversation_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if auth.uid() = old.seller_id then
      if new.unread_for_buyer is distinct from old.unread_for_buyer
        or (new.unread_for_seller is distinct from old.unread_for_seller and new.unread_for_seller <> 0) then
        raise exception 'Only reset your own unread counter' using errcode = '42501';
      end if;
    elsif auth.uid() = old.buyer_id then
      if new.unread_for_seller is distinct from old.unread_for_seller
        or (new.unread_for_buyer is distinct from old.unread_for_buyer and new.unread_for_buyer <> 0) then
        raise exception 'Only reset your own unread counter' using errcode = '42501';
      end if;
    else
      raise exception 'Not a conversation participant' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists marketplace_guard_conversation_update on public.conversations;
create trigger marketplace_guard_conversation_update before update on public.conversations
for each row execute function public.marketplace_guard_conversation_update();

-- Grants and RLS are both required. No client may set verified/rating fields.
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
revoke all on public.users, public.products, public.orders, public.conversations, public.messages
  from anon, authenticated;
-- Reset explicit profile-column grants too, to keep reruns consistent.
revoke all (id, email, display_name, avatar_url, rating, is_verified_seller, created_at, updated_at)
  on public.users from anon, authenticated;
grant select (id, display_name, avatar_url, rating, is_verified_seller, created_at, updated_at)
  on public.users to anon, authenticated;
grant insert (id, display_name, avatar_url), update (id, display_name, avatar_url)
  on public.users to authenticated;
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant select on public.orders to authenticated;
revoke insert, update, delete on public.orders from anon, authenticated;
grant select on public.conversations to authenticated;
grant insert (seller_id, buyer_id, listing_title),
  update (unread_for_seller, unread_for_buyer, updated_at)
  on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, sender_id, text) on public.messages to authenticated;

drop policy if exists "users_read_profiles" on public.users;
create policy "users_read_profiles" on public.users for select to anon, authenticated using (true);
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users for insert to authenticated
  with check (id = (select auth.uid()));
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "products_read_published" on public.products;
create policy "products_read_published" on public.products for select to anon, authenticated
  using (status = 'published');
drop policy if exists "products_seller_read" on public.products;
create policy "products_seller_read" on public.products for select to authenticated
  using (seller_id = (select auth.uid()));
drop policy if exists "products_seller_insert" on public.products;
create policy "products_seller_insert" on public.products for insert to authenticated
  with check (seller_id = (select auth.uid()));
drop policy if exists "products_seller_update" on public.products;
create policy "products_seller_update" on public.products for update to authenticated
  using (seller_id = (select auth.uid())) with check (seller_id = (select auth.uid()));
drop policy if exists "products_seller_delete" on public.products;
create policy "products_seller_delete" on public.products for delete to authenticated
  using (seller_id = (select auth.uid()));

drop policy if exists "orders_read_own" on public.orders;
create policy "orders_read_own" on public.orders for select to authenticated
  using (buyer_id = (select auth.uid()) or exists (
    select 1 from public.products p where p.id = product_id and p.seller_id = (select auth.uid())
  ));
-- Orders are recorded by the backend only after Stripe verification.
drop policy if exists "orders_insert_own" on public.orders;

drop policy if exists "conversations_read_participant" on public.conversations;
create policy "conversations_read_participant" on public.conversations for select to authenticated
  using ((select auth.uid()) in (seller_id, buyer_id));
drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant" on public.conversations for insert to authenticated
  with check ((select auth.uid()) in (seller_id, buyer_id));
drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant" on public.conversations for update to authenticated
  using ((select auth.uid()) in (seller_id, buyer_id))
  with check ((select auth.uid()) in (seller_id, buyer_id));

drop policy if exists "messages_read_participant" on public.messages;
create policy "messages_read_participant" on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c
    where c.id = conversation_id and (select auth.uid()) in (c.seller_id, c.buyer_id)));
drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (select auth.uid()) in (c.seller_id, c.buyer_id)
  ));

revoke execute on function public.marketplace_touch_updated_at(),
  public.marketplace_sync_auth_user(), public.marketplace_message_inserted(),
  public.marketplace_guard_conversation_update() from public, anon, authenticated;

-- Storage: retain your existing files and bucket settings. No upload/delete grants.
insert into storage.buckets (id, name, public) values ('Image', 'Image', true)
on conflict (id) do nothing;
drop policy if exists "Read popular game images" on storage.objects;
create policy "Read popular game images" on storage.objects for select to anon, authenticated
  using (bucket_id = 'Image' and (storage.foldername(name))[1] = 'popular_game');
drop policy if exists "Read homepage game images" on storage.objects;
create policy "Read homepage game images" on storage.objects for select to anon, authenticated
  using (bucket_id = 'Image' and (storage.foldername(name))[1] in
    ('new_on_difmark', 'up_coming', 'weekly_chart', 'under_price'));

-- Realtime: preserve the publication and any other tables already in it.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;

-- Eight known Storage images. No invented seller, price, stock, or sales history.
insert into public.products (id, title, image_url, is_popular, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', '007 First Light',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/007-first-light-pc_icon-455x325_1.jpg', true, 1),
  ('10000000-0000-4000-8000-000000000002', 'Control Resonant',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/control-resonant-pc_icon-455x325_2.jpg', true, 2),
  ('10000000-0000-4000-8000-000000000003', 'EA Sports FC 27',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/ea-sports-fc-27-pc_icon-455x325_1.jpg', true, 3),
  ('10000000-0000-4000-8000-000000000004', 'Onimusha: Way of the Sword',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/onimusha-way-of-the-sword-pc_icon-455x325_2.jpg', true, 4),
  ('10000000-0000-4000-8000-000000000005', 'Silent Hill: Townfall',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/silent-hill-townfall-pc_icon-455x325_1.jpg', true, 5),
  ('10000000-0000-4000-8000-000000000006', 'Star Wars: Galactic Racer',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/star-wars-galactic-racer-pc_icon-455x325_3.jpg', true, 6),
  ('10000000-0000-4000-8000-000000000007', 'The Blood of Dawnwalker',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/the-blood-of-dawnwalker-pc_icon-455x325_2.jpg', true, 7),
  ('10000000-0000-4000-8000-000000000008', 'Wardogs',
   'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/wardogs-pc_icon-455x325_2.jpg', true, 8)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
commit;

-- SQL Editor verification: expect five tables with RLS enabled.
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
  and tablename in ('users', 'products', 'orders', 'conversations', 'messages')
order by tablename;
