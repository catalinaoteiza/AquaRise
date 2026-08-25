-- AquaRise Stage 7B: Shared Community Cleanup Missions + Real Participation Schema (Final Hardened)
-- DO NOT execute automatically. Run manually in your Supabase SQL Editor.

-- 1. Create community_missions table
CREATE TABLE IF NOT EXISTS public.community_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  waterbody_name text,
  waterbody_type text,
  city text,
  region text,
  country text,
  location_text text,
  meeting_location text,
  latitude double precision CONSTRAINT chk_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude double precision CONSTRAINT chk_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  event_date date NOT NULL,
  start_time time,
  duration_minutes integer DEFAULT 120 CONSTRAINT chk_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  max_capacity integer NOT NULL DEFAULT 25 CONSTRAINT chk_max_capacity CHECK (max_capacity > 0),
  banner_url text,
  supplies_needed text[],
  verification_status text NOT NULL DEFAULT 'unverified' CONSTRAINT chk_verification_status CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected')),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create mission_participants table
CREATE TABLE IF NOT EXISTS public.mission_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.community_missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  participation_status text NOT NULL DEFAULT 'joined' CONSTRAINT chk_participation_status CHECK (participation_status IN ('joined', 'pending_completion_verification', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_mission_user_participant UNIQUE (mission_id, user_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.community_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_participants ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for community_missions
DROP POLICY IF EXISTS "Public and authenticated read published missions" ON public.community_missions;
DROP POLICY IF EXISTS "Read published missions or own missions" ON public.community_missions;
CREATE POLICY "Read published missions or own missions"
  ON public.community_missions FOR SELECT
  USING (published = true OR (auth.uid() IS NOT NULL AND organizer_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated Guardians can insert missions" ON public.community_missions;
CREATE POLICY "Authenticated Guardians can insert missions"
  ON public.community_missions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    organizer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_guardian = true
    )
  );

DROP POLICY IF EXISTS "Organizers can update own missions" ON public.community_missions;
CREATE POLICY "Organizers can update own missions"
  ON public.community_missions FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizers can delete own missions" ON public.community_missions;
CREATE POLICY "Organizers can delete own missions"
  ON public.community_missions FOR DELETE
  USING (auth.uid() = organizer_id);

-- 5. Hardened RLS Policies for mission_participants
DROP POLICY IF EXISTS "Public and authenticated read mission participants" ON public.mission_participants;
DROP POLICY IF EXISTS "Organizers and participants read mission participants" ON public.mission_participants;
CREATE POLICY "Organizers and participants read mission participants"
  ON public.mission_participants FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.community_missions cm
        WHERE cm.id = mission_id AND cm.organizer_id = auth.uid()
      )
    )
  );

-- Direct client INSERT on mission_participants is intentionally BLOCKED.
-- All client joins MUST use the SECURITY DEFINER RPC public.join_community_mission().
DROP POLICY IF EXISTS "Authenticated users can join missions as themselves" ON public.mission_participants;
DROP POLICY IF EXISTS "Authenticated Guardians can join valid future missions" ON public.mission_participants;

DROP POLICY IF EXISTS "Users can remove own participation" ON public.mission_participants;
CREATE POLICY "Users can remove own participation"
  ON public.mission_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Trigger to Prevent Self-Verification of Missions
CREATE OR REPLACE FUNCTION public.enforce_community_mission_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If caller is authenticated client (non-service-role)
  IF auth.role() = 'authenticated' THEN
    IF (TG_OP = 'INSERT') THEN
      NEW.verification_status := 'unverified';
    ELSIF (TG_OP = 'UPDATE') THEN
      NEW.verification_status := OLD.verification_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

DROP TRIGGER IF EXISTS enforce_mission_verification ON public.community_missions;
CREATE TRIGGER enforce_mission_verification
  BEFORE INSERT OR UPDATE ON public.community_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_community_mission_verification_status();

-- 7. Safe Public Participant Count RPC Function
CREATE OR REPLACE FUNCTION public.get_mission_participant_count(p_mission_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT COUNT(*)::integer
  FROM public.mission_participants mp
  JOIN public.community_missions cm ON cm.id = mp.mission_id
  WHERE mp.mission_id = p_mission_id
    AND cm.published = true;
$$;

REVOKE ALL ON FUNCTION public.get_mission_participant_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_mission_participant_count(uuid) TO anon, authenticated;

-- 8. Atomic Database Join RPC Function with Row Locking (FOR UPDATE) & Capacity Enforcement
CREATE OR REPLACE FUNCTION public.join_community_mission(p_mission_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_mission public.community_missions%ROWTYPE;
  v_count integer;
  v_is_guardian boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must be signed in to join cleanups.');
  END IF;

  -- 1. Check Guardian status
  SELECT is_guardian INTO v_is_guardian FROM public.profiles WHERE id = v_user_id;
  IF NOT FOUND OR NOT v_is_guardian THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only active AquaRise Guardians can join community cleanup missions.');
  END IF;

  -- 2. Lock target mission row for update to serialize concurrent joins safely
  SELECT * INTO v_mission
  FROM public.community_missions
  WHERE id = p_mission_id AND published = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cleanup mission not found or not published.');
  END IF;

  -- 3. Check date validity
  IF v_mission.event_date < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Past missions are completed and cannot accept new joins.');
  END IF;

  -- 4. Count current participants while mission row is locked
  SELECT COUNT(*) INTO v_count
  FROM public.mission_participants
  WHERE mission_id = p_mission_id;

  -- 5. Enforce capacity limit
  IF v_count >= v_mission.max_capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'This cleanup mission has reached maximum capacity.');
  END IF;

  -- 6. Insert participant row
  BEGIN
    INSERT INTO public.mission_participants (mission_id, user_id, participation_status)
    VALUES (p_mission_id, v_user_id, 'joined');
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', true, 'alreadyJoined', true, 'error', null);
  END;

  RETURN jsonb_build_object('success', true, 'alreadyJoined', false, 'error', null);
END;
$$;

REVOKE ALL ON FUNCTION public.join_community_mission(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_community_mission(uuid) TO authenticated;

-- 9. Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

DROP TRIGGER IF EXISTS set_community_missions_updated_at ON public.community_missions;
CREATE TRIGGER set_community_missions_updated_at
  BEFORE UPDATE ON public.community_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
