import React from 'react';
import { Shield, Star, MapPin, Award, Clock } from 'lucide-react';
import { getGuardianLevel } from '../../utils/points';

export default function PublicGuardianCard({ profile, points, completedCount, volunteerHours }) {
  if (!profile) return null;

  const levelInfo = getGuardianLevel(points || 0);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#92F1EC] shadow-md hover:border-[#35AEAC] transition-all flex items-center justify-between gap-4 group">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#92F1EC] shrink-0 relative bg-teal-50 shadow-sm">
          {profile.avatarUrl || profile.avatar ? (
            <img src={profile.avatarUrl || profile.avatar} alt={profile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg bg-[#076DDF]">
              {profile.name?.slice(0, 2).toUpperCase() || 'AG'}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-ocean-950 group-hover:text-[#076DDF] transition-colors">{profile.name || 'AquaRise Guardian'}</h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#19887F] border border-teal-200">
              {levelInfo.levelName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#19887F]" />
              {profile.city ? `${profile.city}, ${profile.country || ''}` : profile.country || profile.location || 'Global'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              <Clock className="w-3.5 h-3.5 text-[#076DDF]" />
              {volunteerHours || 0} hrs verified
            </span>
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="text-2xl font-black text-[#076DDF] block">{points || 0}</span>
        <span className="text-[10px] font-extrabold text-[#19887F] uppercase tracking-wider">AquaRise Points</span>
      </div>
    </div>
  );
}
