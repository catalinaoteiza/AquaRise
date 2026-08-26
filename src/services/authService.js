import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Unauthenticated visitor guest profile definition.
 * Used exclusively when session === null or user === null (Requirements #2, #4, #7).
 */
export const GUEST_PROFILE = {
  id: null,
  email: '',
  name: 'AquaRise Visitor',
  fullName: 'AquaRise Visitor',
  displayName: 'AquaRise Visitor',
  city: '',
  region: '',
  country: '',
  location: '',
  school: '',
  schoolOrganization: '',
  major: '',
  primaryWaterbody: 'Local Waters',
  guardianPrimaryWaterbody: 'Local Waters',
  bio: 'Sign in to access your personal AquaRise Guardian profile and track your environmental impact.',
  avatarUrl: '',
  avatar: '',
  isGuardian: false,
  guardianRole: null,
  guardianJoinedAt: null,
  impactPoints: 0,
  reportsSubmitted: 0,
  missionsCreated: 0,
  joinedDate: '2026'
};

/**
 * Normalizes Supabase profile row into AquaRise profile object shape.
 * When authenticated, dbProfile.is_guardian is authoritative.
 * When unauthenticated, returns GUEST_PROFILE (Requirements #2, #5, #7).
 */
export function normalizeProfile(user, dbProfile = null) {
  if (!user || !user.id) {
    return GUEST_PROFILE;
  }

  const meta = user.user_metadata || {};

  const id = user.id;
  const email = user.email || dbProfile?.email || '';

  // Canonical name source of truth is dbProfile.full_name
  const primaryName =
    dbProfile?.full_name ||
    dbProfile?.display_name ||
    meta.full_name ||
    meta.name ||
    meta.display_name ||
    'AquaRise Member';

  // Authoritative Guardian determination from Supabase dbProfile row
  const isGuardian = Boolean(dbProfile?.is_guardian);
  const guardianRole = isGuardian ? (dbProfile?.guardian_role || 'Field Volunteer') : null;
  const guardianJoinedAt = isGuardian ? dbProfile?.guardian_joined_at : null;
  const primaryWaterbody = dbProfile?.primary_waterbody || 'Local Waters';

  const city = dbProfile?.city || '';
  const region = dbProfile?.region || '';
  const country = dbProfile?.country || '';
  const location = [city, region, country].filter(Boolean).join(', ') || city || '';

  const bio = (dbProfile?.bio !== undefined && dbProfile?.bio !== null)
    ? dbProfile.bio
    : 'Dedicated to protecting global waterbodies and participating in local cleanup efforts.';

  const schoolVal = (dbProfile?.school_organization !== undefined && dbProfile?.school_organization !== null)
    ? dbProfile.school_organization
    : (dbProfile?.school || '');

  const majorVal = (dbProfile?.major !== undefined && dbProfile?.major !== null)
    ? dbProfile.major
    : '';

  return {
    id,
    email,
    name: primaryName,
    fullName: primaryName,
    displayName: primaryName,
    city,
    region,
    country,
    location,
    school: schoolVal,
    schoolOrganization: schoolVal,
    major: majorVal,
    primaryWaterbody,
    guardianPrimaryWaterbody: primaryWaterbody,
    bio,
    avatarUrl: dbProfile?.avatar_url || meta.avatar_url || '',
    avatar: dbProfile?.avatar_url || meta.avatar_url || '',
    isGuardian,
    guardianRole,
    guardianJoinedAt,
    impactPoints: isGuardian ? 100 : 50,
    reportsSubmitted: 0,
    missionsCreated: 0,
    joinedDate: dbProfile?.created_at ? new Date(dbProfile.created_at).getFullYear().toString() : '2026'
  };
}

/**
 * Sign up a new user via Supabase Auth
 */
export async function signUpUser({ fullName, email, password }) {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase environment is not configured. Check VITE_SUPABASE_URL.' };
  }

  try {
    const redirectUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000';

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
          display_name: fullName.trim()
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'An account with this email address already exists. Please sign in.' };
      }
      return { error: error.message };
    }

    if (!data.user) {
      return { error: 'Sign up failed. Please try again.' };
    }

    // Explicitly create initial profile row in public.profiles
    const initialProfileData = {
      id: data.user.id,
      full_name: fullName.trim(),
      display_name: fullName.trim(),
      is_guardian: false
    };

    await supabase.from('profiles').upsert(initialProfileData, { onConflict: 'id' });

    const profile = normalizeProfile(data.user, initialProfileData);

    return {
      user: data.user,
      session: data.session,
      profile,
      error: null
    };
  } catch (err) {
    return { error: 'An unexpected error occurred during sign up.' };
  }
}

