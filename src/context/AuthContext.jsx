import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import {
  signUpUser,
  signInUser,
  signOutUser,
  requestPasswordReset,
  updateUserPassword,
  fetchUserProfile,
  updateUserProfile,
  updateGuardianProfile,
  leaveGuardianProgram,
  normalizeProfile,
  GUEST_PROFILE
} from '../services/authService.js';

const AuthContext = createContext({
  user: null,
  session: null,
  profile: GUEST_PROFILE,
  loading: true,
  isPasswordRecovery: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPasswordForEmail: async () => {},
  updatePassword: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
  updateGuardianStatus: async () => {}
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(GUEST_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Single authoritative auth listener for INITIAL_SESSION, PKCE exchange, PASSWORD_RECOVERY & auth events
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      if (isMounted) {
        setSession(null);
        setUser(null);
        setProfile(GUEST_PROFILE);
        setLoading(false);
      }
      return;
    }

    // Process initial URL params & PKCE exchange
    async function initAuthFlow() {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const hasResetFlag = searchParams.has('reset-password') || window.location.hash.includes('type=recovery');

        // PKCE Code Exchange
        if (code) {
          try {
            const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeErr && exchangeData?.session) {
              if (hasResetFlag || window.location.hash.includes('type=recovery')) {
                if (isMounted) setIsPasswordRecovery(true);
              }
            }
          } catch (err) {
            console.warn('[AquaRise AuthContext] PKCE code exchange note:', err);
          }
        } else if (hasResetFlag) {
          // Check if recovery session exists before enabling recovery mode
          const { data: curSession } = await supabase.auth.getSession();
          if (curSession?.session && isMounted) {
            setIsPasswordRecovery(true);
          }
        }
      }
    }

    initAuthFlow();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      const currentUser = currentSession?.user || null;

      if (event === 'PASSWORD_RECOVERY') {
        if (isMounted) setIsPasswordRecovery(true);
      }

      if (currentUser && currentSession) {
        try {
          const loadedProfile = await fetchUserProfile(currentUser.id, currentUser);
          if (isMounted) {
            setSession(currentSession);
            setUser(currentUser);
            setProfile(loadedProfile || normalizeProfile(currentUser, null));
          }
        } catch (err) {
          console.warn('[AquaRise AuthContext] Profile resolution warning:', err);
          if (isMounted) {
            setSession(currentSession);
            setUser(currentUser);
            setProfile(normalizeProfile(currentUser, null));
          }
        }

        // Clean recovery URL query parameters safely without destroying session
        if (typeof window !== 'undefined' && (window.location.search.includes('reset-password') || window.location.search.includes('code='))) {
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch (e) {
            // Ignore replaceState errors
          }
        }
      } else {
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(GUEST_PROFILE);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignUp = async (signUpData) => {
    const result = await signUpUser(signUpData);
    if (result.session && result.user) {
      setUser(result.user);
      setSession(result.session);
      setProfile(result.profile);
    } else {
      setUser(null);
      setSession(null);
      setProfile(GUEST_PROFILE);
    }
    return result;
  };

  const handleSignIn = async (signInData) => {
    const result = await signInUser(signInData);
    if (result.session && result.user) {
      setUser(result.user);
      setSession(result.session);
      setProfile(result.profile);
    } else {
      setUser(null);
      setSession(null);
      setProfile(GUEST_PROFILE);
    }
    return result;
  };

  const handleResetPasswordForEmail = async (emailVal) => {
    return await requestPasswordReset(emailVal);
  };

  const handleUpdatePassword = async (newPass) => {
    const result = await updateUserPassword(newPass);
    if (result.user && !result.error) {
      setUser(result.user);
      setIsPasswordRecovery(false);
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
    setProfile(GUEST_PROFILE);
    setIsPasswordRecovery(false);
  };

  const handleRefreshProfile = async () => {
    if (user?.id) {
      const fresh = await fetchUserProfile(user.id, user);
      setProfile(fresh);
      return fresh;
    }
    setProfile(GUEST_PROFILE);
    return GUEST_PROFILE;
  };

  const handleUpdateProfile = async (updates) => {
    if (!user || !user.id) {
      return { profile: null, error: 'You must be signed in to your AquaRise account to update your profile.' };
    }
    const result = await updateUserProfile(user.id, updates, user);
    if (result.profile && !result.error) {
      setProfile(result.profile);
    }
    return result;
  };

  const handleUpdateGuardianStatus = async (guardianData) => {
    if (!user || !user.id) {
      return { profile: null, error: 'You must be signed in to your AquaRise account to become a Guardian.' };
    }
    const result = await updateGuardianProfile(user.id, guardianData, user);
    if (result.profile && !result.error) {
      setProfile(result.profile);
    }
    return result;
  };

  const handleLeaveGuardianProgram = async () => {
    if (!user || !user.id) {
      return { profile: null, error: 'You must be signed in to your AquaRise account to leave the Guardian program.' };
    }
    const result = await leaveGuardianProgram(user.id, user);
    if (result.profile && !result.error) {
      setProfile(result.profile);
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isPasswordRecovery,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        resetPasswordForEmail: handleResetPasswordForEmail,
        updatePassword: handleUpdatePassword,
        refreshProfile: handleRefreshProfile,
        updateProfile: handleUpdateProfile,
        updateGuardianStatus: handleUpdateGuardianStatus,
        leaveGuardianProgram: handleLeaveGuardianProgram
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
