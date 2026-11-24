-- Panel del aliado: un aliado puede tener un responsable (usuario) que ve cuántas visitas y clics recibe su ficha.
alter table public.partners add column if not exists owner_id uuid references auth.users (id) on delete set null;
create index if not exists partners_owner_idx on public.partners (owner_id) where owner_id is not null;

create table if not exists public.partner_stats (
    partner_id uuid not null references public.partners (id) on delete cascade,
    day date not null default current_date,
    views integer not null default 0,
    clicks integer not null default 0,
    primary key (partner_id, day)
);
alter table public.partner_stats enable row level security;

-- Solo el responsable del aliado (o un admin) puede leer sus cifras. Nadie escribe directo: se cuenta con partner_hit().
create policy "partner_stats_select_owner" on public.partner_stats
    for select to authenticated
    using ((select public.is_admin()) or exists (select 1 from public.partners p where p.id = partner_id and p.owner_id = (select auth.uid())));

create or replace function public.partner_hit(p_partner uuid, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
    if p_kind not in ('view', 'click') then return; end if;
    if not exists (select 1 from public.partners where id = p_partner and is_active) then return; end if;
    insert into public.partner_stats (partner_id, day, views, clicks)
    values (p_partner, current_date, (p_kind = 'view')::int, (p_kind = 'click')::int)
    on conflict (partner_id, day) do update
        set views = public.partner_stats.views + excluded.views, clicks = public.partner_stats.clicks + excluded.clicks;
end $$;
revoke all on function public.partner_hit(uuid, text) from public;
grant execute on function public.partner_hit(uuid, text) to anon, authenticated;

-- El responsable ve su propio aliado aunque esté oculto.
create policy "partners_select_owner" on public.partners
    for select to authenticated using (owner_id = (select auth.uid()));

-- Asignar responsable por correo (solo admin). Devuelve false si el correo no tiene cuenta.
create or replace function public.admin_set_partner_owner(p_partner uuid, p_email text)
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
    if not public.is_admin() then raise exception 'forbidden'; end if;
    if coalesce(trim(p_email), '') = '' then
        update public.partners set owner_id = null where id = p_partner; return true;
    end if;
    select id into uid from public.profiles where lower(email) = lower(trim(p_email)) limit 1;
    if uid is null then return false; end if;
    update public.partners set owner_id = uid where id = p_partner;
    return true;
end $$;
revoke all on function public.admin_set_partner_owner(uuid, text) from public;
grant execute on function public.admin_set_partner_owner(uuid, text) to authenticated;
