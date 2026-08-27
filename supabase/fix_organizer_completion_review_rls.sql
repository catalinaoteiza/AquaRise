-- ============================================================================
-- AQUARISE TARGETED SQL MIGRATION: ORGANIZER COMPLETION REVIEW RLS FIX
-- ============================================================================
-- IMPORTANT: Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This migration updates RLS policies so cleanup mission organizers can view,
-- review, and verify completion evidence submitted by participants on their missions.
-- ============================================================================

-- 1. Helper Function: Is Mission Organizer or Global Reviewer
CREATE OR REPLACE FUNCTION public.is_mission_organizer_or_reviewer(p_mission_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Check if user is an active global completion reviewer
  IF EXISTS (
    SELECT 1
    FROM public.completion_reviewers
    WHERE user_id = auth.uid()
      AND active = true
  ) THEN
    RETURN true;
  END IF;

  -- 2. Check if user is the organizer of this specific cleanup mission
  IF p_mission_id IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.community_missions
    WHERE id = p_mission_id
      AND organizer_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.is_mission_organizer_or_reviewer(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_mission_organizer_or_reviewer(uuid) TO authenticated;

-- 2. SELECT Policy on public.mission_completion_submissions
DROP POLICY IF EXISTS "Participants and reviewers can read completion submissions" ON public.mission_completion_submissions;
CREATE POLICY "Participants and reviewers can read completion submissions"
  ON public.mission_completion_submissions FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      public.is_mission_organizer_or_reviewer(mission_id) = true
    )
  );

-- 3. SELECT Policy on public.completion_evidence_photos
DROP POLICY IF EXISTS "Uploaders and reviewers can read evidence photo metadata" ON public.completion_evidence_photos;
CREATE POLICY "Uploaders and reviewers can read evidence photo metadata"
  ON public.completion_evidence_photos FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      uploader_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.mission_completion_submissions mcs
        WHERE mcs.id = completion_evidence_photos.submission_id
          AND public.is_mission_organizer_or_reviewer(mcs.mission_id) = true
      )
    )
  );

-- 4. SELECT Policy on storage.objects for 'completion-evidence' Bucket
DROP POLICY IF EXISTS "Uploaders and reviewers read completion evidence storage" ON storage.objects;
CREATE POLICY "Uploaders and reviewers read completion evidence storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'completion-evidence' AND
    auth.role() = 'authenticated' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      (
        (storage.foldername(name))[2] IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.mission_completion_submissions mcs
          WHERE mcs.id::text = (storage.foldername(name))[2]
            AND mcs.user_id::text = (storage.foldername(name))[1]
            AND public.is_mission_organizer_or_reviewer(mcs.mission_id) = true
        )
      )
    )
  );
