alter table public.profiles enable row level security;
alter table public.skulls enable row level security;
alter table public.notification_templates enable row level security;

-- Helper: returns true if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public, pg_catalog;

-- Profiles: users see own; admins see all
create policy "users read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'client');

create policy "admins update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "admins insert profiles"
  on public.profiles for insert
  with check (public.is_admin());

-- Skulls: clients read own; admins do everything
create policy "clients read own skulls"
  on public.skulls for select
  using (client_id = auth.uid() or public.is_admin());

create policy "admins insert skulls"
  on public.skulls for insert
  with check (public.is_admin());

create policy "admins update skulls"
  on public.skulls for update
  using (public.is_admin());

create policy "admins delete skulls"
  on public.skulls for delete
  using (public.is_admin());

-- Notification templates: admins only
create policy "admins manage templates"
  on public.notification_templates for all
  using (public.is_admin());
