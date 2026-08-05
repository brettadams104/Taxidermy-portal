-- Replace admin profile update policy to add WITH CHECK preventing role escalation
drop policy if exists "admins update any profile" on public.profiles;

create policy "admins update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin() and role in ('admin', 'client'));
