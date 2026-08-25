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

  const name =
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

  return {
    id,
    email,
    name,
    fullName: name,
    displayName: dbProfile?.display_name || name,
    city,
    region,
    country,
    location,
    school: dbProfile?.school || '',
    major: dbProfile?.major || '',
    primaryWaterbody,
    guardianPrimaryWaterbody: primaryWaterbody,
    bio: dbProfile?.bio || 'Dedicated to protecting global waterbodies and participating in local cleanup efforts.',
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

  if (!fullName || !fullName.trim()) return { error: 'Full name is required.' };
  if (!email || !email.includes('@')) return { error: 'Please enter a valid email address.' };
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters.' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          display_name: fullName.trim(),
          name: fullName.trim()
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        return { error: 'An account with this email address already exists. Please sign in instead.' };
      }
      return { error: error.message };
    }

    const requiresConfirmation = !data.session && data.user && !data.user.confirmed_at;

    return {
      user: data.session ? data.user : null,
      session: data.session || null,
      profile: data.session ? normalizeProfile(data.user, null) : GUEST_PROFILE,
      requiresConfirmation,
      error: null
    };
  } catch (err) {
    return { error: 'An unexpected error occurred during signup.' };
  }
}

/**
 * Sign in an existing user via Supabase Auth
 */
export async function signInUser({ email, password }) {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase environment is not configured.' };
  }

  if (!email || !password) return { error: 'Email and password are required.' };

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
 * Uses query parameter ?reset-password=1 to avoid URL hash collision with #access_token fragment.
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
 * Verifies active session exists before attempting update.
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
 * Update authenticated user profile in Supabase profiles table (Requirement #7).
 * Targets active Supabase auth user UUID (`user.id`).
 */
export async function updateUserProfile(userId, profileUpdates, authUser = null) {
  if (!userId || userId === 'guest-user' || userId === 'local-user' || userId === 'guardian-user') {
    return { profile: null, error: 'You must be signed in to your AquaRise account to update your profile.' };
  }

  console.log('[AquaRise Guardian] Submission started for user:', userId);

  const dbUpdates = {};

  if (profileUpdates.name || profileUpdates.fullName) {
    dbUpdates.full_name = (profileUpdates.fullName || profileUpdates.name).trim();
    dbUpdates.display_name = (profileUpdates.displayName || profileUpdates.name).trim();
  }

  if (profileUpdates.city !== undefined) dbUpdates.city = profileUpdates.city.trim();
  if (profileUpdates.region !== undefined) dbUpdates.region = profileUpdates.region.trim();
  if (profileUpdates.country !== undefined) dbUpdates.country = profileUpdates.country.trim();

  if (profileUpdates.primaryWaterbody || profileUpdates.guardianPrimaryWaterbody) {
    dbUpdates.primary_waterbody = (profileUpdates.primaryWaterbody || profileUpdates.guardianPrimaryWaterbody).trim();
  }

  if (profileUpdates.bio !== undefined) dbUpdates.bio = profileUpdates.bio.trim();
  if (profileUpdates.avatarUrl || profileUpdates.avatar) {
    dbUpdates.avatar_url = profileUpdates.avatarUrl || profileUpdates.avatar;
  }

  // Guardian field mapping
  if (typeof profileUpdates.isGuardian === 'boolean') {
    dbUpdates.is_guardian = profileUpdates.isGuardian;
  }
  if (profileUpdates.guardianRole) {
    dbUpdates.guardian_role = profileUpdates.guardianRole;
  }
  if (profileUpdates.guardianJoinedAt) {
    dbUpdates.guardian_joined_at = profileUpdates.guardianJoinedAt;
  }

  // Clean undefined properties
  Object.keys(dbUpdates).forEach((key) => dbUpdates[key] === undefined && delete dbUpdates[key]);

  if (!isSupabaseConfigured) {
    console.error('[AquaRise Guardian] Supabase update failed: Supabase environment is not configured.');
    return { profile: null, error: 'Supabase environment is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AquaRise Guardian] Supabase update failed:', error.message);
      return { profile: null, error: `We couldn't update your Guardian profile. Please try again.` };
    }

    if (!data) {
      console.error('[AquaRise Guardian] Supabase update failed: No data returned.');
      return { profile: null, error: `We couldn't update your Guardian profile. Please try again.` };
    }

    console.log('[AquaRise Guardian] Supabase update successful for row ID:', data.id);

    const updatedProfile = normalizeProfile(authUser || { id: userId }, data);

    return { profile: updatedProfile, dbRow: data, error: null };
  } catch (err) {
    console.error('[AquaRise Guardian] Supabase update failed with exception:', err);
    return { profile: null, error: `We couldn't update your Guardian profile. Please try again.` };
  }
}

/**
 * Update Guardian status on canonical user profile
 */
export async function updateGuardianProfile(userId, guardianData, authUser = null) {
  const rawRole = typeof guardianData === 'object' ? guardianData.role : guardianData;
  const points = rawRole === 'Ambassador' || rawRole === 'Regional Ambassador' ? 250 : 100;

  const role = rawRole === 'Volunteer' ? 'Field Volunteer' : (rawRole === 'Ambassador' ? 'Regional Ambassador' : rawRole);

  const cityVal = (typeof guardianData === 'object' && guardianData.city) ? guardianData.city.trim() : '';

  const updates = {
    isGuardian: true,
    guardianRole: role,
    guardianJoinedAt: new Date().toISOString(),
    primaryWaterbody: cityVal || 'Local Waters',
    guardianPrimaryWaterbody: cityVal || 'Local Waters',
    name: (typeof guardianData === 'object' && guardianData.name) ? guardianData.name.trim() : undefined,
    city: cityVal || undefined,
    impactPoints: points
  };

  // Clean undefined properties
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  return await updateUserProfile(userId, updates, authUser);
}

/**
 * Leave Guardian Program on canonical user profile
 * Updates public.profiles: sets is_guardian = false, guardian_role = null.
 * Preserves user profile row, historical participation, hours, certificates, and reports.
 */
export async function leaveGuardianProgram(userId, authUser = null) {
  if (!userId || userId === 'guest-user' || userId === 'local-user' || userId === 'guardian-user') {
    return { profile: null, error: 'You must be signed in to your AquaRise account to leave the Guardian program.' };
  }

  if (!isSupabaseConfigured) {
    return { profile: null, error: 'Supabase environment is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_guardian: false,
        guardian_role: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AquaRise Guardian] Leave program update failed:', error.message);
      return { profile: null, error: `We couldn't update your Guardian status. Please try again.` };
    }

    const updatedProfile = normalizeProfile(authUser || { id: userId }, data);
    return { profile: updatedProfile, dbRow: data, error: null };
  } catch (err) {
    console.error('[AquaRise Guardian] Leave program update failed with exception:', err);
    return { profile: null, error: `We couldn't update your Guardian status. Please try again.` };
  }
}
