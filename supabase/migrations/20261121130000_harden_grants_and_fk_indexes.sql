-- Defense in depth: RLS already blocks anonymous writes, but TRUNCATE ignores RLS and the default
-- Supabase grants hand every write privilege to anon. Anonymous visitors only ever read (and call ad_click).
revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;
alter default privileges in schema public revoke insert, update, delete, truncate, references, trigger on tables from anon;
alter default privileges in schema public revoke truncate, references, trigger on tables from authenticated;

-- Foreign keys without a covering index (Supabase performance advisor).
create index if not exists admin_audit_log_admin_idx on public.admin_audit_log (admin_id);
create index if not exists ads_request_idx on public.ads (request_id);
create index if not exists promo_requests_requester_idx on public.promo_requests (requester_id);
create index if not exists sightings_reporter_idx on public.sightings (reporter_id);
