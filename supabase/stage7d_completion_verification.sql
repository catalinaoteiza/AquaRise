-- ============================================================================
-- AQUARISE STAGE 7D.1: CLEANUP COMPLETION EVIDENCE, VERIFICATION & CERTIFICATES
-- HARDENED SECURITY & INTEGRITY SPECIFICATION
-- ============================================================================
-- IMPORTANT: DO NOT execute this file automatically.
-- This script must be executed manually in the Supabase SQL Editor by the project owner.
-- ============================================================================

-- 1. Create Authorized Reviewers Table
CREATE TABLE IF NOT EXISTS public.completion_reviewers (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.completion_reviewers ENABLE ROW LEVEL SECURITY;

-- 2. Secure Reviewer Boolean Check Function
CREATE OR REPLACE FUNCTION public.is_completion_reviewer()
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

  RETURN EXISTS (
    SELECT 1
    FROM public.completion_reviewers
    WHERE user_id = auth.uid()
      AND active = true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_completion_reviewer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_completion_reviewer() TO authenticated;

-- Hardened Reviewer Table Privacy (Narrow policy: auth.uid() = user_id)
DROP POLICY IF EXISTS "Authenticated users can check own reviewer status" ON public.completion_reviewers;
CREATE POLICY "Authenticated users can check own reviewer status"
  ON public.completion_reviewers FOR SELECT
  USING (auth.uid() = user_id);

-- Direct client INSERT, UPDATE, DELETE on completion_reviewers are intentionally BLOCKED.

-- 3. Create Mission Completion Submissions Table
CREATE TABLE IF NOT EXISTS public.mission_completion_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.community_missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution text NOT NULL CONSTRAINT chk_contribution_not_empty CHECK (length(trim(contribution)) > 0),
  volunteer_minutes integer NOT NULL CONSTRAINT chk_volunteer_minutes_positive CHECK (volunteer_minutes > 0),
  notes text,
  status text NOT NULL DEFAULT 'draft' CONSTRAINT chk_submission_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_mission_user_submission UNIQUE (mission_id, user_id)
);

ALTER TABLE public.mission_completion_submissions ENABLE ROW LEVEL SECURITY;

-- Stage-7D-Specific Updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.set_completion_submission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

DROP TRIGGER IF EXISTS set_mission_completion_submissions_updated_at ON public.mission_completion_submissions;
CREATE TRIGGER set_mission_completion_submissions_updated_at
  BEFORE UPDATE ON public.mission_completion_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_completion_submission_updated_at();

-- RLS Policies for mission_completion_submissions
DROP POLICY IF EXISTS "Participants and reviewers can read completion submissions" ON public.mission_completion_submissions;
CREATE POLICY "Participants and reviewers can read completion submissions"
  ON public.mission_completion_submissions FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      public.is_completion_reviewer() = true OR
      EXISTS (
        SELECT 1 FROM public.community_missions cm
        WHERE cm.id = mission_id AND cm.organizer_id = auth.uid()
      )
    )
  );

-- Direct client INSERT/UPDATE/DELETE on mission_completion_submissions is BLOCKED.
-- All state mutations MUST be performed via SECURITY DEFINER RPCs.

