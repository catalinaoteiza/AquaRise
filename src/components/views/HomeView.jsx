import React from 'react';
import Hero from '../sections/Hero';
import HowItWorks from '../sections/HowItWorks';
import GuardiansSection from '../sections/GuardiansSection';
import ImpactPreview from '../sections/ImpactPreview';
import ExplorePreview from '../sections/ExplorePreview';
import RemoteSupport from '../sections/RemoteSupport';
import EnvironmentalAwareness from '../sections/EnvironmentalAwareness';

export default function HomeView({
  waterbodies,
  stats,
  impactStats,
  supplies,
  onExploreCleanups,
  onBecomeGuardian,
  onViewMission,
  onSponsorSupply,
  onReportPollution,
  onProposeCleanup,
}) {
  const effectiveStats = stats || impactStats || [];

  return (
    <div className="space-y-0">
      {/* 3. Hero Section */}
      <Hero
        onExploreCleanups={onExploreCleanups}
        onBecomeGuardian={onBecomeGuardian}
      />

      {/* 4. How AquaRise Works */}
      <HowItWorks onBecomeGuardian={onBecomeGuardian} />

      {/* 5. AquaRise Guardians */}
      <GuardiansSection onBecomeGuardian={onBecomeGuardian} />

      {/* 6. Impact Preview */}
      <ImpactPreview stats={effectiveStats} />

      {/* 7. Explore Preview */}
      <ExplorePreview
        waterbodies={waterbodies}
        onViewMission={onViewMission}
        onExploreAll={onExploreCleanups}
        onProposeCleanup={onProposeCleanup}
      />

      {/* 8. Remote Support */}
      <RemoteSupport
        supplies={supplies}
        onSponsorSupply={onSponsorSupply}
      />

      {/* 9. Environmental Awareness */}
      <EnvironmentalAwareness />
    </div>
  );
}
