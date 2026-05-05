-- Reset password for the test admin account.
-- Run in Supabase Dashboard -> SQL Editor.
--
-- Temporary password:
--   OceniatorAdmin123!

create extension if not exists pgcrypto with schema extensions;

update auth.users
set
  encrypted_password = crypt('OceniatorAdmin123!', gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where lower(email) = lower('jakubstachura95@gmail.com');

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