-- 4. Create Completion Evidence Photos Metadata Table
CREATE TABLE IF NOT EXISTS public.completion_evidence_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.mission_completion_submissions(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.completion_evidence_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for completion_evidence_photos
DROP POLICY IF EXISTS "Uploaders and reviewers can read evidence photo metadata" ON public.completion_evidence_photos;
CREATE POLICY "Uploaders and reviewers can read evidence photo metadata"
  ON public.completion_evidence_photos FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      uploader_id = auth.uid() OR
      public.is_completion_reviewer() = true OR
      EXISTS (
        SELECT 1 FROM public.mission_completion_submissions mcs
        JOIN public.community_missions cm ON cm.id = mcs.mission_id
        WHERE mcs.id = completion_evidence_photos.submission_id
          AND cm.organizer_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Uploaders can insert evidence photo metadata for draft/rejected submissions" ON public.completion_evidence_photos;
CREATE POLICY "Uploaders can insert evidence photo metadata for draft/rejected submissions"
  ON public.completion_evidence_photos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    uploader_id = auth.uid() AND
    storage_path LIKE (auth.uid()::text || '/' || submission_id::text || '/%') AND
    EXISTS (
      SELECT 1 FROM public.mission_completion_submissions
      WHERE id = submission_id
        AND user_id = auth.uid()
        AND status IN ('draft', 'rejected')
    )
  );

DROP POLICY IF EXISTS "Uploaders can delete evidence photo metadata for draft/rejected submissions" ON public.completion_evidence_photos;
CREATE POLICY "Uploaders can delete evidence photo metadata for draft/rejected submissions"
  ON public.completion_evidence_photos FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    uploader_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.mission_completion_submissions
      WHERE id = submission_id
        AND user_id = auth.uid()
        AND status IN ('draft', 'rejected')
    )
  );

-- 5. Harden Stage 7B DELETE Policy on mission_participants
-- Prevents participants from leaving a mission once evidence is pending_completion_verification or completed
DROP POLICY IF EXISTS "Users can remove own participation" ON public.mission_participants;
CREATE POLICY "Users can remove own participation"
  ON public.mission_participants FOR DELETE
  USING (
    auth.uid() = user_id AND
    participation_status = 'joined'
  );

-- 6. Configure Private 'completion-evidence' Bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'completion-evidence',
  'completion-evidence',
  false, -- PRIVATE BUCKET
  10485760, -- 10 MB limit (10,485,760 bytes)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies for 'completion-evidence' Bucket

-- Policy A: SELECT (Uploaders & Reviewers & Mission Organizers)
DROP POLICY IF EXISTS "Uploaders and reviewers read completion evidence storage" ON storage.objects;
CREATE POLICY "Uploaders and reviewers read completion evidence storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'completion-evidence' AND
    auth.role() = 'authenticated' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      public.is_completion_reviewer() = true OR
      EXISTS (
        SELECT 1 FROM public.community_missions cm
        JOIN public.mission_completion_submissions mcs ON mcs.mission_id = cm.id
        WHERE (storage.foldername(name))[2] IS NOT NULL
          AND mcs.id::text = (storage.foldername(name))[2]
          AND cm.organizer_id = auth.uid()
      )
    )
  );

-- Policy B: INSERT (Uploaders only when submission exists in draft/rejected status)
DROP POLICY IF EXISTS "Uploaders insert completion evidence storage" ON storage.objects;
CREATE POLICY "Uploaders insert completion evidence storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'completion-evidence' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    (storage.foldername(name))[2] IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.mission_completion_submissions mcs
      WHERE mcs.id::text = (storage.foldername(name))[2]
        AND mcs.user_id = auth.uid()
        AND mcs.status IN ('draft', 'rejected')
    )
  );

-- Policy C: UPDATE policy REMOVED entirely for completion-evidence storage objects!
-- Files are uniquely named. Edits during draft/rejected use DELETE + INSERT.
DROP POLICY IF EXISTS "Uploaders update draft completion evidence storage" ON storage.objects;

-- Policy D: DELETE (Uploaders only when submission is in draft/rejected status)
DROP POLICY IF EXISTS "Uploaders delete draft completion evidence storage" ON storage.objects;
CREATE POLICY "Uploaders delete draft completion evidence storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'completion-evidence' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    (storage.foldername(name))[2] IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.mission_completion_submissions mcs
      WHERE mcs.id::text = (storage.foldername(name))[2]
        AND mcs.user_id = auth.uid()
        AND mcs.status IN ('draft', 'rejected')
    )
  );

