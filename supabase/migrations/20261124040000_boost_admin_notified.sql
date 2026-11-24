-- Evita avisar dos veces al equipo por el mismo aporte.
alter table public.pet_boosts add column if not exists admin_notified_at timestamptz;
