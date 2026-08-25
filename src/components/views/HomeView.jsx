import React from 'react';
import Hero from '../sections/Hero';
import QuickActions from '../sections/QuickActions';
import HowItWorks from '../sections/HowItWorks';
import GuardiansSection from '../sections/GuardiansSection';

export default function HomeView({
  profile,
  onExploreCleanups,
  onBecomeGuardian,
  onReportPollution,
  onProposeCleanup,
}) {
  return (
    <div className="space-y-0">
      {/* 1. Hero */}
      <Hero
        onExploreCleanups={onExploreCleanups}
        onReportPollution={onReportPollution}
      />

      {/* 2. Quick Actions */}
      <QuickActions
        onExploreCleanups={onExploreCleanups}
        onReportPollution={onReportPollution}
        onOrganizeCleanup={() => onProposeCleanup(null)}
      />

      {/* 3. Compact How AquaRise Works */}
      <HowItWorks />

      {/* 4. Compact Guardian CTA */}
      <GuardiansSection
        profile={profile}
        onBecomeGuardian={onBecomeGuardian}
      />
    </div>
  );
}
