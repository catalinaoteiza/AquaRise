import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, ShieldCheck, Users, Package, CheckCircle2, Heart, Flag, Share2, Info, Droplets, Shield, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';
import LocationMapPlaceholder from '../common/LocationMapPlaceholder';
import { getCleanupDateStatus, formatCleanupDate, formatCleanupStartTime, formatCleanupDuration } from '../../utils/cleanupUtils.js';

export default function MissionDetailView({
  mission,
  user,
  profile,
  joinedMissionIds = [],
  onJoinMission,
  onLeaveMission,
  onOpenAuth,
  onBecomeGuardian,
  onSponsorClick,
  onBack,
  onBackToCleanups,
  onToast
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!mission) return null;

  const targetMissionId = mission.missionId || mission.id;
  const isJoined = (joinedMissionIds || []).includes(targetMissionId) || (joinedMissionIds || []).includes(mission.id);
  const handleToggleJoin = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!profile?.isGuardian) {
      if (onBecomeGuardian) onBecomeGuardian();
      return;
    }

    if (isJoined) {
      if (onLeaveMission) await onLeaveMission(targetMissionId);
    } else {
      if (onJoinMission) await onJoinMission(targetMissionId);
    }
  };

  const handleBack = () => {
    if (typeof onBackToCleanups === 'function') {
      onBackToCleanups();
    } else if (typeof onBack === 'function') {
      onBack();
    }
  };

  const currentCount = (mission.participantCount || 0) + (isJoined ? 1 : 0);
  const heroImage = mission.bannerImage || mission.image;

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const dateStatus = getCleanupDateStatus(mission);
  const isPastMission = dateStatus === 'Past';
  const isVerified = mission.verificationStatus === 'verified' || mission.status === 'Verified Complete';
  const isOrganizer = Boolean(user?.id && (mission.organizerId === user.id || mission.organizer_id === user.id));

  const formattedDate = formatCleanupDate(mission.date);
  const formattedStartTime = formatCleanupStartTime(mission.startTime || mission.time);
  const formattedDuration = formatCleanupDuration(mission.estimatedDuration || mission.duration);

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* Top Breadcrumb / Standardized Back Button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-ocean-950 font-bold text-xs border border-[#92F1EC] hover:bg-[#92F1EC]/30 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#076DDF]"
          >
            <ArrowLeft className="w-4 h-4 text-[#19887F]" />
            <span>Back to Cleanups</span>
          </button>

          {/* Badges: Date Status & Verification Status (Section 3) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Status Badge */}
            <span className={`text-xs font-black px-3.5 py-1 rounded-full text-white shadow-sm uppercase tracking-wider ${
              dateStatus === 'Past' ? 'bg-slate-600' : dateStatus === 'Today' ? 'bg-amber-600' : 'bg-[#19887F]'
            }`}>
              {dateStatus}
            </span>

            {/* Source Type Badge */}
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-[#19887F] text-white shadow-sm uppercase tracking-wider">
              {isOrganizer ? 'Organized by You' : 'AquaRise Mission'}
            </span>
            
            {/* Verification Status Badge */}
            <span className={`text-xs font-black px-3.5 py-1 rounded-full border shadow-sm uppercase tracking-wider ${
              isVerified
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
            </span>
          </div>
        </div>

        {/* Hero Banner Area */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#92F1EC] bg-white min-h-[220px] sm:min-h-[320px] flex items-center justify-center">
          {heroImage && !imgError ? (
            <img src={heroImage} alt={mission.title} onError={() => setImgError(true)} className="w-full h-full object-cover max-h-[380px]" />
          ) : (
            <div className="w-full h-full py-16 px-8 bg-gradient-to-br from-[#19887F] via-[#35AEAC] to-[#076DDF] text-white text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
                <Droplets className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black">{mission.title}</h2>
            </div>
          )}
        </div>

        {/* Grid Layout: Main Details & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Info Area */}
          <div className="lg:col-span-8 space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#19887F]">
                <MapPin className="w-4 h-4 text-[#19887F] shrink-0" />
                <span>{mission.waterbodyName} • {mission.location || `${mission.city || ''}, ${mission.country || ''}`}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-ocean-950 leading-tight">
                {mission.title}
              </h1>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#19887F]" />
                <span>Organized by: <strong className="text-ocean-950">{mission.organizer || 'AquaRise Guardian'}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#92F1EC]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Event Date</span>
                <div className="font-bold text-ocean-950 flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4 text-[#076DDF]" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Start Time</span>
                <div className="font-bold text-ocean-950 flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-[#19887F]" />
                  <span>{formattedStartTime}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Estimated Duration</span>
                <div className="font-bold text-ocean-950 flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{formattedDuration}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {mission.description}
              </p>
            </div>

            {mission.meetingLocation && (
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-ocean-950 font-medium">
                <strong>Meeting Point:</strong> {mission.meetingLocation}
              </div>
            )}
          </div>

          {/* Participation Action Sidebar Card */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-ocean-950">
                <span>Guardians Joined</span>
                <span className="text-[#19887F] font-extrabold">{currentCount} / {mission.volunteerCapacity || mission.maxCapacity || 50}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#19887F] rounded-full"
                  style={{ width: `${Math.min(100, (currentCount / (mission.volunteerCapacity || mission.maxCapacity || 50)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              {isOrganizer ? (
                <div className="w-full py-3 rounded-full font-extrabold text-xs bg-[#19887F]/10 border border-[#19887F]/30 text-[#19887F] flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#19887F]" />
                  <span>Organized by You • Mission Reviewer</span>
                </div>
              ) : isPastMission && !isJoined ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-full font-extrabold text-xs bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Event Ended</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleJoin}
                  className={`w-full py-3 rounded-full font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isJoined
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#19887F] hover:bg-[#35AEAC] text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{isJoined ? 'Leave Mission' : 'Join Mission'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 rounded-full bg-white hover:bg-slate-50 text-ocean-950 font-bold text-xs border border-teal-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#076DDF]" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Mission'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
