-- Reports imported from public sources (news, shelters). They have no owner account:
-- the original source link is the only contact path, and no personal data is stored.
alter table public.pets alter column owner_id drop not null;
alter table public.pets add column if not exists source_url text;
alter table public.pets add column if not exists source_name text;

alter table public.pets drop constraint if exists pets_owner_or_source;
alter table public.pets add constraint pets_owner_or_source
    check (owner_id is not null or (source_url is not null and source_url ~ '^https://'));

-- Idempotent re-imports: one row per source link.
create unique index if not exists pets_source_url_key on public.pets (source_url) where source_url is not null;
