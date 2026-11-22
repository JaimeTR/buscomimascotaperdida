-- Apoyo voluntario: quien reporta una mascota (o un negocio que anuncia) puede aportar un monto libre por Yape/Plin.
-- Un administrador verifica el aporte y confirma el monto; con eso el caso sale como "destacado", ordenado de mayor a menor aporte.
-- No hay planes fijos: el monto es voluntario y solo decide el orden.

create table if not exists public.pet_boosts (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    pet_id uuid not null references public.pets (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    amount_claimed numeric(10, 2) not null check (amount_claimed > 0 and amount_claimed < 100000),
    amount_confirmed numeric(10, 2) check (amount_confirmed is null or (amount_confirmed >= 0 and amount_confirmed < 100000)),
    method text check (method is null or method in ('yape', 'plin', 'transferencia', 'otro')),
    proof_path text check (proof_path is null or char_length(proof_path) <= 300),
    note text check (note is null or char_length(note) <= 500),
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    starts_at timestamptz,
    ends_at timestamptz
);
create index if not exists pet_boosts_pet_idx on public.pet_boosts (pet_id);
create index if not exists pet_boosts_user_idx on public.pet_boosts (user_id);
create index if not exists pet_boosts_status_idx on public.pet_boosts (status, ends_at);

alter table public.pet_boosts enable row level security;

-- Cada persona solo crea aportes para sus propios reportes y siempre como "pendiente"; solo el admin cambia el estado y el monto confirmado.
create policy "boosts_insert_own" on public.pet_boosts
    for insert to authenticated
    with check (
        user_id = (select auth.uid())
        and status = 'pending'
        and amount_confirmed is null
        and exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid()))
    );
create policy "boosts_select_own_or_admin" on public.pet_boosts
    for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "boosts_admin_update" on public.pet_boosts
    for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Casos destacados: aportes aprobados y vigentes, del mayor al menor monto confirmado (y el más reciente primero en empate).
create or replace function public.featured_pets(p_limit int default 12)
returns setof public.pets
language sql
stable
security definer
set search_path = ''
as $$
    select p.*
    from public.pets p
    join (
        select pet_id, sum(coalesce(amount_confirmed, 0)) as total, max(created_at) as last_at
        from public.pet_boosts
        where status = 'approved' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
        group by pet_id
    ) b on b.pet_id = p.id
    where p.is_hidden = false and p.status in ('lost', 'found', 'in_contact')
    order by b.total desc, b.last_at desc
    limit least(greatest(p_limit, 1), 50);
$$;
revoke all on function public.featured_pets(int) from public;
grant execute on function public.featured_pets(int) to anon, authenticated;

-- Comprobantes de aportes: bucket privado; cada persona sube a su carpeta y solo los administradores los ven.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('boost-proofs', 'boost-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;
create policy "boost_proofs_insert_own" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'boost-proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "boost_proofs_admin_read" on storage.objects
    for select to authenticated using (bucket_id = 'boost-proofs' and (select public.is_admin()));

-- Anuncios de negocios: el aporte voluntario confirmado decide el orden (sin planes fijos).
alter table public.ads add column if not exists amount numeric(10, 2) not null default 0;
alter table public.promo_requests add column if not exists amount numeric(10, 2) check (amount is null or (amount >= 0 and amount < 100000));

-- Apoyo mensual voluntario (se coordina por correo; no hay cobro automático).
alter table public.contact_messages add column if not exists monthly boolean not null default false;
