
-- Migration: Final sync for pets table to support enhanced reporting
DO $$
BEGIN
    -- Ensure status exists (lost, found, reunited)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'status') THEN
        ALTER TABLE public.pets ADD COLUMN status text DEFAULT 'lost';
    END IF;

    -- Ensure gender exists
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'gender') THEN
        ALTER TABLE public.pets ADD COLUMN gender text;
    END IF;

    -- Ensure size exists
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'size') THEN
        ALTER TABLE public.pets ADD COLUMN size text;
    END IF;

    -- Ensure breed exists
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'breed') THEN
        ALTER TABLE public.pets ADD COLUMN breed text;
    END IF;

    -- Ensure colors exists (as array)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'colors') THEN
        ALTER TABLE public.pets ADD COLUMN colors text[];
    END IF;

    -- Location refinement
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_department') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_department text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_province') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_province text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_address') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_address text;
    END IF;

    -- Coordination fields are already handled in previous migrations but just in case
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_lat') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_lat float8;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_lng') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_lng float8;
    END IF;

    -- Image Gallery
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'image_urls') THEN
        ALTER TABLE public.pets ADD COLUMN image_urls text[];
    END IF;

END $$;
