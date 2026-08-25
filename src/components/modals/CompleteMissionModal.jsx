import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Trash2, Award, Info } from 'lucide-react';

export default function CompleteMissionModal({ mission, isOpen, onClose, onComplete }) {
  const [hours, setHours] = useState(3);
  const [wasteKg, setWasteKg] = useState(10);

  if (!isOpen || !mission) return null;

  // Calculate points preview
  const cleanupPoints = 1;
  const volunteerPoints = Number(hours) * 2;
  const wastePoints = Math.floor(Number(wasteKg) / 5) * 3;
  const pointsPreview = cleanupPoints + volunteerPoints + wastePoints;

  const handleSubmit = (e) => {
    e.preventDefault();
    const record = {
      id: `part-${Date.now()}`,
      guardianId: 'guardian-001',
      cleanupMissionId: mission.id,
      title: mission.title || mission.name,
      waterbodyName: mission.waterbodyName || mission.name,
      location: mission.location,
      date: mission.date || new Date().toISOString().split('T')[0],
      status: 'Completed',
      volunteerHours: Number(hours),
      wasteCollectedKg: Number(wasteKg),
      pointsEarned: pointsPreview,
      completedAt: new Date().toISOString().split('T')[0]
    };

    onComplete(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-emerald/40 p-6 sm:p-8 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-ocean-900 hover:bg-ocean-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald/20 text-emerald border border-emerald/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald bg-emerald/10 px-2 py-0.5 rounded-full border border-emerald/20">
                Self-Reported Demo Impact
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Complete Mission Participation</h3>
              <p className="text-xs text-slate-300">Log field hours & waste for {mission.title || mission.name}.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Volunteer Hours Contributed *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Waste Collected (kg) *
              </label>
              <div className="relative">
                <Trash2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="0"
                  max="1000"
                  required
                  value={wasteKg}
                  onChange={(e) => setWasteKg(e.target.value)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald"
                />
              </div>
            </div>

            {/* Points Calculation Breakdown Box */}
            <div className="p-4 rounded-xl bg-ocean-950 border border-emerald/30 space-y-2 text-xs">
              <span className="font-bold text-emerald flex items-center justify-between">
                <span>Calculated Points Award:</span>
                <span className="text-lg font-black text-white">+{pointsPreview} AquaRise Points</span>
              </span>
              <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-ocean-800">
                <div className="flex justify-between">
                  <span>Cleanup completion:</span>
                  <span className="text-slate-200">+1 pt</span>
                </div>
                <div className="flex justify-between">
                  <span>Volunteer time ({hours} hrs × 2):</span>
                  <span className="text-slate-200">+{volunteerPoints} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Waste removed (floor({wasteKg}/5) × 3):</span>
                  <span className="text-slate-200">+{wastePoints} pts</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-ocean-900 border border-ocean-800 text-[10px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-aqua-400 shrink-0" />
              <span>Self-reported prototype impact. Community verification coming in future stages.</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald via-teal-400 to-ocean-600 text-ocean-950 font-bold text-sm shadow-lg shadow-emerald/20 hover:scale-[1.01] transition-all"
              >
                Log Completion & Award Points
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