/**
 * Sign in existing user via Supabase Auth
 */
export async function signInUser({ email, password }) {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase environment is not configured.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      return { error: 'Email or password is incorrect.' };
    }

    // Fetch user profile from Supabase database
    const profile = await fetchUserProfile(data.user.id, data.user);

    return {
      user: data.user,
      session: data.session,
      profile,
      error: null
    };
  } catch (err) {
    return { error: 'Email or password is incorrect.' };
  }
}

/**
 * Request password recovery email via Supabase Auth.
 */
export async function requestPasswordReset(email) {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase environment is not configured.' };
  }

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  try {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?reset-password=1`
      : 'http://localhost:3000/?reset-password=1';

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null, message: 'Password reset link sent! Check your email to confirm.' };
  } catch (err) {
    return { error: 'Failed to request password reset. Please try again.' };
  }
}

/**
 * Update authenticated user password in Supabase Auth.
 */
export async function updateUserPassword(newPassword) {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase environment is not configured.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters.' };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return { error: 'This password reset link is invalid or has expired. Please request a new one.' };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      if (error.message.includes('Auth session missing') || error.message.includes('session')) {
        return { error: 'This password reset link is invalid or has expired. Please request a new one.' };
      }
      return { error: error.message };
    }

    return { user: data.user, error: null, message: 'Password updated successfully. You can now sign in.' };
  } catch (err) {
    return { error: 'This password reset link is invalid or has expired. Please request a new one.' };
  }
}

/**
 * Sign out current user from Supabase Auth session
 */
export async function signOutUser() {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[AquaRise Auth] Sign out error:', err);
  }
}

/**
 * Fetch profile row from public.profiles table safely without throwing exceptions
 */
export async function fetchUserProfile(userId, authUser = null) {
  if (!isSupabaseConfigured || !userId) {
    return authUser ? normalizeProfile(authUser, null) : GUEST_PROFILE;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return normalizeProfile(authUser, null);
    }

    return normalizeProfile(authUser, data);
  } catch (err) {
    console.warn('[AquaRise Auth] Error fetching profile row:', err);
    return normalizeProfile(authUser, null);
  }
}

/**
 * Update authenticated user profile in Supabase profiles table.
 * Targets active Supabase auth user UUID (`user.id`). Uses upsert to guarantee resilience.
 */
export async function updateUserProfile(userId, profileUpdates, authUser = null) {
  if (!userId || userId === 'guest-user' || userId === 'local-user' || userId === 'guardian-user') {
    return { profile: null, error: 'You must be signed in to your AquaRise account to update your profile.' };
  }

  const dbUpdates = {};

  if (profileUpdates.name || profileUpdates.fullName || profileUpdates.displayName) {
    const val = (profileUpdates.fullName || profileUpdates.displayName || profileUpdates.name).trim();
    dbUpdates.full_name = val;
    dbUpdates.display_name = val;
  }

  if (profileUpdates.city !== undefined) dbUpdates.city = String(profileUpdates.city).trim();
  if (profileUpdates.region !== undefined) dbUpdates.region = String(profileUpdates.region).trim();
  if (profileUpdates.country !== undefined) dbUpdates.country = String(profileUpdates.country).trim();

  if (profileUpdates.primaryWaterbody || profileUpdates.guardianPrimaryWaterbody) {
    dbUpdates.primary_waterbody = String(profileUpdates.primaryWaterbody || profileUpdates.guardianPrimaryWaterbody).trim();
  }

  if (profileUpdates.bio !== undefined) dbUpdates.bio = String(profileUpdates.bio).trim();
  if (profileUpdates.avatarUrl || profileUpdates.avatar) {
    dbUpdates.avatar_url = profileUpdates.avatarUrl || profileUpdates.avatar;
  }

  if (profileUpdates.schoolOrganization !== undefined || profileUpdates.school !== undefined) {
    const schoolVal = profileUpdates.schoolOrganization !== undefined ? profileUpdates.schoolOrganization : profileUpdates.school;
    dbUpdates.school_organization = String(schoolVal || '').trim();
  }

  if (profileUpdates.major !== undefined) {
    dbUpdates.major = String(profileUpdates.major || '').trim();
  }

  // Guardian field mapping (preserve existing values if omitted)
  if (typeof profileUpdates.isGuardian === 'boolean') {
    dbUpdates.is_guardian = profileUpdates.isGuardian;
  }
  if (profileUpdates.guardianRole !== undefined) {
    dbUpdates.guardian_role = profileUpdates.guardianRole;
  }
  if (profileUpdates.guardianJoinedAt !== undefined) {
    dbUpdates.guardian_joined_at = profileUpdates.guardianJoinedAt;
  }

  // Clean undefined properties
  Object.keys(dbUpdates).forEach((key) => dbUpdates[key] === undefined && delete dbUpdates[key]);

  // Diagnostic Payload Logging
  console.log('EDIT PROFILE PAYLOAD:', {
    full_name: dbUpdates.full_name,
    school_organization: dbUpdates.school_organization,
    major: dbUpdates.major,
    city: dbUpdates.city,
    country: dbUpdates.country,
    bio: dbUpdates.bio
  });

  if (!isSupabaseConfigured) {
    console.error('EDIT PROFILE ERROR: Supabase environment is not configured.');
    return { profile: null, error: 'Supabase environment is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...dbUpdates }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('EDIT PROFILE ERROR:', error.message);
      return { profile: null, error: error.message || `We couldn't update your profile. Please try again.` };
    }

    if (!data) {
      console.error('EDIT PROFILE ERROR: Supabase update returned no row.');
      return { profile: null, error: `We couldn't update your profile. Please try again.` };
    }

    console.log('EDIT PROFILE RESULT:', data);

    const updatedProfile = normalizeProfile(authUser || { id: userId }, data);

    return { profile: updatedProfile, dbRow: data, error: null };
  } catch (err) {
    console.error('EDIT PROFILE ERROR:', err?.message || err);
    return { profile: null, error: err?.message || `We couldn't update your profile. Please try again.` };
  }
}

/**
 * Update Guardian status on canonical user profile
 */
export async function updateGuardianProfile(userId, guardianData, authUser = null) {
  if (!userId || userId === 'guest-user' || userId === 'local-user' || userId === 'guardian-user') {
    return { profile: null, error: 'You must be signed in to your AquaRise account to become a Guardian.' };
  }

  const updates = {
    isGuardian: true,
    guardianRole: guardianData.guardianRole || 'Field Volunteer',
    guardianJoinedAt: new Date().toISOString(),
    city: guardianData.city,
    country: guardianData.country,
    primaryWaterbody: guardianData.primaryWaterbody
  };

  return await updateUserProfile(userId, updates, authUser);
}

/**
 * Remove Guardian status from user profile (Requirement #8).
 */
export async function leaveGuardianProgram(userId, authUser = null) {
  if (!userId || userId === 'guest-user' || userId === 'local-user' || userId === 'guardian-user') {
    return { profile: null, error: 'You must be signed in to your AquaRise account to leave the Guardian program.' };
  }

  const updates = {
    isGuardian: false,
    guardianRole: null,
    guardianJoinedAt: null
  };

  return await updateUserProfile(userId, updates, authUser);
}
