-- AquaRise Stage 7E: Dedicated Supabase Storage Bucket & Hardened RLS Policies for Cleanup Banner Images
-- DO NOT execute automatically. Run manually in your Supabase SQL Editor.

-- 1. Create public storage bucket cleanup-images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cleanup-images',
  'cleanup-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Drop existing policies for cleanup-images bucket to ensure clean state
DROP POLICY IF EXISTS "Public and authenticated read cleanup images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated organizers insert own cleanup images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated organizers update own cleanup images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated organizers delete own cleanup images" ON storage.objects;

-- 3. Public Read Access for cleanup-images bucket
CREATE POLICY "Public and authenticated read cleanup images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cleanup-images');

-- 4. Authenticated Organizer Upload Policy for cleanup-images bucket
-- Object path: <organizer-user-id>/<mission-id>/<filename>
-- Validates:
--   a) Bucket is 'cleanup-images'
--   b) First path segment matches authenticated organizer user_id
--   c) Mission ID (second path segment) exists in public.community_missions and is organized by the caller
CREATE POLICY "Authenticated organizers insert own cleanup images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cleanup-images' AND
    (storage.foldername(name))[1] = (auth.uid())::text AND
    EXISTS (
      SELECT 1 FROM public.community_missions cm
      WHERE cm.id::text = (storage.foldername(name))[2]
        AND cm.organizer_id = auth.uid()
    )
  );

-- 5. Authenticated Organizer Delete Policy for cleanup-images bucket
-- Object path: <organizer-user-id>/<mission-id>/<filename>
-- Validates:
--   a) Bucket is 'cleanup-images'
--   b) First path segment matches authenticated organizer user_id
--   c) Mission ID (second path segment) exists in public.community_missions and is organized by the caller
CREATE POLICY "Authenticated organizers delete own cleanup images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cleanup-images' AND
    (storage.foldername(name))[1] = (auth.uid())::text AND
    EXISTS (
      SELECT 1 FROM public.community_missions cm
      WHERE cm.id::text = (storage.foldername(name))[2]
        AND cm.organizer_id = auth.uid()
    )
  );
