import React, { useState, useMemo } from 'react';
import { Award, Shield, CheckCircle2, Clock, Trash2, Download, ExternalLink, Sparkles, Star, Edit3, Share2, PlusCircle, AlertTriangle, Heart, Flag, Info, Users, Compass, FileCheck, ShieldAlert, FileText, HelpCircle, Eye } from 'lucide-react';
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

  // Centralized points calculation (Strictly derived from VERIFIED records per Requirement #19)
  const pointsData = useMemo(() => {
    return calculateGuardianPoints(safeParticipations);
  }, [safeParticipations]);

  const levelInfo = useMemo(() => {
    return getGuardianLevel(pointsData.totalPoints);
  }, [pointsData.totalPoints]);

  const achievements = useMemo(() => {
    return evaluateAchievements(safeParticipations, safeReports, safeMissions, safeCertificates);
  }, [safeParticipations, safeReports, safeMissions, safeCertificates]);

  const joinedCount = useMemo(() => {
    return safeParticipations.filter((p) => p && (p.status === 'Joined' || p.type === 'community')).length;
  }, [safeParticipations]);

  const verifiedCount = useMemo(() => {
    return safeParticipations.filter((p) => p && (p.verificationStatus === 'verified' || p.status === 'Verified Complete')).length;
  }, [safeParticipations]);

  const handleShareImpact = () => {
    const summaryText = `${profile?.name || 'Guardian'}'s AquaRise Impact — ${verifiedCount} verified cleanups • ${pointsData.totalHours} volunteer hours • ${pointsData.totalPoints} AquaRise Points • ${levelInfo.levelName}`;
    navigator.clipboard?.writeText?.(summaryText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* 1. Profile Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#19887F] to-[#076DDF] p-0.5 shadow-md shrink-0">
                {profile?.avatarUrl || profile?.avatar ? (
                  <img
                    src={profile.avatarUrl || profile.avatar}
                    alt={profile?.name || 'Guardian Avatar'}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-white text-xl bg-[#076DDF] rounded-[14px]">
                    {profile?.name?.slice(0, 2).toUpperCase() || 'AG'}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-ocean-950">{profile?.name || 'AquaRise Guardian'}</h1>
                  <button
                    onClick={onOpenEditProfile}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 border border-teal-200 transition-colors"
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
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleShareImpact}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#19887F] text-xs font-bold border border-teal-200 transition-all flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Impact Summary'}</span>
              </button>
            </div>

          </div>

          {/* Level Progress Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-ocean-950 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#19887F]" />
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

        {/* 2. Key Metrics Grid (Requirement #19: Strictly count verified data) */}
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
            <span className="text-3xl font-extrabold text-[#19887F] block">{pointsData.totalHours} hrs</span>
            <span className="text-[11px] text-slate-500 block">Verified Contribution</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#92F1EC] shadow-sm space-y-1">
            <span className="text-xs text-slate-500 block font-semibold">Issued Certificates</span>
            <span className="text-3xl font-extrabold text-amber-600 block">{safeCertificates.length}</span>
            <span className="text-[11px] text-slate-500 block">Official Guardian Awards</span>
          </div>
        </div>

        {/* 3. Official Certificates Section & Certificate Preview (Requirement #18) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-teal-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-ocean-950 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                Guardian Certificates
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Verified AquaRise cleanup participation can earn a Certificate of Appreciation.
              </p>
            </div>
          </div>

          {/* Genuine Issued Certificates List */}
          {safeCertificates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeCertificates.map((cert) => (
                <div key={cert.id} className="p-5 rounded-2xl bg-amber-50/50 border border-amber-300 flex flex-col justify-between space-y-4 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        Official Certificate
                      </span>
                      <span className="text-slate-500 font-semibold">{cert.issuedDate || cert.issuedAt}</span>
                    </div>

                    <h3 className="text-lg font-bold text-ocean-950 mt-2">{cert.waterbodyName} Cleanup</h3>
                    <p className="text-xs text-slate-700 mt-1">Issued to: <strong className="text-ocean-950">{cert.guardianName}</strong></p>
                    <span className="text-[11px] text-slate-500 block mt-1 font-mono">ID: {cert.certificateId}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs">
                    <span className="text-emerald-700 font-bold">{cert.volunteerHours} Verified Volunteer Hours</span>

                    <button
                      onClick={() => onViewCertificate(cert)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REQUIREMENT #18: CERTIFICATE PREVIEW SECTION */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 border border-teal-200/80 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-[#19887F] bg-white px-3 py-1 rounded-full border border-teal-200 shadow-sm">
                Certificate Preview
              </span>
              <span className="text-[11px] text-slate-400 font-medium italic">Sample Watermark — Not Issued</span>
            </div>

            {/* Visual Sample Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-dashed border-teal-300 text-center space-y-3 shadow-inner relative">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-amber-500 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-ocean-950 uppercase tracking-wide">Certificate of Appreciation</h4>
              <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto">
                Presented to an <strong className="text-[#076DDF]">AquaRise Guardian</strong> for contributing to the protection and restoration of our waters.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                Sample Verification Signature • AquaRise Global Field Registry
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium text-center leading-relaxed">
              Submit completion evidence after an eligible cleanup. Once your participation is verified, your personalized certificate will appear here.
            </p>
          </div>
        </div>

        {/* 4. Cleanup Participation Records & Evidence Flow (Requirement #1, #11, #12, #13, #14) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-ocean-950 flex items-center gap-2">
                <Flag className="w-6 h-6 text-[#076DDF]" />
                Cleanup Participation Records
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Track joined missions and submit completion evidence for verification.
              </p>
            </div>

            <button
              onClick={onNavigateCleanups}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#076DDF] text-xs font-bold border border-teal-200 shrink-0"
            >
              Find More Cleanups ➔
            </button>
          </div>

          {safeParticipations.length > 0 ? (
            <div className="space-y-4">
              {safeParticipations.map((item) => {
                if (!item) return null;
                const vStatus = item.verificationStatus || (item.status === 'Verified Complete' ? 'verified' : 'joined');
                const isPending = vStatus === 'pending' || item.status === 'Pending Verification';
                const isNeedsMore = vStatus === 'needs_more_evidence' || item.status === 'Needs More Evidence';
                const isRejected = vStatus === 'rejected' || item.status === 'Not Verified';
                const isVerified = vStatus === 'verified' || item.status === 'Verified Complete';

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        {/* Dynamic Status Badges (Requirement #10, #11, #12, #13, #14) */}
                        {isPending && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Verification
                          </span>
                        )}

                        {isNeedsMore && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Needs More Evidence
                          </span>
                        )}

                        {isRejected && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Not Verified
                          </span>
                        )}

                        {isVerified && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Complete
                          </span>
                        )}

                        {!isPending && !isNeedsMore && !isRejected && !isVerified && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-[#19887F] border border-teal-300">
                            Joined
                          </span>
                        )}

                        <span className="text-xs text-slate-500 font-semibold">{item.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-ocean-950">{item.title}</h3>
                      <p className="text-xs text-slate-600">{item.waterbodyName} • {item.location}</p>

                      {/* Helper texts per requirements */}
                      {isPending && (
                        <p className="text-[11px] text-amber-700 font-medium">Your evidence is being reviewed.</p>
                      )}

                      {isNeedsMore && (
                        <p className="text-[11px] text-orange-700 font-medium">Additional evidence is required before this participation can be verified.</p>
                      )}

                      {isVerified && (
                        <p className="text-[11px] text-emerald-700 font-bold">{item.volunteerHours || 3} Verified Volunteer Hours • Attended {item.dateAttended || item.date}</p>
                      )}
                    </div>

                    {/* Action Area (Requirement #1, #11, #12, #14, #17) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isPending && (
                        <button
                          onClick={() => onOpenEvidenceModal(item)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#076DDF] font-bold text-xs border border-teal-200 flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Submitted Evidence</span>
                        </button>
                      )}

                      {isNeedsMore && (
                        <button
                          onClick={() => onOpenEvidenceModal(item)}
                          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Update Evidence</span>
                        </button>
                      )}

                      {isVerified && (
                        <button
                          onClick={() => {
                            const cert = safeCertificates.find((c) => c && (c.participationRecordId === item.id || c.cleanupMissionId === item.missionId));
                            if (cert) onViewCertificate(cert);
                            else onGenerateCertificate(item);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>
                      )}

                      {!isPending && !isNeedsMore && !isVerified && (
                        canSubmitCompletionEvidence(item) ? (
                          <button
                            type="button"
                            onClick={() => onOpenEvidenceModal(item)}
                            className="px-4 py-2 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>Submit Completion Evidence</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            type="button"
                            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 cursor-not-allowed font-bold text-xs flex items-center gap-1.5 border border-slate-300"
                            title="Evidence available after the cleanup mission ends."
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Evidence available after cleanup</span>
                          </button>
                        )
                      )}

                      {/* Separate Leave Mission button (Requirement #17) */}
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('[AquaRise Participation] Leave clicked in My Impact:', {
                              missionId: item.id || item.missionId,
                              title: item.title
                            });
                            onOpenLeaveModal(item);
                          }}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-teal-200 hover:border-rose-300 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Leave Mission</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* REQUIRED HONEST PARTICIPATION EMPTY STATE (REQUIREMENT #14) */
            <div className="text-center py-10 px-4 bg-slate-50 border border-teal-200/60 rounded-2xl space-y-3 max-w-md mx-auto">
              <Flag className="w-10 h-10 text-[#076DDF] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ocean-950">No cleanup participation yet</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Join a genuine AquaRise mission or save an external opportunity to begin building your impact history.
                </p>
              </div>
              <button
                onClick={onNavigateCleanups}
                className="px-5 py-2.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-extrabold shadow-md transition-all inline-block mt-2"
              >
                Explore Field Cleanups
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
