import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users, ExternalLink, Bookmark, CheckCircle2, ShieldAlert, Loader2, Shield } from 'lucide-react';
import { isCleanupParticipating, joinOrSaveCleanup, leaveOrRemoveCleanup } from '../../services/participationService';

export default function MissionDetailModal({
  mission,
  isOpen,
  onClose,
  user,
  profile,
  joinedMissionIds = [],
  onJoinMission,
  onLeaveMission,
  onOpenAuth,
  onBecomeGuardian,
  onSponsorClick,
  onToast
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  if (!isOpen || !mission) return null;

  const isExternal = Boolean(mission.isLiveSourced || mission.external || mission.organizerType === 'External Organization');
  const isJoined = isExternal ? isCleanupParticipating(mission) : joinedMissionIds.includes(mission.id);
  const isPastMission = Boolean(mission.date && mission.date < todayStr);

  const handleToggleAction = async () => {
    setIsSubmitting(true);
    try {
      if (isExternal) {
        if (isJoined) {
          const res = leaveOrRemoveCleanup(mission);
          if (onToast) onToast(res.message, 'success');
        } else {
          const res = joinOrSaveCleanup(mission);
          if (onToast) onToast(res.message, res.success ? 'success' : 'info');
        }
      } else {
        // Canonical Join Guard logic matching cleanup cards exactly
        if (!user || !user.id) {
          if (onToast) onToast('Please sign in to join community cleanup missions.', 'info');
          if (onOpenAuth) onOpenAuth();
          return;
        }

        if (!profile?.isGuardian) {
          if (onToast) onToast('Become an AquaRise Guardian to join community cleanup missions.', 'info');
          if (onBecomeGuardian) onBecomeGuardian();
          return;
        }

        const targetMissionId = mission.missionId || mission.id;
        if (isJoined) {
          if (onLeaveMission) {
            const res = await onLeaveMission(targetMissionId);
            if (res?.error && onToast) onToast(res.error, 'error');
          }
        } else {
          if (isPastMission) {
            if (onToast) onToast('Past missions are completed and cannot accept new joins.', 'info');
            return;
          }

          if (onJoinMission) {
            const res = await onJoinMission(targetMissionId);
            if (res?.error && onToast) onToast(res.error, 'error');
          }
        }
      }
    } catch (err) {
      if (onToast) onToast('An error occurred updating your mission status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const participants = mission.participants || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#92F1EC] p-0 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Image Banner */}
        <div className="relative h-60 w-full shrink-0">
          <img src={mission.image || mission.bannerImage || mission.imageSrc} alt={mission.title || mission.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071325]/80 via-transparent to-black/30"></div>
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#071325] backdrop-blur-md shadow-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4">
            {isExternal ? (
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#076DDF] text-white shadow-sm">
                Official External Event
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#19887F] text-white shadow-sm flex items-center gap-1">
                <Shield className="w-3 h-3 text-white" />
                AquaRise Community Mission
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <h2 className="text-xl sm:text-2xl font-black line-clamp-1">{mission.title || mission.name}</h2>
            <p className="text-xs text-slate-200 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#92F1EC]" />
              <span>{mission.waterbodyName || mission.location} • {mission.location}</span>
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          
          {/* Key Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Event Date</span>
              <span className="text-xs font-bold text-ocean-950 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#076DDF]" />
                {mission.date || 'TBD'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Start Time</span>
              <span className="text-xs font-bold text-ocean-950">
                {mission.startTime || mission.time || '10:00 AM'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Organizer</span>
              <span className="text-xs font-bold text-ocean-950 truncate block">
                {mission.organizer || 'AquaRise Network'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-[#19887F] tracking-wider">About This Mission</h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {mission.description || 'Community-led cleanup mission dedicated to removing plastic waste and debris from local waters.'}
            </p>
          </div>

          {/* Meeting Point */}
          {mission.meetingLocation && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1 text-xs">
              <span className="font-bold text-[#19887F] block uppercase tracking-wider text-[10px]">Meeting Point / Access</span>
              <p className="font-semibold text-ocean-950">{mission.meetingLocation}</p>
            </div>
          )}

          {/* Registered Participants Section */}
          {!isExternal && (
            <div className="space-y-3 pt-2 border-t border-teal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#19887F]" />
                  <h4 className="text-xs font-black uppercase text-[#071325] tracking-wider">
                    Registered Participants ({participants.length} / {mission.maxCapacity || 25})
                  </h4>
                </div>
                {participants.length >= (mission.maxCapacity || 25) && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    At Capacity
                  </span>
                )}
              </div>

              {participants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {participants.map((part) => (
                    <div key={part.userId} className="flex items-center gap-3 p-2.5 rounded-2xl bg-teal-50/40 border border-teal-100">
                      <div className="w-8 h-8 rounded-full bg-[#19887F] text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                        {part.avatarUrl ? (
                          <img src={part.avatarUrl} alt={part.displayName} className="w-full h-full object-cover" />
                        ) : (
                          part.displayName?.slice(0, 2).toUpperCase() || 'AG'
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#071325] block truncate">{part.displayName}</span>
                        <span className="text-[10px] text-[#19887F] font-semibold block truncate">
                          {part.guardianRole || 'Field Volunteer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                  No participants registered yet. Be the first Guardian to join!
                </p>
              )}
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-semibold w-full sm:w-auto">
            {isExternal ? (
              <span>Saved events appear in your My Cleanups dashboard.</span>
            ) : (
              <span>Joined community missions count towards your Guardian verified impact.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isExternal && mission.sourceUrl && mission.sourceUrl !== '#' ? (
              <a
                href={mission.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Register on Source Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleToggleAction}
                disabled={isSubmitting || (isPastMission && !isJoined)}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isJoined
                    ? 'bg-teal-100 hover:bg-rose-50 hover:text-rose-700 text-[#19887F] border border-[#92F1EC]'
                    : isPastMission
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                    : 'bg-[#076DDF] hover:bg-[#3C92FF] text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : isJoined ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#19887F]" />
                    <span>Joined ✓ (Click to Leave)</span>
                  </>
                ) : isPastMission ? (
                  <span>Event Ended</span>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>{isExternal ? 'Save to My Cleanups' : 'Join Mission'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
