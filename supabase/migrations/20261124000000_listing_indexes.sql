-- Rendimiento: índices para el listado público, coincidencias y "otras alertas en la zona".
create index if not exists pets_listing_idx on public.pets (created_at desc, id) where not is_hidden;
create index if not exists pets_match_idx on public.pets (type, status, last_seen_date desc) where not is_hidden;
create index if not exists pets_zone_idx on public.pets (last_seen_district, type) where not is_hidden;
