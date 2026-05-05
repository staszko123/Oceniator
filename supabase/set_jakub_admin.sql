-- Promote Jakub Stachura's account to Oceniator admin.
-- Run in Supabase Dashboard -> SQL Editor after the user has logged in at least once.

insert into public.profiles (id, full_name, email, role, leader_scope, is_active)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.email, 'Jakub Stachura'),
  u.email,
  'admin',
  null,
  true
from auth.users u
where lower(u.email) = lower('jakubstachura95@gmail.com')
on conflict (id) do update
set
  full_name = excluded.full_name,
  email = excluded.email,
  role = 'admin',
  leader_scope = null,
  is_active = true,
  updated_at = now();
