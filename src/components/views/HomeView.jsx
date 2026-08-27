import React from 'react';
import Hero from '../sections/Hero';
import QuickActions from '../sections/QuickActions';
import EnvironmentalAwareness from '../sections/EnvironmentalAwareness';
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
      {/* 1. Hero Section (Daylight Aqua Mist / Attached Image 1 Showcase) */}
      <Hero
        onExploreCleanups={onExploreCleanups}
        onReportPollution={onReportPollution}
      />

      {/* 2. Quick Actions (Shallow Reef Soft Teal) */}
      <QuickActions
        onExploreCleanups={onExploreCleanups}
        onReportPollution={onReportPollution}
        onOrganizeCleanup={() => onProposeCleanup(null)}
      />

      {/* 3. Environmental Awareness & Storytelling (Mid-Depth Teal / Attached Image 2 Showcase) */}
      <EnvironmentalAwareness
        onReportPollution={onReportPollution}
      />

      {/* 4. How AquaRise Works (Mid-Ocean Teal Depth) */}
      <HowItWorks />

      {/* 5. Guardian CTA (Abyssal Deep Blue) */}
      <GuardiansSection
        profile={profile}
        onBecomeGuardian={onBecomeGuardian}
      />
    </div>
  );
}
