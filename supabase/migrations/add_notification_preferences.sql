-- Migration: Add notification preferences and location coordinates to profiles

DO $$
BEGIN
    -- Add latitude for notification area
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'notification_lat') THEN
        ALTER TABLE public.profiles ADD COLUMN notification_lat double precision;
    END IF;

    -- Add longitude for notification area
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'notification_lng') THEN
        ALTER TABLE public.profiles ADD COLUMN notification_lng double precision;
    END IF;

    -- Add notification enabled/disabled flag
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'notifications_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN notifications_enabled boolean DEFAULT true;
    END IF;

    -- Add notification radius in km (default 5km)
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'notification_radius_km') THEN
        ALTER TABLE public.profiles ADD COLUMN notification_radius_km integer DEFAULT 5;
    END IF;

END $$;

-- Create an index on coordinates for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_notification_location 
ON public.profiles (notification_lat, notification_lng) 
WHERE notification_lat IS NOT NULL AND notification_lng IS NOT NULL;