-- 7. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid UNIQUE REFERENCES public.mission_completion_submissions(id) ON DELETE SET NULL,
  issued_to_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  mission_id uuid REFERENCES public.community_missions(id) ON DELETE SET NULL,
  certificate_code text NOT NULL UNIQUE,
  recipient_name text NOT NULL,
  mission_title text NOT NULL,
  waterbody_name text,
  city text,
  region text,
  country text,
  event_date date,
  volunteer_minutes integer NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Certificates RLS Policies
DROP POLICY IF EXISTS "Recipients and reviewers can read certificates" ON public.certificates;
CREATE POLICY "Recipients and reviewers can read certificates"
  ON public.certificates FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      issued_to_user_id = auth.uid() OR
      public.is_completion_reviewer() = true
    )
  );

-- Direct client INSERT, UPDATE, DELETE on certificates are BLOCKED.
-- Certificates are created exclusively inside the review_completion_submission RPC transaction.

-- 8. Internal Generator Function for Non-Sequential Certificate Codes
CREATE OR REPLACE FUNCTION public.generate_certificate_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_code text;
  v_exists boolean := true;
BEGIN
  WHILE v_exists LOOP
    v_code := 'AQR-' || upper(replace(gen_random_uuid()::text, '-', ''));
    SELECT EXISTS (
      SELECT 1 FROM public.certificates WHERE certificate_code = v_code
    ) INTO v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Secure Certificate Generator: Revoke ALL permissions from PUBLIC, authenticated, and anon
REVOKE ALL ON FUNCTION public.generate_certificate_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_certificate_code() FROM authenticated, anon;

-- 9. Public Certificate Verification RPC Function
CREATE OR REPLACE FUNCTION public.get_public_certificate(p_certificate_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_cert public.certificates%ROWTYPE;
  v_search_code text;
BEGIN
  IF p_certificate_code IS NULL OR trim(p_certificate_code) = '' THEN
    RETURN jsonb_build_object('found', false, 'error', 'Invalid certificate code provided.');
  END IF;

  v_search_code := upper(trim(p_certificate_code));

  SELECT * INTO v_cert
  FROM public.certificates
  WHERE certificate_code = v_search_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'error', 'Certificate not found.');
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'certificate_code', v_cert.certificate_code,
    'recipient_name', v_cert.recipient_name,
    'mission_title', v_cert.mission_title,
    'waterbody_name', v_cert.waterbody_name,
    'city', v_cert.city,
    'region', v_cert.region,
    'country', v_cert.country,
    'event_date', v_cert.event_date,
    'volunteer_minutes', v_cert.volunteer_minutes,
    'issued_at', v_cert.issued_at,
    'status', CASE WHEN v_cert.revoked_at IS NULL THEN 'valid' ELSE 'revoked' END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_certificate(text) TO anon, authenticated;

