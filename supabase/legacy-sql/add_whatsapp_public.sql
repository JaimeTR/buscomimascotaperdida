-- Migration: Add whatsapp_public column to profiles table
-- Allows users to control whether their WhatsApp is publicly visible

DO $$
BEGIN
    -- Add whatsapp_public column
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'whatsapp_public') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp_public boolean DEFAULT false;
    END IF;

END $$;
