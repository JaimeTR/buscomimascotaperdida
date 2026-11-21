-- Promociones: solicitudes (anuncio / aliado / voluntario), anuncios publicados y aliados.
-- Lectura pública solo de lo activo; todo lo demás, solo administradores (public.is_admin()).

-- ───────────── solicitudes ─────────────
create table if not exists public.promo_requests (
    id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references auth.users(id) on delete cascade,
    kind text not null check (kind in ('anuncio', 'aliado', 'voluntario')),
    plan text check (plan in ('basico', 'destacado', 'premium')),
    business_name text not null check (char_length(business_name) between 2 and 120),
    contact_name text not null check (char_length(contact_name) between 2 and 120),
    email text not null check (char_length(email) between 5 and 160),
    phone text check (phone is null or char_length(phone) <= 30),
    link_url text check (link_url is null or link_url ~ '^https://'),
    message text check (message is null or char_length(message) <= 1000),
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz not null default now()
);
alter table public.promo_requests enable row level security;
create index if not exists promo_requests_status_idx on public.promo_requests (status, created_at desc);

create policy "promo_requests_insert_own" on public.promo_requests
    for insert to authenticated with check (requester_id = (select auth.uid()) and status = 'pending');
create policy "promo_requests_select_own_or_admin" on public.promo_requests
    for select to authenticated using (requester_id = (select auth.uid()) or public.is_admin());
create policy "promo_requests_admin_update" on public.promo_requests
    for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "promo_requests_admin_delete" on public.promo_requests
    for delete to authenticated using (public.is_admin());

-- ───────────── anuncios ─────────────
create table if not exists public.ads (
    id uuid primary key default gen_random_uuid(),
    request_id uuid references public.promo_requests(id) on delete set null,
    advertiser text not null check (char_length(advertiser) between 2 and 120),
    title text not null check (char_length(title) between 3 and 90),
    body text check (body is null or char_length(body) <= 280),
    image_url text check (image_url is null or image_url ~ '^(https://|/)'),
    link_url text not null check (link_url ~ '^https://'),
    cta_label text not null default 'Conocer más' check (char_length(cta_label) <= 30),
    placements text[] not null default array['ads_page']
        check (placements <@ array['home_banner', 'detail_sidebar', 'listing_inline', 'ads_page']),
    status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
    starts_at timestamptz not null default now(),
    ends_at timestamptz not null default (now() + interval '30 days'),
    clicks bigint not null default 0,
    created_at timestamptz not null default now()
);
alter table public.ads enable row level security;
create index if not exists ads_active_idx on public.ads (status, starts_at, ends_at);

create policy "ads_select_active" on public.ads
    for select to anon, authenticated
    using (status = 'active' and now() between starts_at and ends_at);
create policy "ads_admin_all" on public.ads
    for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Un clic suma 1 y devuelve el destino; solo funciona con anuncios activos y vigentes.
create or replace function public.ad_click(p_id uuid)
returns text
language sql
security definer
set search_path = ''
as $$
    update public.ads
       set clicks = clicks + 1
     where id = p_id and status = 'active' and now() between starts_at and ends_at
    returning link_url;
$$;
revoke all on function public.ad_click(uuid) from public;
grant execute on function public.ad_click(uuid) to anon, authenticated;

-- ───────────── aliados ─────────────
create table if not exists public.partners (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 2 and 120),
    kind text not null default 'empresa' check (kind in ('empresa', 'persona', 'veterinaria', 'refugio', 'medio')),
    description text check (description is null or char_length(description) <= 280),
    logo_url text check (logo_url is null or logo_url ~ '^(https://|/)'),
    website_url text check (website_url is null or website_url ~ '^https://'),
    city text check (city is null or char_length(city) <= 80),
    is_active boolean not null default true,
    sort integer not null default 0,
    created_at timestamptz not null default now()
);
alter table public.partners enable row level security;

create policy "partners_select_active" on public.partners
    for select to anon, authenticated using (is_active);
create policy "partners_admin_all" on public.partners
    for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Rollback: drop function public.ad_click; drop table public.partners, public.ads, public.promo_requests;
