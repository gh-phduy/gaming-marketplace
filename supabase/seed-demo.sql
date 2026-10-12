-- Run this entire file in the new project's SQL Editor, after setup.sql.
-- Creates one display-only demo seller and publishes the eight known image rows.
-- Prices and stock are sample data. This seller has no login credentials.
-- Fixed IDs make reruns update these same demo rows instead of duplicating them.
begin;

do $$
begin
  if exists (
    select 1 from auth.users
    where id = '30000000-0000-4000-8000-000000000001'
      and raw_user_meta_data ->> 'demo_seed' is distinct from 'popular-games-v1'
  ) then
    raise exception 'Demo seller ID already belongs to another account';
  end if;
  if exists (
    select 1 from auth.users
    where lower(email) = 'demo-seller@example.invalid'
      and id <> '30000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'Demo email already belongs to another account';
  end if;
  if exists (
    select 1 from public.products
    where id in (
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000004',
      '10000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000006',
      '10000000-0000-4000-8000-000000000007',
      '10000000-0000-4000-8000-000000000008'
    ) and seller_id is not null
      and seller_id <> '30000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'A seed product already belongs to another seller';
  end if;
end;
$$;

-- An Auth row is required by public.users' foreign key. No password or identity
-- is created, and sign-in is disabled for this display-only demo account.
insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  banned_until, created_at, updated_at
)
values (
  '30000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'demo-seller@example.invalid',
  '{}'::jsonb,
  '{"display_name":"Demo Game Store","avatar_url":"/avt-placeholder.jpg","demo_seed":"popular-games-v1"}'::jsonb,
  'infinity'::timestamptz, now(), now()
)
on conflict (id) do nothing;

insert into public.users (id, email, display_name, avatar_url)
values (
  '30000000-0000-4000-8000-000000000001',
  'demo-seller@example.invalid', 'Demo Game Store', '/avt-placeholder.jpg'
)
on conflict (id) do update set
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url;

insert into public.products (
  id, seller_id, title, description, price, currency, category, platform,
  region, stock, image_url, status, is_popular, sort_order
)
select
  catalog.id::uuid, '30000000-0000-4000-8000-000000000001'::uuid,
  catalog.title,
  'Demo listing for testing the marketplace UI. Price and stock are sample data; no game key is supplied.',
  catalog.price, 'USD', 'game-keys', 'PC', 'Global', 10,
  'https://pcbxvswjcjdmelwznarp.supabase.co/storage/v1/object/public/Image/popular_game/' || catalog.filename,
  'published', true, catalog.sort_order
from (values
  ('10000000-0000-4000-8000-000000000001', '007 First Light', 39.99,
   '007-first-light-pc_icon-455x325_1.jpg', 1),
  ('10000000-0000-4000-8000-000000000002', 'Control Resonant', 29.99,
   'control-resonant-pc_icon-455x325_2.jpg', 2),
  ('10000000-0000-4000-8000-000000000003', 'EA Sports FC 27', 49.99,
   'ea-sports-fc-27-pc_icon-455x325_1.jpg', 3),
  ('10000000-0000-4000-8000-000000000004', 'Onimusha: Way of the Sword', 44.99,
   'onimusha-way-of-the-sword-pc_icon-455x325_2.jpg', 4),
  ('10000000-0000-4000-8000-000000000005', 'Silent Hill: Townfall', 34.99,
   'silent-hill-townfall-pc_icon-455x325_1.jpg', 5),
  ('10000000-0000-4000-8000-000000000006', 'Star Wars: Galactic Racer', 39.99,
   'star-wars-galactic-racer-pc_icon-455x325_3.jpg', 6),
  ('10000000-0000-4000-8000-000000000007', 'The Blood of Dawnwalker', 54.99,
   'the-blood-of-dawnwalker-pc_icon-455x325_2.jpg', 7),
  ('10000000-0000-4000-8000-000000000008', 'Wardogs', 24.99,
   'wardogs-pc_icon-455x325_2.jpg', 8)
) as catalog(id, title, price, filename, sort_order)
on conflict (id) do update set
  seller_id = excluded.seller_id,
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  category = excluded.category,
  platform = excluded.platform,
  region = excluded.region,
  stock = excluded.stock,
  image_url = excluded.image_url,
  status = excluded.status,
  is_popular = excluded.is_popular,
  sort_order = excluded.sort_order;

commit;

-- Expect eight rows, all published and popular, with the same demo seller.
select p.title, p.price, p.currency, p.is_popular, p.status,
  u.display_name as seller, p.image_url
from public.products p
join public.users u on u.id = p.seller_id
where p.seller_id = '30000000-0000-4000-8000-000000000001'
  and p.is_popular = true and p.status = 'published'
order by p.sort_order;
