-- Web Push: one row per browser/device a user enabled alerts on.
-- Users manage only their own rows; the server (service_role) reads them to send alerts.
create table if not exists public.push_subscriptions (
    endpoint text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    p256dh text not null,
    auth text not null,
    created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;

create policy "push_select_own" on public.push_subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "push_insert_own" on public.push_subscriptions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "push_update_own" on public.push_subscriptions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "push_delete_own" on public.push_subscriptions for delete to authenticated using (user_id = (select auth.uid()));
