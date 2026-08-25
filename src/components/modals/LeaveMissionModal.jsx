import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export default function LeaveMissionModal({ mission, isOpen, onClose, onConfirmLeave }) {
  if (!isOpen || !mission) return null;

  const missionTitle = mission.title || mission.name || 'AquaRise Cleanup Mission';

  const handleLeaveClick = (e) => {
    e.stopPropagation();
    const targetId = mission.id || mission.missionId || mission.cleanupMissionId;
    onConfirmLeave(targetId);
    onClose();
  };

  const handleKeepClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-2xl relative space-y-6"
      >
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleKeepClick}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-ocean-950">Leave this cleanup mission?</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              You will no longer be listed as participating in this mission. The cleanup itself will remain available.
            </p>
            <p className="text-[11px] text-slate-500 font-bold bg-slate-50 py-1.5 px-3 rounded-xl inline-block border border-slate-200">
              Mission: {missionTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleKeepClick}
            className="flex-1 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs transition-all"
          >
            Keep Mission
          </button>

          <button
            type="button"
            onClick={handleLeaveClick}
            className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Leave Mission</span>
          </button>
        </div>

      </div>
    </div>
  );
}
