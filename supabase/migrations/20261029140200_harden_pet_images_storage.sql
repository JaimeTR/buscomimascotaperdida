-- Harden existing pet-images Storage policies and limits.
-- Required for deployments that already ran create_pet_images_storage.sql.

UPDATE storage.buckets
SET
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id = 'pet-images';

DROP POLICY IF EXISTS "Authenticated users can upload pet images" ON storage.objects;

CREATE POLICY "Authenticated users can upload pet images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'pet-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their own pet images" ON storage.objects;

CREATE POLICY "Users can update their own pet images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'pet-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'pet-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own pet images" ON storage.objects;

CREATE POLICY "Users can delete their own pet images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'pet-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
