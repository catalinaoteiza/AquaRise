import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle2, User, Mail, MapPin, Edit3, AlertCircle, Loader2 } from 'lucide-react';

export default function GuardianModal({ profile, isOpen, onClose, onGuardianJoined, onOpenEditProfile }) {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState('Volunteer');
  const [formData, setFormData] = useState({ name: '', email: '', city: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const resetAndClose = () => {
    setSubmitted(false);
    setErrorMessage('');
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

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenEditProfile) onOpenEditProfile();
                }}
                className="w-full py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Guardian Profile</span>
              </button>
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
                    placeholder="e.g. Maya Lin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. maya@example.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
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
                    placeholder="e.g. Santiago"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-2">Select Guardian Role</label>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  {[
                    { id: 'Volunteer', label: 'Field Volunteer', desc: 'Participate in local cleanups' },
                    { id: 'Ambassador', label: 'Regional Ambassador', desc: 'Lead & organize local missions' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setRole(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        role === item.id
                          ? 'border-[#076DDF] bg-teal-50 text-[#076DDF]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-extrabold">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-teal-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Updating Database...</span>
                    </>
                  ) : (
                    <span>Confirm & Join Guardian Network</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS CONFIRMATION VIEW */
          <div className="text-center space-y-6 py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#19887F] mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-ocean-950">Welcome to the Guardian Network!</h3>
              <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                You are registered as a <strong>{role === 'Volunteer' ? 'Field Volunteer' : 'Regional Ambassador'}</strong> for {formData.city || 'local waters'}.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3 rounded-full bg-[#19887F] hover:bg-[#35AEAC] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Close & Continue
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
