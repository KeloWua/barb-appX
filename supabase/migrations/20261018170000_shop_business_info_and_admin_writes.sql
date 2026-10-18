-- First-run setup: business info on shop_settings + admin write access.
-- Idempotent: safe to re-run.

alter table public.shop_settings add column if not exists business_name text;
alter table public.shop_settings add column if not exists phone text;
alter table public.shop_settings add column if not exists email text;
alter table public.shop_settings add column if not exists address text;

-- Admins can create/update shop settings (read policy "shop_settings_read" stays).
drop policy if exists "shop_settings_admin_write" on public.shop_settings;
create policy "shop_settings_admin_write"
  on public.shop_settings
  for all
  to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- Admins can create/edit barbers (setup step 2). Existing barber policies stay.
alter table public.barbers enable row level security;
drop policy if exists "barbers_admin_write" on public.barbers;
create policy "barbers_admin_write"
  on public.barbers
  for all
  to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');
