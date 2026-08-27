import React, { useState, useMemo } from 'react';
import { Award, Shield, CheckCircle2, Clock, Trash2, Download, ExternalLink, Sparkles, Star, Edit3, Share2, PlusCircle, AlertTriangle, Heart, Flag, Info, Users, Compass, FileCheck, ShieldAlert, FileText, HelpCircle, Eye, GraduationCap, BookOpen } from 'lucide-react';
import { calculateGuardianPoints, getGuardianLevel, evaluateAchievements } from '../../utils/points';
import { isEligibleForCertificate } from '../../utils/certificate';
import { canSubmitCompletionEvidence } from '../../utils/cleanupUtils.js';
import { isEvidenceOfficiallyVerified } from '../../utils/auth.js';

export default function MyImpactView({
  user,
  profile,
  participations = [],
  reports = [],
  missions = [],
  certificates = [],
  onOpenAuth,
  onOpenEditProfile,
  onOpenEvidenceModal,
  onOpenLeaveModal,
  onGenerateCertificate,
  onViewCertificate,
  onNavigateCleanups,
  onNavigateExplore,
  onNavigateReport
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  if (!user) {
    return (
      <div className="bg-[#DAF6F6] min-h-screen pt-32 pb-20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#92F1EC] p-8 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#19887F] mx-auto flex items-center justify-center shadow-md">
            <Award className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-ocean-950">Join the AquaRise Network</h2>
            <p className="text-xs text-slate-600 font-medium">
              Sign in to access your personal Guardian dashboard, certificates, and impact tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Sign In / Join AquaRise
          </button>
        </div>
      </div>
    );
  }

  const safeParticipations = useMemo(() => {
    return Array.isArray(participations) ? participations : [];
  }, [participations]);

  const safeReports = useMemo(() => {
    return Array.isArray(reports) ? reports : [];
  }, [reports]);

  const safeMissions = useMemo(() => {
    return Array.isArray(missions) ? missions : [];
  }, [missions]);

  const safeCertificates = useMemo(() => {
    return Array.isArray(certificates) ? certificates : [];
  }, [certificates]);

  // Centralized points calculation (Strictly derived from VERIFIED records)
  const pointsData = useMemo(() => {
    return calculateGuardianPoints(safeParticipations);
  }, [safeParticipations]);

  const levelInfo = useMemo(() => {
    return getGuardianLevel(pointsData.totalPoints);
  }, [pointsData.totalPoints]);

  const verifiedCount = useMemo(() => {
    return safeCertificates.length;
  }, [safeCertificates]);

  const totalVerifiedHours = useMemo(() => {
    let totalMins = 0;
    safeCertificates.forEach((c) => {
      totalMins += c.volunteer_minutes || (c.volunteerHours ? c.volunteerHours * 60 : 120);
    });
    return totalMins > 0 ? (totalMins / 60).toFixed(1) : pointsData.totalHours;
  }, [safeCertificates, pointsData.totalHours]);

  const achievements = useMemo(() => {
    return evaluateAchievements(safeParticipations, safeReports, safeMissions, safeCertificates);
  }, [safeParticipations, safeReports, safeMissions, safeCertificates]);

  const handleShareImpact = () => {
    const shareText = `I am an AquaRise Waterbody Guardian! Track my verified cleanup impact and certificates at ${window.location.origin}`;
    navigator.clipboard?.writeText?.(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* Profile Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#19887F] bg-teal-50 flex items-center justify-center shrink-0 shadow-md">
              {profile?.avatarUrl || profile?.avatar ? (
                <img src={profile.avatarUrl || profile.avatar} alt={profile?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-white text-xl bg-[#076DDF]">
                  {profile?.name?.slice(0, 2).toUpperCase() || 'AG'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ocean-950">{profile?.name || 'AquaRise Guardian'}</h1>
                <button
                  onClick={onOpenEditProfile}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 border border-teal-200 transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-teal-50 text-[#19887F] border border-teal-200">
                  {levelInfo.levelName}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Joined {profile?.joinedDate || '2026'} • {profile?.location || 'Global'}
                </span>
              </div>

              {profile?.bio && (
                <p className="text-xs text-slate-600 font-medium mt-2 max-w-2xl">{profile.bio}</p>
              )}

              {(profile?.schoolOrganization || profile?.school || profile?.major) && (
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                  {(profile?.schoolOrganization || profile?.school) && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      <GraduationCap className="w-3.5 h-3.5 text-[#19887F]" />
                      {profile.schoolOrganization || profile.school}
                    </span>
                  )}
                  {profile?.major && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      <BookOpen className="w-3.5 h-3.5 text-[#076DDF]" />
                      {profile.major}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleShareImpact}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#19887F] text-xs font-bold border border-teal-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Impact Summary'}</span>
            </button>
          </div>
        </div>

        {/* 1. Guardian Level Progress Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-ocean-950 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#19887F]" />
                AquaRise Guardian Status
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Level status and points earned through verified environmental contributions.
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#19887F] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {levelInfo.levelName}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 uppercase tracking-wider text-[10px]">
                Guardian Level Progress
              </span>
              <span className="text-[#19887F] font-extrabold">
                {pointsData.totalPoints} Points • Next: {levelInfo.nextLevelName}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden p-0.5 border border-teal-100">
              <div
                className="h-full rounded-full bg-[#19887F] transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#92F1EC] shadow-sm space-y-1">
            <span className="text-xs text-slate-500 block font-semibold">Cleanups Joined</span>
            <span className="text-3xl font-extrabold text-[#076DDF] block">{safeParticipations.length}</span>
            <span className="text-[11px] text-slate-500 block">Total Field Missions</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#92F1EC] shadow-sm space-y-1">
            <span className="text-xs text-slate-500 block font-semibold">Verified Cleanups</span>
            <span className="text-3xl font-extrabold text-emerald-600 block">{verifiedCount}</span>
            <span className="text-[11px] text-slate-500 block">Reviewed & Approved</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#92F1EC] shadow-sm space-y-1">
            <span className="text-xs text-slate-500 block font-semibold">Verified Volunteer Hours</span>
            <span className="text-3xl font-extrabold text-[#19887F] block">{totalVerifiedHours} hrs</span>
            <span className="text-[11px] text-slate-500 block">Verified Contribution</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#92F1EC] shadow-sm space-y-1">
            <span className="text-xs text-slate-500 block font-semibold">Issued Certificates</span>
            <span className="text-3xl font-extrabold text-amber-600 block">{safeCertificates.length}</span>
            <span className="text-[11px] text-slate-500 block">Official Guardian Awards</span>
          </div>
        </div>

        {/* 3. Official Certificates Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-teal-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-ocean-950 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                Guardian Certificates
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Verified AquaRise cleanup participation earns an official Certificate of Appreciation.
              </p>
            </div>
          </div>

          {/* Genuine Issued Certificates List */}
          {safeCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeCertificates.map((cert) => {
                const certCode = cert.certificate_code || cert.certificateId || '';
                const recipient = cert.recipient_name || cert.guardianName || 'AquaRise Guardian';
                const title = cert.mission_title || `${cert.waterbodyName || 'Community'} Cleanup`;
                const volunteerMins = cert.volunteer_minutes ?? (cert.volunteerHours ? Math.round(cert.volunteerHours * 60) : 0);
                const hoursVal = volunteerMins > 0 ? (volunteerMins / 60).toFixed(volunteerMins % 60 === 0 ? 0 : 1) : '0';
                const rawDate = cert.issued_at || cert.issuedDate;
                const dateVal = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified';

                return (
                  <div key={cert.id} className="p-5 rounded-2xl bg-amber-50/50 border border-amber-300 flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          Official Certificate
                        </span>
                        <span className="text-slate-500 font-semibold">{dateVal}</span>
                      </div>

                      <h3 className="text-lg font-bold text-ocean-950 mt-2">{title}</h3>
                      <p className="text-xs text-slate-700 mt-1">Issued to: <strong className="text-ocean-950">{recipient}</strong></p>
                      <span className="text-[11px] text-slate-500 block mt-1 font-mono">Code: {certCode}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs">
                      <span className="text-emerald-700 font-bold">{hoursVal} Verified Hours</span>

                      <button
                        onClick={() => onViewCertificate(cert)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Certificate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50 border border-teal-200 text-center space-y-3">
              <Award className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                No verified certificates issued yet. Complete an AquaRise community cleanup mission and submit evidence for reviewer approval to receive your official certificate.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
