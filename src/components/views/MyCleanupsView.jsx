import React, { useState, useEffect } from 'react';
import { Bookmark, Calendar, MapPin, ExternalLink, Compass, Trash2, CheckCircle2, ShieldCheck, Flag, Info, FileCheck, Clock, AlertCircle } from 'lucide-react';
import { getParticipations, leaveOrRemoveCleanup, categorizeParticipations } from '../../services/participationService';

export default function MyCleanupsView({
  onNavigateCleanups,
  onViewMission,
  onOpenEvidenceModal,
  onOpenLeaveModal,
  onToast
}) {
  const [participations, setParticipations] = useState([]);

  const loadParticipations = () => {
    setParticipations(getParticipations());
  };

  useEffect(() => {
    loadParticipations();

    const handleStorageChange = () => loadParticipations();
    window.addEventListener('aquarise_participation_changed', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('aquarise_participation_changed', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleRemove = (item) => {
    if (item.type === 'community' || item.isUserCreated) {
      if (onOpenLeaveModal) onOpenLeaveModal(item);
    } else {
      const res = leaveOrRemoveCleanup(item);
      loadParticipations();
      if (onToast) onToast(res.message, 'success');
    }
  };

  const { upcoming, past } = categorizeParticipations(participations);

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#35AEAC]/20 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-white px-3.5 py-1 rounded-full border border-[#92F1EC] inline-block shadow-sm">
              Personal Action Dashboard
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-ocean-950">
              My <span className="text-[#19887F]">Cleanups</span>
            </h1>

            <p className="text-slate-700 text-base font-medium">
              Track your joined community missions and saved external cleanup opportunities.
            </p>
          </div>

          <button
            onClick={onNavigateCleanups}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#19887F] hover:bg-[#35AEAC] text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
          >
            <Compass className="w-4 h-4 text-white" />
            <span>Explore Cleanups</span>
          </button>
        </div>

        {/* Required Honest Empty State (Requirement #14) */}
        {participations.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white rounded-3xl border border-[#92F1EC] space-y-6 max-w-2xl mx-auto shadow-md animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-[#92F1EC] text-[#19887F] mx-auto flex items-center justify-center">
              <Bookmark className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-ocean-950">No cleanup participation yet</h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto font-medium">
                Join a genuine AquaRise mission or save an external opportunity to begin building your impact history.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onNavigateCleanups}
                className="px-6 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-extrabold shadow-md inline-flex items-center gap-2 transition-all"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Explore Cleanups</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* UPCOMING SECTION */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#19887F]"></span>
                <h2 className="text-xl font-black text-ocean-950 uppercase tracking-wider">
                  Upcoming ({upcoming.length})
                </h2>
              </div>

              {upcoming.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white border border-[#92F1EC] text-xs text-slate-600 font-medium text-center shadow-sm">
                  No upcoming cleanups saved.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((item) => (
                    <CleanupCard
                      key={item.id}
                      item={item}
                      onRemove={() => handleRemove(item)}
                      onView={() => onViewMission && onViewMission(item)}
                      onOpenEvidenceModal={() => onOpenEvidenceModal && onOpenEvidenceModal(item)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* PAST SECTION */}
            {past.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-[#92F1EC]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <h2 className="text-xl font-black text-slate-600 uppercase tracking-wider">
                    Past ({past.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-85">
                  {past.map((item) => (
                    <CleanupCard
                      key={item.id}
                      item={item}
                      onRemove={() => handleRemove(item)}
                      onView={() => onViewMission && onViewMission(item)}
                      onOpenEvidenceModal={() => onOpenEvidenceModal && onOpenEvidenceModal(item)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

function CleanupCard({ item, onRemove, onView, onOpenEvidenceModal }) {
  const isCommunity = item.type === 'community' || item.isUserCreated;
  const isPending = item.verificationStatus === 'pending' || item.status === 'Pending Verification';
  const isVerified = item.verificationStatus === 'verified' || item.status === 'Verified Complete';

  return (
    <div className="bg-white rounded-3xl border border-[#92F1EC] overflow-hidden flex flex-col justify-between shadow-md hover:border-[#35AEAC] transition-all">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full text-white ${
            isCommunity ? 'bg-[#19887F]' : 'bg-[#076DDF]'
          }`}>
            {isCommunity ? 'AquaRise Mission' : 'External Opportunity'}
          </span>
          <span className="text-xs font-bold text-[#19887F] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            {item.status || 'Saved'}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-ocean-950 line-clamp-1">{item.title}</h3>
          <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#19887F] shrink-0" />
            <span className="truncate">{item.waterbodyName || item.location}</span>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Date</span>
            <span className="font-bold text-ocean-950 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#076DDF]" />
              {item.date}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Organizer</span>
            <span className="font-bold text-[#19887F] truncate block">
              {item.organizer}
            </span>
          </div>
        </div>

        {/* Action Buttons (Requirement #1 & #16 & #17) */}
        <div className="pt-3 border-t border-[#92F1EC] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log('[AquaRise Participation] Leave clicked in My Cleanups:', {
                  missionId: item.id || item.missionId,
                  title: item.title
                });
                onRemove();
              }}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title={isCommunity ? 'Leave Mission' : 'Remove from My Cleanups'}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isCommunity ? 'Leave Mission' : 'Remove'}</span>
            </button>

            {!isCommunity && item.sourceUrl && item.sourceUrl !== '#' ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#076DDF] hover:bg-[#3C92FF] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>View Official Event</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={onView}
                className="bg-slate-100 hover:bg-slate-200 text-ocean-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <span>View Details</span>
              </button>
            )}
          </div>

          {/* Submit Completion Evidence button for community missions ONLY */}
          {isCommunity && (
            <button
              onClick={onOpenEvidenceModal}
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                isPending
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                  : isVerified
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#076DDF] text-white hover:bg-[#3C92FF]'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{isPending ? 'Pending Verification' : isVerified ? 'Verified Complete' : 'Submit Completion Evidence'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
