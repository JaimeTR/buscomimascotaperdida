-- Base schema (consolidates the previously unversioned tables + the legacy ad-hoc migrations
-- now in supabase/legacy-sql). RLS is enabled everywhere; contact data is NOT publicly readable.

-- ───────────── profiles ─────────────
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    avatar_url text,
    phone text,
    whatsapp text,
    instagram text,
    facebook_url text,
    department text,
    province text,
    district text,
    phone_public boolean not null default false,
    email_public boolean not null default false,
    whatsapp_public boolean not null default false,
    notifications_enabled boolean not null default true,
    notification_lat double precision,
    notification_lng double precision,
    notification_radius_km integer not null default 5,
    created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create index if not exists idx_profiles_notification_location
    on public.profiles (notification_lat, notification_lng)
    where notification_lat is not null and notification_lng is not null;

-- Only the owner reads/writes their own profile. Public contact goes through pet_contact_info().
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated
    using (id = (select auth.uid())) with check (id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
    on conflict (id) do nothing;
    return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
    for each row execute function public.handle_new_user();

-- ───────────── pets ─────────────
create table if not exists public.pets (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references public.profiles(id) on delete cascade,
    name text,
    type text not null check (type in ('dog', 'cat', 'other')),
    breed text,
    gender text,
    age text,
    size text,
    colors text[],
    microchip text,
    personality text[],
    markings text,
    description text,
    status text not null default 'lost'
        check (status in ('lost', 'found', 'in_contact', 'reunited', 'paused', 'closed')),
    last_seen_department text,
    last_seen_province text,
    last_seen_district text,
    last_seen_address text,
    last_seen_lat float8,
    last_seen_lng float8,
    last_seen_date timestamptz not null default now(),
    image_urls text[],
    is_featured boolean not null default false,
    created_at timestamptz not null default now()
);
alter table public.pets enable row level security;
create index if not exists pets_type_idx on public.pets (type);
create index if not exists pets_district_idx on public.pets (last_seen_district);

create policy "pets_select_public" on public.pets for select to anon, authenticated using (true);
create policy "pets_insert_own" on public.pets for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "pets_update_own" on public.pets for update to authenticated
    using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "pets_delete_own" on public.pets for delete to authenticated using (owner_id = (select auth.uid()));

-- ───────────── sightings ─────────────
create table if not exists public.sightings (
    id uuid primary key default gen_random_uuid(),
    pet_id uuid not null references public.pets(id) on delete cascade,
    reporter_id uuid not null references public.profiles(id) on delete cascade,
    description text,
    department text,
    province text,
    district text,
    lat float8,
    lng float8,
    image_url text,
    share_phone boolean not null default false,
    share_email boolean not null default false,
    share_whatsapp boolean not null default false,
    created_at timestamptz not null default now()
);
alter table public.sightings enable row level security;
create index if not exists sightings_pet_idx on public.sightings (pet_id, created_at desc);

create policy "sightings_select_public" on public.sightings for select to anon, authenticated using (true);
create policy "sightings_insert_own" on public.sightings for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "sightings_delete_own" on public.sightings for delete to authenticated using (reporter_id = (select auth.uid()));

-- ───────────── public contact (respects the *_public / share_* flags) ─────────────
create or replace function public.pet_contact_info(p_pet uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select jsonb_build_object(
        'owner', (
            select jsonb_build_object(
                'full_name', pr.full_name,
                'avatar_url', pr.avatar_url,
                'phone', case when pr.phone_public then pr.phone end,
                'whatsapp', case when pr.whatsapp_public then pr.whatsapp end,
                'email', case when pr.email_public then pr.email end
            )
            from public.pets p join public.profiles pr on pr.id = p.owner_id
            where p.id = p_pet
        ),
        'sightings', coalesce((
            select jsonb_agg(to_jsonb(s) || jsonb_build_object(
                'reporter', jsonb_build_object(
                    'full_name', pr.full_name,
                    'avatar_url', pr.avatar_url,
                    'phone', case when s.share_phone then pr.phone end,
                    'whatsapp', case when s.share_whatsapp then pr.whatsapp end,
                    'email', case when s.share_email then pr.email end
                )
            ) order by s.created_at desc)
            from public.sightings s join public.profiles pr on pr.id = s.reporter_id
            where s.pet_id = p_pet
        ), '[]'::jsonb)
    );
$$;
revoke all on function public.pet_contact_info(uuid) from public;
grant execute on function public.pet_contact_info(uuid) to anon, authenticated;

-- ───────────── storage bucket (insert/update/delete policies + limits: 20261029140200) ─────────────
insert into storage.buckets (id, name, public)
values ('pet-images', 'pet-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view pet images" on storage.objects;
create policy "Anyone can view pet images" on storage.objects for select to public
    using (bucket_id = 'pet-images');
