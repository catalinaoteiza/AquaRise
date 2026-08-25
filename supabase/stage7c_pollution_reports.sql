-- ============================================================================
-- AQUARISE STAGE 7C: SHARED COMMUNITY POLLUTION REPORTS & EVIDENCE PHOTOS DDL
-- ============================================================================
-- IMPORTANT: DO NOT execute this file automatically.
-- This script must be executed manually in the Supabase SQL Editor by the project owner.
-- ============================================================================

-- 1. Create public.pollution_reports Table
CREATE TABLE IF NOT EXISTS public.pollution_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  waterbody_name text NOT NULL,
  waterbody_type text NOT NULL,
  pollution_level text NOT NULL CHECK (pollution_level IN ('Low', 'Moderate', 'High', 'Critical')),
  description text NOT NULL,
  city text NOT NULL,
  region text,
  country text NOT NULL,
  location_description text,
  exact_address text,
  latitude double precision CHECK (latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)),
  longitude double precision CHECK (longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)),
  pollution_tags text[] NOT NULL DEFAULT '{}',
  affected_area text,
  wildlife_affected boolean NOT NULL DEFAULT false,
  additional_notes text,
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected')),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create public.pollution_report_photos Table (Photo Metadata)
CREATE TABLE IF NOT EXISTS public.pollution_report_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.pollution_reports(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes for Performant Queries
CREATE INDEX IF NOT EXISTS idx_pollution_reports_published_created
  ON public.pollution_reports (published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pollution_reports_reporter
  ON public.pollution_reports (reporter_id);

CREATE INDEX IF NOT EXISTS idx_pollution_report_photos_report
  ON public.pollution_report_photos (report_id);

-- 4. Verification Self-Protection Trigger Function
-- Ensures ordinary users cannot set or modify verification_status to 'verified'
CREATE OR REPLACE FUNCTION public.enforce_pollution_report_verification_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.verification_status := 'unverified';
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.verification_status := OLD.verification_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_pollution_report_verification ON public.pollution_reports;
CREATE TRIGGER trigger_enforce_pollution_report_verification
  BEFORE INSERT OR UPDATE ON public.pollution_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_pollution_report_verification_status();

-- 5. Updated_at Trigger
CREATE OR REPLACE FUNCTION public.set_pollution_report_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_pollution_report_updated_at ON public.pollution_reports;
CREATE TRIGGER trigger_set_pollution_report_updated_at
  BEFORE UPDATE ON public.pollution_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_pollution_report_updated_at();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.pollution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollution_report_photos ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for public.pollution_reports
DROP POLICY IF EXISTS "Anyone can view published pollution reports" ON public.pollution_reports;
CREATE POLICY "Anyone can view published pollution reports"
  ON public.pollution_reports FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Authenticated users can insert pollution reports" ON public.pollution_reports;
CREATE POLICY "Authenticated users can insert pollution reports"
  ON public.pollution_reports FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    reporter_id = auth.uid()
  );

DROP POLICY IF EXISTS "Reporters can update their own pollution reports" ON public.pollution_reports;
CREATE POLICY "Reporters can update their own pollution reports"
  ON public.pollution_reports FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    reporter_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    reporter_id = auth.uid()
  );

DROP POLICY IF EXISTS "Reporters can delete their own pollution reports" ON public.pollution_reports;
CREATE POLICY "Reporters can delete their own pollution reports"
  ON public.pollution_reports FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    reporter_id = auth.uid()
  );

-- 8. RLS Policies for public.pollution_report_photos
DROP POLICY IF EXISTS "Anyone can view photos of published reports" ON public.pollution_report_photos;
CREATE POLICY "Anyone can view photos of published reports"
  ON public.pollution_report_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pollution_reports
      WHERE id = pollution_report_photos.report_id
        AND published = true
    )
  );

DROP POLICY IF EXISTS "Uploaders can insert photos for their reports" ON public.pollution_report_photos;
CREATE POLICY "Uploaders can insert photos for their reports"
  ON public.pollution_report_photos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    uploader_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.pollution_reports
      WHERE id = pollution_report_photos.report_id
        AND reporter_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Uploaders can delete their report photos" ON public.pollution_report_photos;
CREATE POLICY "Uploaders can delete their report photos"
  ON public.pollution_report_photos FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    uploader_id = auth.uid()
  );

-- 9. Supabase Storage Bucket Setup for Pollution Evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('pollution-report-evidence', 'pollution-report-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 10. Storage RLS Policies
DROP POLICY IF EXISTS "Public read for pollution-report-evidence objects" ON storage.objects;
CREATE POLICY "Public read for pollution-report-evidence objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pollution-report-evidence');

DROP POLICY IF EXISTS "Authenticated users can upload pollution report evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload pollution report evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pollution-report-evidence' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Uploaders can delete their pollution report evidence" ON storage.objects;
CREATE POLICY "Uploaders can delete their pollution report evidence"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pollution-report-evidence' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pollution_reports TO authenticated;
GRANT SELECT ON public.pollution_reports TO anon;
GRANT SELECT, INSERT, DELETE ON public.pollution_report_photos TO authenticated;
GRANT SELECT ON public.pollution_report_photos TO anon;
