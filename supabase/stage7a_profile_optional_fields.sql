-- ============================================================================
-- AQUARISE STAGE 7A: OPTIONAL PROFILE FIELDS MIGRATION (SCHOOL/ORG & MAJOR)
-- ============================================================================
-- IMPORTANT: DO NOT execute this file automatically.
-- This script must be executed manually in the Supabase SQL Editor by the project owner.
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS school_organization text,
ADD COLUMN IF NOT EXISTS major text;
