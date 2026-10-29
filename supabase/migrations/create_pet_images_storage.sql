-- Migration: Create storage bucket for pet images

-- 1. Create storage bucket for pet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload pet images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pet-images');

-- 3. Allow public read access to pet images
CREATE POLICY "Anyone can view pet images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-images');

-- 4. Allow users to update their own pet images
CREATE POLICY "Users can update their own pet images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. Allow users to delete their own pet images
CREATE POLICY "Users can delete their own pet images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-images' AND (storage.foldername(name))[1] = auth.uid()::text);
