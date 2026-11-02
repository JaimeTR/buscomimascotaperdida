-- Admin role, moderation flag and audit log.
-- Additive only: does not edit previously applied migrations.
-- Grant admin manually (SQL editor / service role), never from the client:
--   insert into public.admin_users (user_id) values ('<auth user uuid>');

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- SECURITY DEFINER so policies can check the role without exposing the table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
-- anon too: the restrictive pets SELECT policy below evaluates it for every role (returns false for anon).
grant execute on function public.is_admin() to anon, authenticated;

-- A user may only see their own row; nobody can write from the client.
drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self" on public.admin_users
    for select to authenticated using (user_id = (select auth.uid()));

-- Moderation flag on reports.
alter table public.pets add column if not exists is_hidden boolean not null default false;
create index if not exists pets_status_created_idx on public.pets (status, created_at desc);
create index if not exists pets_owner_idx on public.pets (owner_id);
create index if not exists pets_hidden_idx on public.pets (is_hidden) where is_hidden;

-- Restrictive: applies on top of whatever permissive SELECT policies already exist.
drop policy if exists "pets_hidden_only_owner_or_admin" on public.pets;
create policy "pets_hidden_only_owner_or_admin" on public.pets
    as restrictive for select
    using (is_hidden = false or owner_id = (select auth.uid()) or public.is_admin());

-- Admins can moderate (update/delete) any report.
drop policy if exists "pets_admin_update" on public.pets;
create policy "pets_admin_update" on public.pets
    for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "pets_admin_delete" on public.pets;
create policy "pets_admin_delete" on public.pets
    for delete to authenticated using (public.is_admin());

-- Admins can list users (read-only; roles are granted via SQL only).
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
    for select to authenticated using (public.is_admin());

-- Audit log: only admins read/insert, and only as themselves. No update/delete.
create table if not exists public.admin_audit_log (
    id bigint generated always as identity primary key,
    admin_id uuid not null references auth.users(id),
    action text not null,
    target_type text not null,
    target_id text not null,
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
create index if not exists admin_audit_created_idx on public.admin_audit_log (created_at desc);

drop policy if exists "audit_admin_select" on public.admin_audit_log;
create policy "audit_admin_select" on public.admin_audit_log
    for select to authenticated using (public.is_admin());
drop policy if exists "audit_admin_insert" on public.admin_audit_log;
create policy "audit_admin_insert" on public.admin_audit_log
    for insert to authenticated with check (public.is_admin() and admin_id = (select auth.uid()));

-- Rollback:
--   drop policy ... ; drop table public.admin_audit_log; alter table public.pets drop column is_hidden;
--   drop function public.is_admin(); drop table public.admin_users;