-- 10. RPC Function: Save Completion Draft
CREATE OR REPLACE FUNCTION public.save_completion_draft(
  p_mission_id uuid,
  p_contribution text,
  p_volunteer_minutes integer,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_mission public.community_missions%ROWTYPE;
  v_participant public.mission_participants%ROWTYPE;
  v_existing public.mission_completion_submissions%ROWTYPE;
  v_submission_id uuid;
  v_trimmed_contribution text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to save a cleanup completion draft.';
  END IF;

  -- Verify mission exists and is published
  SELECT * INTO v_mission
  FROM public.community_missions
  WHERE id = p_mission_id AND published = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Community mission not found or is not published.';
  END IF;

  -- ORGANIZER RESTRICTION (BUG 2): Organizers cannot submit completion evidence for their own mission
  IF v_mission.organizer_id = v_user_id THEN
    RAISE EXCEPTION 'Organizers cannot submit completion evidence for missions they organized.';
  END IF;

  -- Event Completion Eligibility Rule: Must be after event date
  IF v_mission.event_date >= CURRENT_DATE THEN
    RAISE EXCEPTION 'Completion evidence can only be submitted after the cleanup event has taken place.';
  END IF;

  -- Verify user is an active joined participant (participation_status MUST be 'joined')
  SELECT * INTO v_participant
  FROM public.mission_participants
  WHERE mission_id = p_mission_id
    AND user_id = v_user_id
    AND participation_status = 'joined';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You must be an active joined participant in this community mission to save completion evidence.';
  END IF;

  -- Input Validation
  v_trimmed_contribution := trim(p_contribution);
  IF v_trimmed_contribution IS NULL OR v_trimmed_contribution = '' THEN
    RAISE EXCEPTION 'Please provide a non-empty summary of your cleanup contribution.';
  END IF;

  IF p_volunteer_minutes IS NULL OR p_volunteer_minutes <= 0 THEN
    RAISE EXCEPTION 'Volunteer time must be a positive integer.';
  END IF;

  IF p_volunteer_minutes > COALESCE(v_mission.duration_minutes * 3, 720) THEN
    RAISE EXCEPTION 'Submitted volunteer time exceeds reasonable mission limits.';
  END IF;

  -- Check existing submission
  SELECT * INTO v_existing
  FROM public.mission_completion_submissions
  WHERE mission_id = p_mission_id AND user_id = v_user_id;

  IF FOUND THEN
    IF v_existing.status IN ('pending', 'approved') THEN
      RAISE EXCEPTION 'Your completion submission is already % and cannot be edited.', v_existing.status;
    END IF;

    -- Update existing draft / rejected submission
    UPDATE public.mission_completion_submissions
    SET
      contribution = v_trimmed_contribution,
      volunteer_minutes = p_volunteer_minutes,
      notes = p_notes,
      status = 'draft',
      updated_at = now()
    WHERE id = v_existing.id;

    RETURN v_existing.id;
  ELSE
    -- Insert new draft submission
    INSERT INTO public.mission_completion_submissions (
      mission_id,
      user_id,
      contribution,
      volunteer_minutes,
      notes,
      status
    ) VALUES (
      p_mission_id,
      v_user_id,
      v_trimmed_contribution,
      p_volunteer_minutes,
      p_notes,
      'draft'
    )
    RETURNING id INTO v_submission_id;

    RETURN v_submission_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.save_completion_draft(uuid, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_completion_draft(uuid, text, integer, text) TO authenticated;

-- 11. RPC Function: Finalize & Submit Completion Evidence
CREATE OR REPLACE FUNCTION public.submit_completion_evidence(
  p_submission_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_submission public.mission_completion_submissions%ROWTYPE;
  v_mission public.community_missions%ROWTYPE;
  v_participant public.mission_participants%ROWTYPE;
  v_photo_count integer := 0;
  v_valid_storage_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to submit completion evidence.';
  END IF;

  -- Lock submission row FOR UPDATE
  SELECT * INTO v_submission
  FROM public.mission_completion_submissions
  WHERE id = p_submission_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Completion submission not found or access denied.';
  END IF;

  IF v_submission.status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'This submission is already in status "%" and cannot be resubmitted.', v_submission.status;
  END IF;

  -- Re-verify mission eligibility
  SELECT * INTO v_mission
  FROM public.community_missions
  WHERE id = v_submission.mission_id AND published = true;

  IF NOT FOUND OR v_mission.event_date >= CURRENT_DATE THEN
    RAISE EXCEPTION 'Mission completion evidence is not currently eligible for submission.';
  END IF;

  -- ORGANIZER RESTRICTION (BUG 2): Organizers cannot submit completion evidence for their own mission
  IF v_mission.organizer_id = v_user_id THEN
    RAISE EXCEPTION 'Organizers cannot submit completion evidence for missions they organized.';
  END IF;

  -- Re-verify joined participation FOR UPDATE
  SELECT * INTO v_participant
  FROM public.mission_participants
  WHERE mission_id = v_submission.mission_id
    AND user_id = v_user_id
    AND participation_status = 'joined'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active joined participation in this mission is required to submit completion evidence.';
  END IF;

  -- Verify Evidence Photo Count (1 to 5 photos)
  SELECT COUNT(*)::integer INTO v_photo_count
  FROM public.completion_evidence_photos
  WHERE submission_id = p_submission_id AND uploader_id = v_user_id;

  IF v_photo_count < 1 OR v_photo_count > 5 THEN
    RAISE EXCEPTION 'You must attach between 1 and 5 evidence photos before submitting.';
  END IF;

  -- Verify Physical Storage Objects Existence in Storage
  SELECT COUNT(*)::integer INTO v_valid_storage_count
  FROM public.completion_evidence_photos ep
  JOIN storage.objects so ON so.name = ep.storage_path AND so.bucket_id = 'completion-evidence'
  WHERE ep.submission_id = p_submission_id AND ep.uploader_id = v_user_id;

  IF v_valid_storage_count <> v_photo_count THEN
    RAISE EXCEPTION 'One or more evidence photos are missing from Storage. Please re-upload photo evidence.';
  END IF;

  -- Update Submission Status to Pending
  UPDATE public.mission_completion_submissions
  SET
    status = 'pending',
    submitted_at = now(),
    reviewed_at = NULL,
    reviewed_by = NULL,
    review_notes = NULL,
    updated_at = now()
  WHERE id = p_submission_id;

  -- Update Participation Status in mission_participants
  UPDATE public.mission_participants
  SET participation_status = 'pending_completion_verification'
  WHERE mission_id = v_submission.mission_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'submission_id', p_submission_id,
    'status', 'pending',
    'message', 'Completion evidence submitted successfully and is pending review.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_completion_evidence(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_completion_evidence(uuid) TO authenticated;

-- 12. RPC Function: Review Completion Submission (Approve / Reject)
CREATE OR REPLACE FUNCTION public.review_completion_submission(
  p_submission_id uuid,
  p_decision text,
  p_review_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reviewer_id uuid := auth.uid();
  v_submission public.mission_completion_submissions%ROWTYPE;
  v_mission public.community_missions%ROWTYPE;
  v_participant public.mission_participants%ROWTYPE;
  v_user_profile public.profiles%ROWTYPE;
  v_photo_count integer := 0;
  v_valid_storage_count integer := 0;
  v_cert_code text;
  v_cert_id uuid;
  v_recipient_name text;
  v_updated_rows integer := 0;
BEGIN
  IF v_reviewer_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to review completion submissions.';
  END IF;

  -- Validate Decision Argument
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid review decision. Must be "approved" or "rejected".';
  END IF;

  -- Lock Submission Row FOR UPDATE
  SELECT * INTO v_submission
  FROM public.mission_completion_submissions
  WHERE id = p_submission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Completion submission not found.';
  END IF;

  SELECT * INTO v_mission FROM public.community_missions WHERE id = v_submission.mission_id;

  -- Authorized Reviewer Check (BUG 1): Must be global reviewer OR organizer of this specific mission
  IF NOT (public.is_completion_reviewer() OR v_mission.organizer_id = v_reviewer_id) THEN
    RAISE EXCEPTION 'Unauthorized: You are not authorized to review completion submissions for this mission.';
  END IF;

  IF v_submission.status <> 'pending' THEN
    RAISE EXCEPTION 'Submission is not in pending status (current status: "%").', v_submission.status;
  END IF;

  -- NO SELF-APPROVAL: Reviewer cannot review their own submission
  IF v_submission.user_id = v_reviewer_id THEN
    RAISE EXCEPTION 'Security Policy: Reviewers cannot review or approve their own completion submissions.';
  END IF;

  -- Lock Participation Row FOR UPDATE and verify participation_status = 'pending_completion_verification'
  SELECT * INTO v_participant
  FROM public.mission_participants
  WHERE mission_id = v_submission.mission_id
    AND user_id = v_submission.user_id
    AND participation_status = 'pending_completion_verification'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review blocked: Participation record is missing or not in pending_completion_verification status.';
  END IF;

  -- Fetch Mission & User Profile Data
  SELECT * INTO v_mission FROM public.community_missions WHERE id = v_submission.mission_id;
  SELECT * INTO v_user_profile FROM public.profiles WHERE id = v_submission.user_id;

  IF p_decision = 'rejected' THEN
    -- Update Submission Status to Rejected
    UPDATE public.mission_completion_submissions
    SET
      status = 'rejected',
      reviewed_at = now(),
      reviewed_by = v_reviewer_id,
      review_notes = trim(p_review_notes),
      updated_at = now()
    WHERE id = p_submission_id;

    -- Revert Participation Status to 'joined'
    UPDATE public.mission_participants
    SET participation_status = 'joined'
    WHERE mission_id = v_submission.mission_id AND user_id = v_submission.user_id;

    RETURN jsonb_build_object(
      'success', true,
      'submission_id', p_submission_id,
      'status', 'rejected',
      'message', 'Completion submission has been rejected.'
    );

  ELSIF p_decision = 'approved' THEN
    -- Re-verify Evidence Photo Storage Existence before Approval (1 to 5 photos)
    SELECT COUNT(*)::integer INTO v_photo_count
    FROM public.completion_evidence_photos
    WHERE submission_id = p_submission_id AND uploader_id = v_submission.user_id;

    SELECT COUNT(*)::integer INTO v_valid_storage_count
    FROM public.completion_evidence_photos ep
    JOIN storage.objects so ON so.name = ep.storage_path AND so.bucket_id = 'completion-evidence'
    WHERE ep.submission_id = p_submission_id AND ep.uploader_id = v_submission.user_id;

    IF v_photo_count < 1 OR v_photo_count > 5 OR v_valid_storage_count <> v_photo_count THEN
      RAISE EXCEPTION 'Approval blocked: Evidence photos are missing from Storage or invalid (found % valid photos for % metadata).', v_valid_storage_count, v_photo_count;
    END IF;

    -- Update Submission Status to Approved
    UPDATE public.mission_completion_submissions
    SET
      status = 'approved',
      reviewed_at = now(),
      reviewed_by = v_reviewer_id,
      review_notes = trim(p_review_notes),
      updated_at = now()
    WHERE id = p_submission_id;

    -- Update Participation Status to Completed and verify exactly one row updated
    UPDATE public.mission_participants
    SET participation_status = 'completed'
    WHERE mission_id = v_submission.mission_id
      AND user_id = v_submission.user_id
      AND participation_status = 'pending_completion_verification';

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    IF v_updated_rows <> 1 THEN
      RAISE EXCEPTION 'Approval blocked: Failed to update participation status to completed.';
    END IF;

    -- Derive Recipient Name cleanly (Prefer display_name, fallback full_name)
    v_recipient_name := COALESCE(
      NULLIF(trim(v_user_profile.display_name), ''),
      NULLIF(trim(v_user_profile.full_name), ''),
      'AquaRise Guardian'
    );

    -- Generate Certificate Code
    v_cert_code := public.generate_certificate_code();

    -- Issue Certificate in atomic transaction
    INSERT INTO public.certificates (
      submission_id,
      issued_to_user_id,
      mission_id,
      certificate_code,
      recipient_name,
      mission_title,
      waterbody_name,
      city,
      region,
      country,
      event_date,
      volunteer_minutes,
      issued_at
    ) VALUES (
      p_submission_id,
      v_submission.user_id,
      v_submission.mission_id,
      v_cert_code,
      v_recipient_name,
      v_mission.title,
      v_mission.waterbody_name,
      v_mission.city,
      v_mission.region,
      v_mission.country,
      v_mission.event_date,
      v_submission.volunteer_minutes,
      now()
    )
    RETURNING id INTO v_cert_id;

    RETURN jsonb_build_object(
      'success', true,
      'submission_id', p_submission_id,
      'status', 'approved',
      'certificate_code', v_cert_code,
      'certificate_id', v_cert_id,
      'message', 'Completion submission approved and official certificate issued.'
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.review_completion_submission(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_completion_submission(uuid, text, text) TO authenticated;
