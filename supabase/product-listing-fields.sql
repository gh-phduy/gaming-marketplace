-- Preserve the edition and delivery selected in the seller's listing form.
begin;
alter table public.products
  add column if not exists edition text not null default 'Standard',
  add column if not exists delivery text not null default 'Instant';

-- Upgrade old listings that stored UI labels instead of catalog codes.
update public.products set currency = case currency
  when '$' then 'USD' when '€' then 'EUR' when '£' then 'GBP' when '¥' then 'JPY'
  else currency end where currency in ('$', '€', '£', '¥');
update public.products set category = case category
  when 'Product key' then 'game-keys' when 'Gift card' then 'gift-cards'
  when 'Game currency' then 'game-currency' when 'Game account' then 'game-accounts'
  when 'Game item' then 'game-items' when 'Software license' then 'software'
  when 'Power leveling' then 'power-leveling' else category end
where category in ('Product key','Gift card','Game currency','Game account','Game item','Software license','Power leveling');

notify pgrst, 'reload schema';
commit;
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'products'
  and column_name in ('edition','delivery') order by column_name;
