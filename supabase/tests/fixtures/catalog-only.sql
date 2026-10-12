-- Test fixture for upgrading the earlier catalog-only schema. Use setup.sql instead.
-- Prices are intentionally unset and the eight image entries are drafts.
-- This sets up the product catalog only. The public.users seller relationship,
-- orders, chat tables, and payment functions must be configured separately.
begin;

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

create index if not exists products_popular_sort_idx
  on public.products (sort_order) where is_popular and status = 'published';
create index if not exists products_seller_updated_idx
  on public.products (seller_id, updated_at desc);

create or replace function public.products_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.products_touch_updated_at();

alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;

drop policy if exists "products_read_published" on public.products;
create policy "products_read_published"
on public.products for select to anon, authenticated
using (status = 'published');

drop policy if exists "products_seller_read" on public.products;
create policy "products_seller_read"
on public.products for select to authenticated
using (seller_id = (select auth.uid()));

drop policy if exists "products_seller_insert" on public.products;
create policy "products_seller_insert"
on public.products for insert to authenticated
with check (seller_id = (select auth.uid()));

drop policy if exists "products_seller_update" on public.products;
create policy "products_seller_update"
on public.products for update to authenticated
using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));

drop policy if exists "products_seller_delete" on public.products;
create policy "products_seller_delete"
on public.products for delete to authenticated
using (seller_id = (select auth.uid()));

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

commit;

-- Confirm that the eight draft entries were inserted.
select id, title, price, status, is_popular, sort_order
from public.products
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006',
  '10000000-0000-4000-8000-000000000007',
  '10000000-0000-4000-8000-000000000008'
)
order by sort_order;
