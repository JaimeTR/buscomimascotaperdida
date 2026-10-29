
-- Migration: Expand User Profiles with relevant data
-- This ensures we collect enough info during registration for reports.

DO $$
BEGIN
    -- Full Name
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;

    -- Phone (Standard)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;

    -- Location Data
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'department') THEN
        ALTER TABLE public.profiles ADD COLUMN department text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'province') THEN
        ALTER TABLE public.profiles ADD COLUMN province text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'district') THEN
        ALTER TABLE public.profiles ADD COLUMN district text;
    END IF;

END $$;
