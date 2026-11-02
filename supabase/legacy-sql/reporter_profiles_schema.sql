
-- Migration: Add reporter contact preferences and seed sightings

-- 1. Update Profiles with contact info
DO $$
BEGIN
    -- WhatsApp
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'whatsapp') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp text;
    END IF;
    
    -- Instagram
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'instagram') THEN
        ALTER TABLE public.profiles ADD COLUMN instagram text;
    END IF;
    
    -- Facebook URL
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'facebook_url') THEN
        ALTER TABLE public.profiles ADD COLUMN facebook_url text;
    END IF;

    -- Privacy toggles
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'phone_public') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_public boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'email_public') THEN
        ALTER TABLE public.profiles ADD COLUMN email_public boolean DEFAULT false;
    END IF;
    -- Lat/Lng Coords
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'lat') THEN
        ALTER TABLE public.sightings ADD COLUMN lat float8;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.sightings'::regclass AND attname = 'lng') THEN
        ALTER TABLE public.sightings ADD COLUMN lng float8;
    END IF;
END $$;

-- 2. Seed Sightings (Example data)
-- Note: Replace PET_ID and REPORTER_ID with real UUIDs from your DB if testing manually.
/*
INSERT INTO public.sightings (
    pet_id, reporter_id, district, description, image_url, created_at
) VALUES
(
    'PET_ID_HERE', 'REPORTER_ID_1', 'San Isidro', 
    'Vi un perro parecido corriendo cerca de la Av. Arequipa. Parecía asustado.', 
    'https://images.unsplash.com/photo-1544568100-847a948585b9', NOW() - INTERVAL '1 hour'
),
(
    'PET_ID_HERE', 'REPORTER_ID_2', 'Lince', 
    'Estaba husmeando cerca de un puesto de comida en el mercado de Lince.', 
    NULL, NOW() - INTERVAL '3 hours'
);
*/
