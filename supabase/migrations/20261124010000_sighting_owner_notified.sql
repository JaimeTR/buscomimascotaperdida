-- Evita avisar dos veces al dueño por el mismo avistamiento.
alter table public.sightings add column if not exists owner_notified_at timestamptz;
