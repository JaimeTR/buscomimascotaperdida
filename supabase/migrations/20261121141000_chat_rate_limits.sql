-- Rate limiting compartido entre instancias (el límite en memoria no sirve en serverless).
-- Solo el servidor (service_role) puede llamarlo; la tabla no tiene políticas, así que nadie más la ve.
create table if not exists public.chat_rate_limits (
    key text primary key,
    window_start timestamptz not null default now(),
    hits int not null default 0
);
alter table public.chat_rate_limits enable row level security;

create or replace function public.chat_rate_hit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_hits int;
begin
    insert into public.chat_rate_limits as r (key, window_start, hits)
    values (p_key, now(), 1)
    on conflict (key) do update
        set window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end,
            hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end
    returning hits into v_hits;

    -- limpieza barata de claves viejas (1 de cada ~50 llamadas)
    if random() < 0.02 then
        delete from public.chat_rate_limits where window_start < now() - interval '1 day';
    end if;
    return v_hits <= p_max;
end;
$$;
revoke all on function public.chat_rate_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.chat_rate_hit(text, int, int) to service_role;
