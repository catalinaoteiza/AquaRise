import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Normalizes a database row from public.community_missions into a frontend camelCase mission.
 */
export function normalizeMission(row, organizerProfile = null, participantRows = [], participantCount = null) {
  if (!row) return null;

  const fullLocation = [row.city, row.region, row.country].filter(Boolean).join(', ') || row.location_text || 'Global Waters';

  const participants = (participantRows || []).map((p) => {
    const prof = p?.profiles || {};
    return {
      userId: p.user_id,
      displayName: prof.display_name || prof.full_name || 'AquaRise Supporter',
      avatarUrl: prof.avatar_url || null,
      city: prof.city || '',
      country: prof.country || '',
      guardianRole: prof.guardian_role || null,
      isGuardian: Boolean(prof.is_guardian),
      joinedAt: p.joined_at
    };
  });

  // Format start_time (PostgreSQL time '10:00:00' -> '10:00 AM')
  let displayStartTime = '10:00 AM';
  if (row.start_time) {
    const parts = String(row.start_time).split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        const displayM = String(m).padStart(2, '0');
        displayStartTime = `${displayH}:${displayM} ${ampm}`;
      }
    }
  }

  const derivedCount = participantCount !== null ? participantCount : participants.length;

  return {
    id: row.id,
    missionId: row.id,
    displayId: `community-${row.id}`,
    organizerId: row.organizer_id,
    title: row.title,
    name: row.title,
    description: row.description || '',
    waterbodyName: row.waterbody_name || 'Local Waterbody',
    waterbodyType: row.waterbody_type || 'Waterbody',
    city: row.city || '',
    region: row.region || '',
    country: row.country || '',
    location: fullLocation,
    locationText: row.location_text || '',
    meetingLocation: row.meeting_location || 'Main Entrance / Public Access',
    latitude: row.latitude,
    longitude: row.longitude,
    date: row.event_date,
    startTime: displayStartTime,
    rawStartTime: row.start_time,
    durationMinutes: row.duration_minutes || 120,
    estimatedDuration: row.duration_minutes ? `Approx. ${Math.round(row.duration_minutes / 60)} hours` : 'Approx. 2 hours',
    maxCapacity: row.max_capacity || 25,
    bannerImage: row.banner_url || null,
    image: row.banner_url || null,
    verificationStatus: row.verification_status || 'unverified',
    suppliesNeeded: Array.isArray(row.supplies_needed) ? row.supplies_needed : [],
    isCommunityOrganized: true,
    isUserCreated: true,
    sourceType: 'aquarise_community',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizer: organizerProfile?.display_name || organizerProfile?.full_name || 'AquaRise Guardian',
    organizerRole: organizerProfile?.guardian_role || 'AquaRise Guardian',
    organizerAvatar: organizerProfile?.avatar_url || null,
    participantCount: derivedCount,
    participatingGuardians: participants.filter((p) => p.isGuardian).length,
    participants
  };
}

/**
 * Converts a frontend start time string ('10:00', '10:00 AM', '14:30') to PostgreSQL TIME format ('10:00:00').
 */
function formatTimeToPostgres(timeStr) {
  if (!timeStr) return '10:00:00';
  const str = String(timeStr).trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;

  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const [h, m] = str.split(':');
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  }

  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  }

  return '10:00:00';
}

/**
 * Fetches all published community missions from Supabase.
 */
