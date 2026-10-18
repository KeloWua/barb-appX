-- Let admins create, edit and deactivate services from the app (admin panel).
--
-- Adds a single admin-only policy on public.services. Existing policies (for
-- example the public read of active services used by the booking flow) are
-- NOT touched, so clients keep seeing only what they saw before. Services are
-- deactivated (is_active = false), never deleted, because appointments
-- reference them.
--
-- Idempotent: safe to re-run.

alter table public.services enable row level security;

drop policy if exists "Admin full access services" on public.services;

create policy "Admin full access services"
  on public.services
  for all
  to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');
