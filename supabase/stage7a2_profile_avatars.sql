-- ============================================================================
-- AQUARISE STAGE 7A.2: PUBLIC AVATARS SUPABASE STORAGE BUCKET & RLS POLICIES
-- ============================================================================
-- IMPORTANT: DO NOT execute this file automatically.
-- This script must be executed manually in the Supabase SQL Editor by the project owner.
-- ============================================================================

-- 1. Create/Configure Public 'avatars' Bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB limit (5,242,880 bytes)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage RLS Security Policies for 'avatars' Bucket

-- Policy A: Anyone can view public avatar objects in the 'avatars' bucket
DROP POLICY IF EXISTS "Public read for avatars objects" ON storage.objects;
CREATE POLICY "Public read for avatars objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
  );

-- Policy B: Authenticated users can upload avatar objects ONLY inside their own user folder (<auth.uid()>/...)
DROP POLICY IF EXISTS "Authenticated users can upload avatar objects" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatar objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy C: Authenticated users can update ONLY avatar objects inside their own user folder (<auth.uid()>/...)
DROP POLICY IF EXISTS "Authenticated users can update own avatar objects" ON storage.objects;
CREATE POLICY "Authenticated users can update own avatar objects"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy D: Authenticated users can delete ONLY avatar objects inside their own user folder (<auth.uid()>/...)
DROP POLICY IF EXISTS "Authenticated users can delete own avatar objects" ON storage.objects;
CREATE POLICY "Authenticated users can delete own avatar objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
