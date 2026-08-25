import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users, ExternalLink, Bookmark, CheckCircle2, Package, ShieldAlert } from 'lucide-react';
import { isCleanupParticipating, joinOrSaveCleanup, leaveOrRemoveCleanup } from '../../services/participationService';

export default function MissionDetailModal({ mission, isOpen, onClose, onSponsorClick, onToast }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (mission) {
      setIsSaved(isCleanupParticipating(mission));
    }
  }, [mission, isOpen]);

  if (!isOpen || !mission) return null;

  const isExternal = Boolean(mission.isLiveSourced || mission.external || mission.organizerType === 'External Organization');

  const handleToggleAction = () => {
    if (isSaved) {
      const res = leaveOrRemoveCleanup(mission);
      setIsSaved(false);
      if (onToast) onToast(res.message, 'success');
    } else {
      const res = joinOrSaveCleanup(mission);
      if (res.success) {
        setIsSaved(true);
        if (onToast) onToast(res.message, 'success');
      } else {
        if (onToast) onToast(res.message, 'info');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#92F1EC] p-0 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Image Banner */}
        <div className="relative h-60 w-full shrink-0">
          <img src={mission.image || mission.imageSrc} alt={mission.title || mission.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071325]/80 via-transparent to-black/30"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#071325] backdrop-blur-md shadow-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4">
            {isExternal ? (
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#076DDF] text-white shadow-sm">
                Official External Event
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#19887F] text-white shadow-sm">
                AquaRise Mission • {mission.verificationStatus || 'Unverified'}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-black text-white drop-shadow-md">
              {mission.title || mission.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-[#334155]">
          
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold p-3.5 rounded-2xl bg-[#F0FDFD] border border-[#92F1EC]">
            <span className="flex items-center gap-1.5 text-[#076DDF]">
              <MapPin className="w-4 h-4 text-[#35AEAC]" />
              {mission.location || 'Location TBD'}
            </span>

            <span className="flex items-center gap-1.5 text-[#19887F]">
              <Calendar className="w-4 h-4 text-[#19887F]" />
              {mission.date || 'Date TBD'}
            </span>

            <span className="flex items-center gap-1.5 text-[#071325]">
              <Users className="w-4 h-4 text-[#076DDF]" />
              {mission.organizer || 'AquaRise Community'}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#19887F]">
              About This Cleanup
            </h4>
            <p className="text-sm text-[#475569] leading-relaxed font-medium">
              {mission.description || 'Join community members and environmental volunteers in removing pollutants and restoring clean waters.'}
            </p>
          </div>

          {/* External Registration Disclaimer Banner */}
          {isExternal && (
            <div className="p-4 rounded-2xl bg-[#DAF6F6] border border-[#92F1EC] space-y-1">
              <div className="flex items-center gap-2 text-[#071325] font-black text-xs">
                <ShieldAlert className="w-4 h-4 text-[#076DDF]" />
                <span>External Event Registration Notice</span>
              </div>
              <p className="text-xs text-[#334155] font-medium leading-relaxed">
                Registration for this cleanup is handled directly by the external organizer. AquaRise lets you save and track the opportunity in your personal dashboard.
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#92F1EC] flex flex-col sm:flex-row items-center gap-3">
            
            {/* Save / Join Button */}
            <button
              onClick={handleToggleAction}
              className={`w-full sm:flex-1 py-3 px-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                isSaved
                  ? 'bg-[#E6FCFA] text-[#19887F] border border-[#92F1EC] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  : 'btn-primary-ocean'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#19887F]" />
                  <span>{isExternal ? 'Saved ✓ (Click to Remove)' : 'Joined ✓ (Click to Leave)'}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>{isExternal ? 'Save to My Cleanups' : 'Join Mission'}</span>
                </>
              )}
            </button>

            {/* External Official Link or Remote Sponsor CTA */}
            {isExternal && (mission.eventUrl || mission.sourceUrl) && (
              <a
                href={mission.eventUrl || mission.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#19887F] hover:bg-[#35AEAC] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2"
              >
                <span>View Official Event</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {!isExternal && onSponsorClick && (
              <button
                onClick={() => {
                  onClose();
                  onSponsorClick();
                }}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-[#E6FCFA] text-[#19887F] hover:bg-[#92F1EC] font-extrabold text-xs border border-[#92F1EC]"
              >
                Sponsor Remote Supplies
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
