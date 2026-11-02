
-- Migration: Fix pets_owner_id_fkey constraint violation
-- This script ensures all existing users have a profile and the trigger is correctly set up.

-- 1. Ensure handle_new_user function is optimized and secure
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing; -- Prevent errors if profile already exists
  return new;
end;
$$ language plpgsql security definer;

-- 2. Ensure the trigger is active
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. HEAL: Create profiles for any existing users who are missing one
-- This is the most important part to fix the current error
insert into public.profiles (id, email, full_name, avatar_url)
select 
    id, 
    email, 
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- 4. Verify RLS (just in case)
alter table public.profiles enable row level security;
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile') then
        create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can update own profile') then
        create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
    end if;
end $$;
