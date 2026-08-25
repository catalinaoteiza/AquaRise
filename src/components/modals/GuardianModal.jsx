import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle2, User, Mail, MapPin, Edit3, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';

export default function GuardianModal({ profile, isOpen, onClose, onGuardianJoined, onLeaveGuardianProgram, onOpenEditProfile }) {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState('Volunteer');
  const [formData, setFormData] = useState({ name: '', email: '', city: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave Confirmation Modal state
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || profile.fullName || profile.full_name || '',
        email: profile.email || '',
        city: profile.city || profile.primaryWaterbody || profile.guardianPrimaryWaterbody || ''
      });
      setRole(profile.guardianRole === 'Regional Ambassador' ? 'Ambassador' : 'Volunteer');
      setErrorMessage('');
      setSubmitted(false);
      setShowLeaveConfirm(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const isAlreadyGuardian = Boolean(profile?.isGuardian);
  const isGuestUser = !profile?.id || profile?.id === 'guest-user' || profile?.id === 'local-user';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isGuestUser) {
      setErrorMessage('You must be signed in to your AquaRise account to become a Guardian.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onGuardianJoined) {
        const res = await onGuardianJoined({
          name: formData.name.trim(),
          email: formData.email.trim(),
          city: formData.city.trim(),
          role
        });

        if (res?.error) {
          setErrorMessage(res.error);
          setIsSubmitting(false);
          return;
        }
      }
      setSubmitted(true);
    } catch (err) {
      setErrorMessage("We couldn't update your Guardian profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmLeaveProgram = async () => {
    setIsLeaving(true);
    setErrorMessage('');

    try {
      if (onLeaveGuardianProgram) {
        const res = await onLeaveGuardianProgram();
        if (res?.error) {
          setErrorMessage(res.error);
          setIsLeaving(false);
          return;
        }
      }
      setShowLeaveConfirm(false);
      onClose();
    } catch (err) {
      setErrorMessage("We couldn't update your Guardian status. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setErrorMessage('');
    setShowLeaveConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isAlreadyGuardian ? (
          /* ACTIVE GUARDIAN PROFILE VIEW */
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#19887F] mx-auto flex items-center justify-center shadow-md">
              <Shield className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200 inline-block shadow-sm">
                Active AquaRise Guardian
              </span>
              <h3 className="text-2xl font-black text-ocean-950">{profile?.name || 'AquaRise Guardian'}</h3>
              <p className="text-xs text-slate-600 font-medium">
                {profile?.guardianRole || 'Field Volunteer'} • Member since {profile?.guardianJoinedAt ? new Date(profile.guardianJoinedAt).getFullYear() : '2026'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#DAF6F6]/50 border border-[#92F1EC] text-xs text-slate-700 space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Email:</span>
                <span className="font-bold text-ocean-950">{profile?.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Primary Waterbody / City:</span>
                <span className="font-bold text-[#19887F]">{profile?.guardianPrimaryWaterbody || profile?.city || 'Local Waters'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Impact Points:</span>
                <span className="font-extrabold text-[#076DDF]">{profile?.impactPoints || 0} pts</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenEditProfile) onOpenEditProfile();
                }}
                className="w-full py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Guardian Profile</span>
              </button>

              {/* Low-emphasis Leave Guardian Program section */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-left">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Guardian Membership Status</span>
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(true)}
                  className="w-full py-2.5 rounded-full bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer text-center"
                >
                  Leave Guardian Program
                </button>
              </div>
            </div>
          </div>
        ) : !submitted ? (
          /* GUARDIAN ONBOARDING FORM */
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-teal-200 pb-4">
              <div className="p-3 rounded-2xl bg-teal-50 text-[#19887F] border border-teal-200">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-ocean-950">Become an AquaRise Guardian</h3>
                <p className="text-xs text-slate-600 font-medium">Join a global network protecting rivers, lakes & beaches.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Maya Lin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Account Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    disabled={isSubmitting || Boolean(profile?.email)}
                    placeholder="e.g. maya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF] disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Primary Waterbody / City <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Puget Sound or Seattle, WA"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Select Guardian Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setRole('Volunteer')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === 'Volunteer'
                        ? 'bg-teal-50 border-[#19887F] text-ocean-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-200'
                    }`}
                  >
                    <span className="font-bold text-xs block text-ocean-950">Field Volunteer</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Join cleanups & field work (+100 pts)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setRole('Ambassador')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === 'Ambassador'
                        ? 'bg-teal-50 border-[#19887F] text-ocean-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-200'
                    }`}
                  >
                    <span className="font-bold text-xs block text-ocean-950">Regional Ambassador</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Organize local network (+250 pts)</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[#19887F] block">Verified Supabase Account Persistence</span>
                <p className="text-[11px] text-slate-600 font-medium">Your Guardian status is saved to your account in Supabase. Joining updates your active profile immediately.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <span>Confirm & Join Guardian Network</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center py-6 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-ocean-950">Welcome to the Network!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
                You are now an active AquaRise Guardian ({role === 'Ambassador' ? 'Regional Ambassador' : 'Field Volunteer'}).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#DAF6F6]/50 border border-[#92F1EC] text-xs text-slate-700 space-y-2 text-left max-w-sm mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Guardian Role:</span>
                <span className="font-bold text-[#19887F]">{role === 'Ambassador' ? 'Regional Ambassador' : 'Field Volunteer'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Primary Waterbody:</span>
                <span className="font-bold text-ocean-950">{formData.city || 'Local Waters'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="px-8 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* CONFIRMATION DIALOG OVERLAY: LEAVE GUARDIAN PROGRAM */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-2xl space-y-6 text-center text-ocean-950 relative">
              
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-md">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-ocean-950">Leave the Guardian Program?</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  You’ll keep your AquaRise account and your previous verified impact, certificates, and participation history, but you’ll lose access to active Guardian features such as organizing AquaRise missions and Guardian-specific tools.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isLeaving}
                  onClick={() => setShowLeaveConfirm(false)}
                  className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isLeaving}
                  onClick={handleConfirmLeaveProgram}
                  className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLeaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Status...</span>
                    </>
                  ) : (
                    <span>Leave Guardian Program</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
