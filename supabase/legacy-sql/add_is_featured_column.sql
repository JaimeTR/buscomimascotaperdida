-- Migration: Add is_featured column to pets table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'is_featured') THEN
        ALTER TABLE public.pets ADD COLUMN is_featured boolean DEFAULT false;
    END IF;
END $$;
