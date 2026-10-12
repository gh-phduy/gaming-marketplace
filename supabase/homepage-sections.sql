-- Run the entire file in SQL Editor after setup.sql.
-- Reads the actual Storage filenames; no manual filename transcription needed.
-- Creates demo listings for every image in the four new home-page folders.
-- Uses the existing Demo Game Store account from seed-demo.sql.
-- Prices/stock are demo values. Existing prices and release dates are preserved.
begin;

alter table public.products
  add column if not exists is_upcoming boolean not null default false,
  add column if not exists is_new boolean not null default false,
  add column if not exists is_weekly boolean not null default false,
  add column if not exists is_under_price boolean not null default false,
  add column if not exists release_date date;

create index if not exists products_upcoming_sort_idx
  on public.products (sort_order, id) where is_upcoming and status = 'published';
create index if not exists products_new_sort_idx
  on public.products (sort_order, id) where is_new and status = 'published';
create index if not exists products_weekly_sort_idx
  on public.products (sort_order, id) where is_weekly and status = 'published';
create index if not exists products_under_price_sort_idx
  on public.products (sort_order, id) where is_under_price and status = 'published';

do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'storage'
    and tablename = 'objects' and policyname = 'Read homepage game images') then
    alter policy "Read homepage game images" on storage.objects to anon, authenticated
      using (bucket_id = 'Image' and (storage.foldername(name))[1] in
        ('new_on_difmark', 'up_coming', 'weekly_chart', 'under_price'));
  else
    create policy "Read homepage game images" on storage.objects for select to anon, authenticated
      using (bucket_id = 'Image' and (storage.foldername(name))[1] in
        ('new_on_difmark', 'up_coming', 'weekly_chart', 'under_price'));
  end if;
end;
$$;

-- Keep the source snapshot in a local JSON variable, with no extra database table.
do $$
declare
  seed_rows jsonb;
begin
  if not exists (select 1 from public.users
    where id = '30000000-0000-4000-8000-000000000001') then
    raise exception 'Demo seller is missing. Run seed-demo.sql first.';
  end if;
  if not exists (select 1 from auth.users
    where id = '30000000-0000-4000-8000-000000000001'
      and raw_user_meta_data ->> 'demo_seed' = 'popular-games-v1') then
    raise exception 'Demo seller ID belongs to another account';
  end if;

-- Ignore nested folders, videos, and non-image files.
with files as (
  select name, split_part(name, '/', 1) as folder,
    split_part(name, '/', 2) as filename
  from storage.objects
  where bucket_id = 'Image'
    and split_part(name, '/', 1) in
      ('new_on_difmark', 'up_coming', 'weekly_chart', 'under_price')
    and name ~* '^[^/]+/[^/]+\.(jpe?g|png|webp|avif)$'
), catalog as (
  select *,
    row_number() over (partition by folder order by filename)::integer as sort_order,
    regexp_replace(
      regexp_replace(filename, '\.[^.]+$', '', 'i'),
      '[-_](pc|ps[345]|xbox[^_-]*|switch)[-_]icon.*$|[-_]icon.*$', '', 'i'
    ) as title_slug
  from files
)
select coalesce(jsonb_agg(to_jsonb(source)), '[]'::jsonb) into seed_rows
from (select
  coalesce(
    (select p.id from public.products p
      where p.image_url = 'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/' || catalog.name
      order by p.created_at, p.id limit 1),
    md5('homepage-demo-v1:' || name)::uuid
  ) as id,
  name, folder, filename, sort_order,
  case lower(title_slug)
    when 'doom-eternal' then 'DOOM Eternal'
    when 'doom' then 'DOOM'
    when 'doom-plus-doom-ii' then 'DOOM + DOOM II'
    when 'fallout-76' then 'Fallout 76'
    when 'grand-theft-auto-vi' then 'Grand Theft Auto VI'
    when 'peak' then 'PEAK'
    when 'psychonauts-2' then 'Psychonauts 2'
    when 'shape-of-dreams' then 'Shape of Dreams'
    when '007-first-light' then '007 First Light'
    when 'ea-sports-fc-27' then 'EA Sports FC 27'
    when 'onimusha-way-of-the-sword' then 'Onimusha: Way of the Sword'
    when 'silent-hill-townfall' then 'Silent Hill: Townfall'
    when 'star-wars-galactic-racer' then 'Star Wars: Galactic Racer'
    else initcap(regexp_replace(title_slug, '[-_]+', ' ', 'g'))
  end as title,
  case
    when filename ~* '-ps5[-_]' then 'PS5'
    when filename ~* '-ps4[-_]' then 'PS4'
    when filename ~* '-ps3[-_]' then 'PS3'
    when filename ~* '-xbox' then 'Xbox'
    when filename ~* '-switch[-_]' then 'Nintendo Switch'
    else 'PC'
  end as platform
from catalog) as source;

  if jsonb_array_length(seed_rows) = 0 then
    raise exception 'No images found. Upload images into Image/new_on_difmark, up_coming, weekly_chart or under_price first.';
  end if;
  if exists (
    select 1 from public.products p
    join jsonb_to_recordset(seed_rows) as s(id uuid) on p.id=s.id
    where p.seller_id is not null
      and p.seller_id <> '30000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'A matching product belongs to another seller; no rows were changed';
  end if;
insert into public.products (
  id, seller_id, title, description, price, currency, category, platform,
  region, stock, image_url, status, is_upcoming, is_new, is_weekly,
  is_under_price, sort_order
)
select id, '30000000-0000-4000-8000-000000000001'::uuid,
  title, 'Demo listing for testing the marketplace UI. Price and stock are sample data; no game key is supplied.',
  case when folder = 'under_price' then 4.99 + sort_order
    else 24.99 + sort_order end,
  'USD', 'game-keys', platform, 'Global', 10,
  'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/' || name,
  'published', folder = 'up_coming', folder = 'new_on_difmark',
  folder = 'weekly_chart', folder = 'under_price', sort_order
from jsonb_to_recordset(seed_rows) as source(
  id uuid, name text, folder text, sort_order integer, title text, platform text
)
on conflict (id) do update set
  seller_id = excluded.seller_id,
  image_url = excluded.image_url,
  price = coalesce(products.price, excluded.price),
  status = excluded.status,
  is_upcoming = products.is_upcoming or excluded.is_upcoming,
  is_new = products.is_new or excluded.is_new,
  is_weekly = products.is_weekly or excluded.is_weekly,
  is_under_price = products.is_under_price or excluded.is_under_price,
  sort_order = excluded.sort_order;
end;
$$;

notify pgrst, 'reload schema';
commit;

-- Actual counts depend on the images you uploaded. The UI displays up to 8 per section.
select section,
  count(*) filter (where sections.enabled and p.status = 'published') as published_products
from public.products p
cross join lateral (values
  ('Popular Games', p.is_popular),
  ('Upcoming Games', p.is_upcoming),
  ('New on Difmark', p.is_new),
  ('Weekly Chart', p.is_weekly),
  ('Under $100', p.is_under_price and p.currency = 'USD' and p.price < 100)
) as sections(section, enabled)
group by section order by section;
