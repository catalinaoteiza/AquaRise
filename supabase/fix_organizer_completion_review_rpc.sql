-- ============================================================================
-- AQUARISE TARGETED SQL MIGRATION: ORGANIZER COMPLETION REVIEW RPC FIX
-- ============================================================================
-- IMPORTANT: Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This migration updates the review_completion_submission RPC function so cleanup
-- mission organizers (as well as global completion reviewers) are authorized to
-- approve or reject completion evidence submitted by participants on their missions.
-- ============================================================================

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

  -- Authorized Reviewer / Mission Organizer Check
  IF NOT public.is_mission_organizer_or_reviewer(v_submission.mission_id) THEN
    RAISE EXCEPTION 'Unauthorized: You are not authorized to review completion submissions for this mission.';
  END IF;

  IF v_submission.status <> 'pending' THEN
    RAISE EXCEPTION 'Submission is not in pending status (current status: "%").', v_submission.status;
  END IF;

  -- NO SELF-APPROVAL: Reviewer/organizer cannot review their own submission
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
