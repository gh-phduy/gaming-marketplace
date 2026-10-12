-- Run once in Supabase SQL Editor after switching to server payment recording.
-- Browsers may read their orders; only the backend service role may write them.
begin;
revoke insert, update, delete on public.orders from anon, authenticated;
drop policy if exists "orders_insert_own" on public.orders;
grant select, insert, update on public.orders to service_role;
commit;

select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'orders'
order by grantee, privilege_type;
