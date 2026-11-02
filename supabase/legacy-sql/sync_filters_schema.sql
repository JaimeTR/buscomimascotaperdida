
-- Migration to synchronize database with new dynamic filters

-- 1. Add missing location columns if they don't exist
do $$
begin
    if not exists (select from pg_attribute where attrelid = 'public.pets'::regclass and attname = 'last_seen_department') then
        alter table public.pets add column last_seen_department text;
    end if;
    
    if not exists (select from pg_attribute where attrelid = 'public.pets'::regclass and attname = 'last_seen_province') then
        alter table public.pets add column last_seen_province text;
    end if;
end $$;

-- 2. Add some seed data to test the new filters
-- Note: Assuming a profile with id '00000000-0000-0000-0000-000000000000' exists or owner_id should be handled.
-- For local testing, we might need a real user ID.

/*
INSERT INTO public.pets (
    owner_id, name, type, breed, colors, status, 
    last_seen_department, last_seen_province, last_seen_district, 
    last_seen_date, image_urls, is_featured
) VALUES
(
    'CURRENT_USER_ID', 'Luna', 'cat', 'Persa', ARRAY['Blanco'], 'lost',
    'Lima', 'Lima', 'Miraflores',
    NOW() - INTERVAL '2 days', ARRAY['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'], true
),
(
    'CURRENT_USER_ID', 'Toby', 'dog', 'Golden Retriever', ARRAY['Dorado'], 'lost',
    'Lima', 'Lima', 'San Isidro',
    NOW() - INTERVAL '1 day', ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d'], false
),
(
    'CURRENT_USER_ID', 'Simba', 'cat', 'Atigrado', ARRAY['Gris', 'Negro'], 'found',
    'Arequipa', 'Arequipa', 'Yanahuara',
    NOW() - INTERVAL '5 days', ARRAY['https://images.unsplash.com/photo-1513245538863-1bf50390313a'], false
);
*/
