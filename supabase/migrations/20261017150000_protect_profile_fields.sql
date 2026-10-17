-- Protect sensitive profile fields from non-admin self-updates.
--
-- The "Users can update own profile" UPDATE policy has no WITH CHECK, so any
-- authenticated user could change their own role (e.g. to admin), is_vip,
-- is_walkin or internal_notes. A policy cannot compare OLD vs NEW values, so
-- this trigger rejects those changes unless the caller is an admin, the
-- dashboard (auth.uid() is null) or the service role.
--
-- Applied manually in the Supabase SQL Editor on 2026-10-17; this migration
-- keeps the change in version control. Idempotent: safe to re-run.

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if auth.uid() is not null and public.get_my_role() <> 'admin' then
    if new.role is distinct from old.role
       or new.is_vip is distinct from old.is_vip
       or new.is_walkin is distinct from old.is_walkin
       or new.internal_notes is distinct from old.internal_notes then
      raise exception 'Not allowed to change protected profile fields';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields_trg on public.profiles;

create trigger protect_profile_fields_trg
before update on public.profiles
for each row execute function public.protect_profile_fields();