export async function fetchCommunityMissions() {
  if (!isSupabaseConfigured) {
    console.warn('[AquaRise Missions] Supabase environment not configured.');
    return [];
  }

  try {
    const { data: missionRows, error: missionErr } = await supabase
      .from('community_missions')
      .select('*')
      .eq('published', true)
      .order('event_date', { ascending: true });

    if (missionErr) {
      console.error('[AquaRise Missions] Error fetching community missions:', missionErr.message);
      return [];
    }

    if (!missionRows || missionRows.length === 0) {
      return [];
    }

    const organizerIds = Array.from(new Set(missionRows.map((m) => m.organizer_id).filter(Boolean)));
    let profilesMap = {};

    if (organizerIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, guardian_role, avatar_url, city, country, is_guardian')
        .in('id', organizerIds);

      if (profileRows) {
        profileRows.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
    }

    const missionIds = missionRows.map((m) => m.id);
    let participantsMap = {};

    if (missionIds.length > 0) {
      try {
        const { data: partRows } = await supabase
          .from('mission_participants')
          .select('mission_id, user_id, joined_at, profiles(id, full_name, display_name, guardian_role, avatar_url, city, country, is_guardian)')
          .in('mission_id', missionIds);

        if (partRows) {
          partRows.forEach((pr) => {
            if (!participantsMap[pr.mission_id]) {
              participantsMap[pr.mission_id] = [];
            }
            participantsMap[pr.mission_id].push(pr);
          });
        }
      } catch (err) {
        // SELECT policy restricts raw participant rows for non-organizers
      }
    }

    return missionRows.map((mRow) => {
      const orgProf = profilesMap[mRow.organizer_id] || null;
      const parts = participantsMap[mRow.id] || [];
      return normalizeMission(mRow, orgProf, parts);
    });
  } catch (err) {
    console.error('[AquaRise Missions] Failed to fetch community missions:', err);
    return [];
  }
}

/**
 * Creates a new community cleanup mission in Supabase.
 * Validates authenticated Guardian permission against live Supabase auth session & profiles row.
 * Organizers do NOT auto-join as participants. Participant count starts at 0.
 */
export async function createCommunityMission(arg1, arg2 = null) {
  if (!isSupabaseConfigured) {
    return { mission: null, error: 'Supabase environment is not configured.' };
  }

  let missionData;
  let callerUserId;

  if (typeof arg1 === 'string') {
    callerUserId = arg1;
    missionData = arg2 || {};
  } else {
    missionData = arg1 || {};
    callerUserId = arg2;
  }

  try {
    // 1. Obtain real authenticated user directly from active Supabase session
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    const authUser = session?.user;

    const hasSession = Boolean(session && authUser);
    const authUserId = authUser?.id || callerUserId || null;

    if (!hasSession || !authUserId) {
      console.warn('[AquaRise Stage7B LIVE PRE-INSERT ABORTED] No active Supabase Auth session.');
      return { mission: null, error: 'You must be signed in to your AquaRise account to create a cleanup mission.' };
    }

    // 2. Query public.profiles directly in Supabase for authUserId
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('id, is_guardian, display_name, full_name, guardian_role, avatar_url')
      .eq('id', authUserId)
      .maybeSingle();

    const profileRowFound = Boolean(prof);
    const isGuardianInDb = Boolean(prof?.is_guardian);

    // 3. UNMISSABLE PRE-INSERT DIAGNOSTIC LOG
    console.log('%c[AquaRise Stage7B LIVE PRE-INSERT]', 'background: #076DDF; color: #ffffff; font-weight: bold; font-size: 13px; padding: 4px 8px; border-radius: 4px;', {
      hasSession,
      authUserId,
      organizerId: authUserId,
      idsMatch: true,
      profileRowFound,
      isGuardianInDb,
      verificationStatus: 'unverified',
      published: true
    });

    // 4. ABORT BEFORE INSERT IF GUARDIAN CHECK FAILS
    if (!profileRowFound || !isGuardianInDb) {
      console.warn('[AquaRise Stage7B LIVE PRE-INSERT ABORTED] Guardian check failed in DB for authUserId:', authUserId);
      return { mission: null, error: 'Only active AquaRise Guardians can create community cleanup missions.' };
    }

    // Extract Event Date (event_date, eventDate, date, cleanupDate)
    const rawEventDate =
      missionData.event_date ||
      missionData.eventDate ||
      missionData.date ||
      missionData.cleanupDate;

    const cleanEventDate = rawEventDate ? String(rawEventDate).trim() : null;

    if (!cleanEventDate) {
      return { mission: null, error: 'Please select an event date.' };
    }

    const postgresStartTime = formatTimeToPostgres(missionData.startTime || missionData.rawStartTime);

    // 5. Build payload strictly with explicit event_date mapping
    const payload = {
      organizer_id: authUserId,
      title: (missionData.title || missionData.name || '').trim(),
      description: (missionData.description || '').trim() || null,
      waterbody_name: (missionData.waterbodyName || '').trim() || null,
      waterbody_type: (missionData.waterbodyType || '').trim() || null,
      city: (missionData.city || '').trim() || null,
      region: (missionData.region || '').trim() || null,
      country: (missionData.country || '').trim() || null,
      location_text: (missionData.location || '').trim() || null,
      meeting_location: (missionData.meetingLocation || '').trim() || null,
      latitude: missionData.latitude || null,
      longitude: missionData.longitude || null,
      event_date: cleanEventDate,
      start_time: postgresStartTime,
      duration_minutes: missionData.durationMinutes || 120,
      max_capacity: parseInt(missionData.capacity || missionData.maxCapacity, 10) || 25,
      banner_url: missionData.bannerImage || missionData.image || null,
      supplies_needed: Array.isArray(missionData.suppliesNeeded) ? missionData.suppliesNeeded : [],
      verification_status: 'unverified',
      published: true
    };

    // 6. Execute Supabase INSERT
    const { data: insertedRow, error: insertErr } = await supabase
      .from('community_missions')
      .insert(payload)
      .select()
      .single();

    if (insertErr) {
      console.error('[AquaRise Stage7B LIVE INSERT FAILED]', {
        message: insertErr.message,
        details: insertErr.details,
        hint: insertErr.hint,
        code: insertErr.code
      });
      return { mission: null, error: `We couldn't create your community mission: ${insertErr.message}` };
    }

    console.log('[AquaRise Stage7B LIVE INSERT SUCCESSFUL] Mission ID:', insertedRow.id);

    const createdMission = normalizeMission(insertedRow, prof, [], 0);
    return { mission: createdMission, error: null };
  } catch (err) {
    console.error('[AquaRise Stage7B LIVE INSERT EXCEPTION]', err);
    return { mission: null, error: "We couldn't create your community mission. Please try again." };
  }
}

/**
 * Fetches safe numeric participant count for a mission using database RPC function get_mission_participant_count.
 */
export async function getMissionParticipantCount(missionId) {
  if (!missionId || !isSupabaseConfigured) return 0;

  try {
    const { data, error } = await supabase.rpc('get_mission_participant_count', {
      p_mission_id: missionId
    });

    if (error) {
      console.warn('[AquaRise Missions] RPC get_mission_participant_count error:', error.message);
      return 0;
    }

    return typeof data === 'number' ? data : 0;
  } catch (err) {
    return 0;
  }
}

/**
 * Fetches joined mission IDs for a specific user from Supabase.
 */
export async function fetchUserJoinedMissionIds(userId) {
  if (!userId || userId === 'guest-user' || userId === 'local-user' || !isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('mission_participants')
      .select('mission_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[AquaRise Missions] Error fetching joined mission IDs:', error.message);
      return [];
    }

    return (data || []).map((row) => row.mission_id);
  } catch (err) {
    console.error('[AquaRise Missions] Exception fetching joined mission IDs:', err);
    return [];
  }
}

