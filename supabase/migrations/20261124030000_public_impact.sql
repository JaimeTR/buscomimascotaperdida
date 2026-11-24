-- Cifras públicas de transparencia: solo conteos y totales, sin datos personales.
create or replace function public.public_impact()
returns json language sql stable security definer set search_path = public as $$
    select json_build_object(
        'reports', (select count(*) from public.pets where not is_hidden and source_url is null),
        'reunited', (select count(*) from public.pets where status = 'reunited' and not is_hidden),
        'supporters', (select count(distinct user_id) from public.pet_boosts where status = 'approved'),
        'support_total', (select coalesce(sum(amount_confirmed), 0) from public.pet_boosts where status = 'approved')
    );
$$;
revoke all on function public.public_impact() from public;
grant execute on function public.public_impact() to anon, authenticated;
