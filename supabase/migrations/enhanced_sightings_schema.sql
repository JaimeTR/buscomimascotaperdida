-- Migration: Enhanced Sightings Schema
-- Adds location details, contact sharing preferences, and coordinates to sightings table

DO $$
BEGIN
    -- Add department column
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'department') THEN
        ALTER TABLE public.sightings ADD COLUMN department text;
    END IF;

    -- Add province column
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'province') THEN
        ALTER TABLE public.sightings ADD COLUMN province text;
    END IF;

    -- Add lat/lng coordinates (more practical than PostGIS point for this use case)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'lat') THEN
        ALTER TABLE public.sightings ADD COLUMN lat float8;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'lng') THEN
        ALTER TABLE public.sightings ADD COLUMN lng float8;
    END IF;

    -- Add contact sharing preferences
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'share_phone') THEN
        ALTER TABLE public.sightings ADD COLUMN share_phone boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'share_email') THEN
        ALTER TABLE public.sightings ADD COLUMN share_email boolean DEFAULT false;
    END IF;

    -- Add WhatsApp sharing preference
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'share_whatsapp') THEN
        ALTER TABLE public.sightings ADD COLUMN share_whatsapp boolean DEFAULT false;
    END IF;

    -- Ensure image_url exists (should already exist from base schema)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'image_url') THEN
        ALTER TABLE public.sightings ADD COLUMN image_url text;
    END IF;

END $$;
