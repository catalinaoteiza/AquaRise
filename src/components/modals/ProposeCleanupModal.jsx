import React, { useState } from 'react';
import { X, Flag, Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProposeCleanupModal({ waterbody, isOpen, onClose, onSubmitSuccess }) {
  const [submitted, setSubmitted] = useState(false);
  const [dateError, setDateError] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    proposedTitle: waterbody ? `${waterbody.name} Community Cleanup` : '',
    proposedDate: '',
    estimatedGuardians: 30,
    proposedMeetingSpot: '',
    organizerNotes: '',
  });

  if (!isOpen || !waterbody) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setDateError('');

    if (!formData.proposedDate || formData.proposedDate < todayStr) {
      setDateError('Cleanup date must be today or a future date.');
      return;
    }

    if (onSubmitSuccess) {
      const newMission = {
        id: `user-mission-${Date.now()}`,
        title: formData.proposedTitle,
        waterbodyName: waterbody.name,
        country: waterbody.country || 'Global',
        city: waterbody.city || '',
        region: waterbody.region || '',
        location: waterbody.location || `${waterbody.city || ''}, ${waterbody.country || ''}`,
        meetingLocation: formData.proposedMeetingSpot || 'Main Waterfront Entrance',
        date: formData.proposedDate,
        statusText: `Upcoming • ${formData.proposedDate}`,
        organizer: 'AquaRise Guardian',
        description: formData.organizerNotes || 'Community cleanup proposed by local Guardian.',
        suppliesNeeded: ['Trash bags', 'Gloves'],
        volunteerCapacity: Number(formData.estimatedGuardians),
        participantCount: 1,
        status: 'Upcoming',
        cleanupStatus: 'AquaRise Mission',
        createdAt: todayStr,
        isCommunityOrganized: true,
        isUserCreated: true,
        isDemoEvent: false,
        image: waterbody.image
      };
      onSubmitSuccess(newMission);
    }

    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setDateError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-teal-200 pb-4">
              <div className="p-3 rounded-2xl bg-teal-50 text-[#19887F] border border-teal-200">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-ocean-950">Propose an AquaRise Cleanup</h3>
                <p className="text-xs text-slate-600 font-medium">Turn awareness into action for {waterbody.name}.</p>
              </div>
            </div>

            {dateError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dateError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Proposed Mission Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.proposedTitle}
                  onChange={(e) => setFormData({ ...formData, proposedTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Proposed Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={formData.proposedDate}
                    onChange={(e) => setFormData({ ...formData, proposedDate: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Capacity (Guardians)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={formData.estimatedGuardians}
                    onChange={(e) => setFormData({ ...formData, estimatedGuardians: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Meeting Location <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4 Park Pavilion"
                  value={formData.proposedMeetingSpot}
                  onChange={(e) => setFormData({ ...formData, proposedMeetingSpot: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Organizer Notes</label>
                <textarea
                  rows="3"
                  placeholder="Describe logistical plans or supply requirements..."
                  value={formData.organizerNotes}
                  onChange={(e) => setFormData({ ...formData, organizerNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] placeholder:text-slate-400"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-sm shadow-md transition-all"
                >
                  Publish Cleanup Proposal
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-ocean-950">Cleanup Proposed!</h3>
              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                Your proposal has been published as an active community mission.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-full bg-[#076DDF] text-white text-xs font-bold shadow-md"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
