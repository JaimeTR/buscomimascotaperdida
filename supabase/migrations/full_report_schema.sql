
-- Migration: Add all missing pet detail fields for the full report page

-- 1. Add missing attributes for the details page
DO $$
BEGIN
    -- Gender
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'gender') THEN
        ALTER TABLE public.pets ADD COLUMN gender text;
    END IF;
    
    -- Age
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'age') THEN
        ALTER TABLE public.pets ADD COLUMN age text;
    END IF;
    
    -- Size (as text info)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'size') THEN
        ALTER TABLE public.pets ADD COLUMN size text;
    END IF;
    
    -- Microchip ID
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'microchip') THEN
        ALTER TABLE public.pets ADD COLUMN microchip text;
    END IF;
    
    -- Personality Traits (Array)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'personality') THEN
        ALTER TABLE public.pets ADD COLUMN personality text[];
    END IF;
    
    -- Markings / Characteristics
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'markings') THEN
        ALTER TABLE public.pets ADD COLUMN markings text;
    END IF;
    
    -- Exact Address
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_address') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_address text;
    END IF;
    
    -- Lat/Lng Coords
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_lat') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_lat float8;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_lng') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_lng float8;
    END IF;
END $$;

-- 2. Seed Data (Re-runnable)
-- Note: Replace 'TU_USER_ID' if you want to test with a real user
/*
INSERT INTO public.pets (
    owner_id, name, type, breed, gender, age, size, colors, microchip,
    status, last_seen_department, last_seen_province, last_seen_district, 
    last_seen_address, last_seen_lat, last_seen_lng, last_seen_date, 
    description, personality, markings, image_urls, is_featured
) VALUES
(
    'TU_USER_ID', 'Luna', 'dog', 'Golden Retriever', 'Hembra', '3 años', 'Grande', ARRAY['Dorado'], '9821-X34',
    'lost', 'Lima', 'Lima', 'San Isidro', 'Parque El Olivar', -12.1009, -77.0348, NOW() - INTERVAL '3 days',
    'Luna es muy amigable y juguetona. Se perdió cerca de la fuente del parque. Tiene un collar azul.',
    ARRAY['Juguetona', 'Gentil', 'Miedosa'], 'Mancha blanca en el pecho', 
    ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24'], true
),
(
    'TU_USER_ID', 'Simba', 'cat', 'Persa', 'Macho', '2 años', 'Pequeño', ARRAY['Blanco'], 'No tiene',
    'lost', 'Lima', 'Lima', 'Miraflores', 'Cerca al Malecón Armendariz', -12.1287, -77.0298, NOW() - INTERVAL '1 day',
    'Gato blanco de pelo largo, muy tranquilo. Tiene los ojos azules.',
    ARRAY['Tranquilo', 'Cariñoso'], 'Cola muy esponjosa', 
    ARRAY['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'], false
);
*/
