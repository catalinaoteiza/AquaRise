// Centralized AquaRise Points & Level Engine

/**
 * Formula (Strictly calculated from genuine VERIFIED completions):
 * verifiedCleanupCount = count of records with verificationStatus === 'verified' or status === 'Verified Complete'
 * volunteerPoints = totalVerifiedVolunteerHours × 2
 * wastePoints = floor(totalWasteKg / 5) × 3
 * totalPoints = verifiedCleanupCount + volunteerPoints + wastePoints
 */
export function calculateGuardianPoints(arg1 = [], arg2 = [], arg3 = [], arg4 = [], arg5 = []) {
  let participations = [];
  let profile = null;

  if (Array.isArray(arg1)) {
    participations = arg1;
  } else if (arg1 && typeof arg1 === 'object') {
    profile = arg1;
    if (Array.isArray(arg4)) {
      participations = arg4;
    } else if (Array.isArray(arg2)) {
      participations = arg2;
    }
  }

  const safeParticipations = Array.isArray(participations) ? participations : [];

  // Strictly filter only VERIFIED completion records (Requirement #19)
  const verifiedRecords = safeParticipations.filter(
    (p) => p && (p.verificationStatus === 'verified' || p.status === 'Verified Complete')
  );
  
  const verifiedCount = verifiedRecords.length;
  
  const totalHours = verifiedRecords.reduce(
    (sum, p) => sum + (Number(p.volunteerHours || p.totalHours) || 0),
    0
  );
  
  const totalWasteKg = verifiedRecords.reduce(
    (sum, p) => sum + (Number(p.wasteCollectedKg) || 0),
    0
  );

  const cleanupPoints = verifiedCount * 1;
  const volunteerPoints = totalHours * 2;
  const wastePoints = Math.floor(totalWasteKg / 5) * 3;

  const basePoints = cleanupPoints + volunteerPoints + wastePoints;
  const totalPoints = profile?.impactPoints ? Math.max(basePoints, profile.impactPoints) : basePoints;

  return {
    completedCount: verifiedCount,
    verifiedCount,
    totalHours,
    totalWasteKg,
    cleanupPoints,
    volunteerPoints,
    wastePoints,
    totalPoints
  };
}

/**
 * Level Thresholds:
 * New Guardian: 0–9
 * Water Guardian: 10–24
 * River Guardian: 25–49
 * Ocean Guardian: 50–99
 * AquaRise Champion: 100+
 */
export function getGuardianLevel(totalPoints = 0) {
  const points = Number(totalPoints) || 0;
  if (points >= 100) {
    return {
      levelName: 'AquaRise Champion',
      currentPoints: points,
      nextLevelPoints: 100,
      progressPercent: 100,
      nextLevelName: 'Max Level Reached',
      color: 'from-amber-400 to-amber-600',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    };
  } else if (points >= 50) {
    const progress = Math.min(100, Math.round(((points - 50) / (100 - 50)) * 100));
    return {
      levelName: 'Ocean Guardian',
      currentPoints: points,
      nextLevelPoints: 100,
      progressPercent: progress,
      nextLevelName: 'AquaRise Champion (100 pts)',
      color: 'from-[#35AEAC] to-[#076DDF]',
      badgeColor: 'bg-[#35AEAC]/20 text-[#19887F] border-[#35AEAC]/40'
    };
  } else if (points >= 25) {
    const progress = Math.min(100, Math.round(((points - 25) / (50 - 25)) * 100));
    return {
      levelName: 'River Guardian',
      currentPoints: points,
      nextLevelPoints: 50,
      progressPercent: progress,
      nextLevelName: 'Ocean Guardian (50 pts)',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40'
    };
  } else if (points >= 10) {
    const progress = Math.min(100, Math.round(((points - 10) / (25 - 10)) * 100));
    return {
      levelName: 'Water Guardian',
      currentPoints: points,
      nextLevelPoints: 25,
      progressPercent: progress,
      nextLevelName: 'River Guardian (25 pts)',
      color: 'from-[#076DDF] to-[#3C92FF]',
      badgeColor: 'bg-[#076DDF]/20 text-[#076DDF] border-[#076DDF]/40'
    };
  } else {
    const progress = Math.min(100, Math.round((points / 10) * 100));
    return {
      levelName: 'New Guardian',
      currentPoints: points,
      nextLevelPoints: 10,
      progressPercent: progress,
      nextLevelName: 'Water Guardian (10 pts)',
      color: 'from-slate-400 to-slate-600',
      badgeColor: 'bg-slate-200 text-slate-700 border-slate-300'
    };
  }
}

export function evaluateAchievements(participations = [], reports = [], missions = [], certificates = []) {
  const verifiedParticipations = participations.filter(
    (p) => p && (p.verificationStatus === 'verified' || p.status === 'Verified Complete')
  );

  return [
    {
      id: 'ach-01',
      title: 'First Field Clean',
      description: 'Complete your first verified waterbody cleanup mission.',
      icon: 'CheckCircle2',
      unlocked: verifiedParticipations.length >= 1
    },
    {
      id: 'ach-02',
      title: 'Pollution Reporter',
      description: 'Submit an endangered waterbody report to community Guardians.',
      icon: 'AlertTriangle',
      unlocked: reports.length >= 1
    },
    {
      id: 'ach-03',
      title: 'Mission Leader',
      description: 'Propose and organize a community cleanup mission.',
      icon: 'Flag',
      unlocked: missions.some((m) => m && m.isCommunityOrganized)
    },
    {
      id: 'ach-04',
      title: 'Certified Guardian',
      description: 'Earn an official AquaRise Certificate of Appreciation for verified cleanup work.',
      icon: 'Award',
      unlocked: certificates.length >= 1
    }
  ];
}