/**
 * Fetches user's real participation rows directly from public.mission_participants
 * joined with public.community_missions and organizer profiles.
 * Source of truth: public.mission_participants for auth.uid().
 */
export async function fetchUserJoinedMissionsDirect(userId) {
  if (!isSupabaseConfigured) return [];

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    const targetUserId = sessionUser?.id || userId;

    if (!targetUserId || targetUserId === 'guest-user' || targetUserId === 'local-user') {
      return [];
    }

    const { data: partRows, error: partErr } = await supabase
      .from('mission_participants')
      .select(`
        mission_id,
        user_id,
        joined_at,
        participation_status,
        community_missions!mission_id (*)
      `)
      .eq('user_id', targetUserId);

    if (partErr) {
      console.error('[AquaRise Missions] Error fetching direct user participations:', partErr.message);
      return [];
    }

    if (!partRows || partRows.length === 0) {
      return [];
    }

    const organizerIds = Array.from(
      new Set(
        partRows
          .map((pr) => pr.community_missions?.organizer_id)
          .filter(Boolean)
      )
    );

    let profilesMap = {};
    if (organizerIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, guardian_role, avatar_url, city, country, is_guardian')
        .in('id', organizerIds);

      if (profileRows) {
        profileRows.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
    }

    const result = [];
    for (const pr of partRows) {
      const row = pr.community_missions;
      if (!row) continue;

      const organizerProf = profilesMap[row.organizer_id] || null;
      const normalized = normalizeMission(row, organizerProf, [pr]);

      result.push({
        ...normalized,
        participationStatus: pr.participation_status || 'joined',
        joinedAt: pr.joined_at
      });
    }

    return result;
  } catch (err) {
    console.error('[AquaRise Missions] Exception fetching direct user joined missions:', err);
    return [];
  }
}

