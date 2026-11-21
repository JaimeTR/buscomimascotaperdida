-- Casos de éxito: el dueño cuenta cómo fue el reencuentro (foto + relato) y decide si se publica.
alter table public.pets add column if not exists reunited_at timestamptz;
alter table public.pets add column if not exists reunion_story text check (reunion_story is null or char_length(reunion_story) <= 1500);
alter table public.pets add column if not exists reunion_images text[] check (reunion_images is null or cardinality(reunion_images) <= 4);
alter table public.pets add column if not exists reunion_public boolean not null default false;
-- Último recordatorio "¿ya apareció?" enviado/pospuesto, para no insistir.
alter table public.pets add column if not exists reminded_at timestamptz;

create index if not exists pets_reunion_public_idx on public.pets (reunited_at desc) where status = 'reunited' and reunion_public;

-- reunited_at se completa solo al pasar a "reunited", sea cual sea el camino (dueño, admin).
create or replace function public.set_reunited_at()
returns trigger language plpgsql set search_path = '' as $$
begin
    if new.status = 'reunited' and (tg_op = 'INSERT' or old.status is distinct from 'reunited') and new.reunited_at is null then
        new.reunited_at := now();
    end if;
    return new;
end;
$$;
drop trigger if exists pets_set_reunited_at on public.pets;
create trigger pets_set_reunited_at before insert or update of status on public.pets
    for each row execute function public.set_reunited_at();
