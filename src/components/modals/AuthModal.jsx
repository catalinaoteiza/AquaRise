import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, CheckCircle2, AlertCircle, Waves, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialTab = 'signin' }) {
  const { signIn, signUp, resetPasswordForEmail, updatePassword, isPasswordRecovery } = useAuth();

  const [mode, setMode] = useState(initialTab); // 'signin' | 'signup' | 'forgot_password' | 'reset_password'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isPasswordRecovery || initialTab === 'reset_password') {
        setMode('reset_password');
      } else {
        setMode(initialTab);
      }
      setErrorMessage('');
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialTab, isPasswordRecovery]);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(false);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'forgot_password') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await resetPasswordForEmail(email.trim());
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage(res.message || 'Password reset link sent! Check your email to confirm.');
        }
      } catch (err) {
        setErrorMessage('Failed to request password reset.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'reset_password') {
      if (!password || password.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please check and try again.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await updatePassword(password);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Password updated successfully. You can now sign in.');
          setTimeout(() => {
            handleResetForm();
            setMode('signin');
          }, 1200);
        }
      } catch (err) {
        setErrorMessage('Failed to update password.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please check and try again.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const res = await signUp({
          fullName: fullName.trim(),
          email: email.trim(),
          password
        });

        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.requiresConfirmation) {
          setSuccessMessage('Check your email to confirm your AquaRise account, then sign in.');
          setMode('signin');
        } else if (res.session && res.user) {
          setSuccessMessage('Account created successfully!');
          setTimeout(() => {
            handleResetForm();
            onClose();
            if (onAuthSuccess) onAuthSuccess(res.user);
          }, 800);
        } else {
          setSuccessMessage('Check your email to confirm your AquaRise account, then sign in.');
          setMode('signin');
        }
      } else {
        const res = await signIn({
          email: email.trim(),
          password
        });

        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.session && res.user) {
          setSuccessMessage('Signed in successfully!');
          setTimeout(() => {
            handleResetForm();
            onClose();
            if (onAuthSuccess) onAuthSuccess(res.user);
          }, 600);
        } else {
          setErrorMessage('Email or password is incorrect.');
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHeaderTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In to AquaRise';
      case 'signup': return 'Join AquaRise';
      case 'forgot_password': return 'Recover Password';
      case 'reset_password': return 'Set New Password';
      default: return 'AquaRise Network';
    }
  };

  const getHeaderSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Access your cross-device AquaRise profile and Guardian network.';
      case 'signup': return 'Create your account to organize cleanups and track impact online.';
      case 'forgot_password': return 'Enter your account email address to receive a secure recovery link.';
      case 'reset_password': return 'Enter and confirm your new account password below.';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#92F1EC] p-6 sm:p-8 space-y-6 shadow-2xl text-ocean-950">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            handleResetForm();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-ocean-950 border border-teal-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#19887F] text-xs font-black uppercase tracking-wider border border-teal-200">
            {mode === 'reset_password' || mode === 'forgot_password' ? (
              <KeyRound className="w-4 h-4 text-[#35AEAC]" />
            ) : (
              <Waves className="w-4 h-4 text-[#35AEAC]" />
            )}
            <span>AquaRise Network</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-ocean-950">
            {getHeaderTitle()}
          </h2>

          <p className="text-xs text-slate-600 font-medium">
            {getHeaderSubtitle()}
          </p>
        </div>

        {/* Tab Switcher (Only visible for signin / signup modes) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-teal-200 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => handleSwitchMode('signin')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-ocean-950 shadow-sm'
                  : 'text-slate-500 hover:text-ocean-950'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-ocean-950 shadow-sm'
                  : 'text-slate-500 hover:text-ocean-950'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-ocean-950 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                />
              </div>
            </div>
          )}

          {mode !== 'reset_password' && (
            <div>
              <label className="block font-bold text-ocean-950 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                />
              </div>
            </div>
          )}

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-ocean-950 uppercase tracking-wider">
                  {mode === 'reset_password' ? 'New Password *' : 'Password *'}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot_password')}
                    className="text-[11px] font-bold text-[#076DDF] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                />
              </div>
            </div>
          )}

          {(mode === 'signup' || mode === 'reset_password') && (
            <div>
              <label className="block font-bold text-ocean-950 uppercase tracking-wider mb-1">
                {mode === 'reset_password' ? 'Confirm New Password *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>
                  {mode === 'signin' && 'Signing in...'}
                  {mode === 'signup' && 'Creating Account...'}
                  {mode === 'forgot_password' && 'Sending Reset Link...'}
                  {mode === 'reset_password' && 'Updating Password...'}
                </span>
              </>
            ) : (
              <span>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create AquaRise Account'}
                {mode === 'forgot_password' && 'Send Recovery Email'}
                {mode === 'reset_password' && 'Update Password'}
              </span>
            )}
          </button>

          {mode === 'forgot_password' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ocean-950 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