/**
 * Fetches participants for a specific mission from Supabase.
 * Exposes only safe public profile fields (display_name, avatar_url, city, country, guardian_role).
 * Never exposes email, phone, auth metadata, or tokens.
 */
export async function fetchMissionParticipants(missionId) {
  if (!missionId || !isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('mission_participants')
      .select('user_id, joined_at, profiles(id, full_name, display_name, guardian_role, avatar_url, city, country, is_guardian)')
      .eq('mission_id', missionId);

    if (error) {
      console.error('[AquaRise Missions] Error fetching participants:', error.message);
      return [];
    }

    return (data || []).map((p) => {
      const prof = p?.profiles || {};
      return {
        userId: p.user_id,
        displayName: prof.display_name || prof.full_name || 'AquaRise Supporter',
        avatarUrl: prof.avatar_url || null,
        city: prof.city || '',
        country: prof.country || '',
        guardianRole: prof.guardian_role || null,
        isGuardian: Boolean(prof.is_guardian),
        joinedAt: p.joined_at
      };
    });
  } catch (err) {
    console.error('[AquaRise Missions] Exception fetching participants:', err);
    return [];
  }
}

/**
 * Joins a community mission in Supabase using atomic database RPC function join_community_mission.
 * Canonical single-argument signature: joinCommunityMission(missionId)
 * p_mission_id must be the exact 36-character UUID from public.community_missions.id.
 */
export async function joinCommunityMission(missionId) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase environment is not configured.' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const targetUuid = typeof missionId === 'string' ? missionId.trim() : '';

  if (!targetUuid || !uuidRegex.test(targetUuid)) {
    console.warn('[AquaRise Join] Invalid community mission ID:', missionId);
    return { success: false, error: 'Invalid community mission ID.' };
  }

  console.log('[AquaRise Join] JOIN MISSION UUID:', targetUuid);

  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('join_community_mission', {
      p_mission_id: targetUuid
    });

    if (rpcErr) {
      console.error('[AquaRise Join] RPC error:', rpcErr.message);
      return { success: false, error: rpcErr.message };
    }

    if (rpcRes && rpcRes.error) {
      console.warn('[AquaRise Join] RPC returned error message:', rpcRes.error);
      return { success: false, error: rpcRes.error };
    }

    return { success: true, alreadyJoined: Boolean(rpcRes?.alreadyJoined), error: null };
  } catch (err) {
    console.error('[AquaRise Missions] Join mission exception:', err);
    return { success: false, error: 'Could not join mission. Please try again.' };
  }
}

/**
 * Leaves a community mission in Supabase.
 * Canonical single-argument signature: leaveCommunityMission(missionId)
 */
export async function leaveCommunityMission(missionId) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase environment is not configured.' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const targetUuid = typeof missionId === 'string' ? missionId.trim() : '';

  if (!targetUuid || !uuidRegex.test(targetUuid)) {
    console.warn('[AquaRise Leave] Invalid community mission ID:', missionId);
    return { success: false, error: 'Invalid community mission ID.' };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user;

    if (!session || !authUser) {
      return { success: false, error: 'You must be signed in to your AquaRise account to leave cleanups.' };
    }

    console.log('[AquaRise Leave] LEAVE MISSION UUID:', targetUuid);

    const { error } = await supabase
      .from('mission_participants')
      .delete()
      .eq('mission_id', targetUuid)
      .eq('user_id', authUser.id);

    if (error) {
      console.error('[AquaRise Missions] Leave mission failed:', error.message);
      return { success: false, error: `Could not leave mission: ${error.message}` };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('[AquaRise Missions] Leave mission exception:', err);
    return { success: false, error: 'Could not leave mission. Please try again.' };
  }
}
