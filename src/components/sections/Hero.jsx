import React from 'react';
import { ArrowRight, Shield, Globe2, Compass, Waves, CheckCircle2 } from 'lucide-react';

export default function Hero({ onExploreCleanups, onBecomeGuardian }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#DAF6F6]">
      {/* Subtle Aquatic Gradient Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#92F1EC]/30 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          
          {/* Action Platform Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#92F1EC] text-[#19887F] text-xs sm:text-sm font-bold tracking-wide shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#19887F] animate-ping"></span>
            <Globe2 className="w-4 h-4 text-[#35AEAC]" />
            <span>Global Environmental Action Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#071325] leading-[1.1]">
            Cleaner Waters. <br />
            <span className="text-[#19887F]">Stronger Communities.</span>
          </h1>

          {/* Supporting Narrative */}
          <p className="text-lg sm:text-xl text-[#334155] max-w-3xl mx-auto font-medium leading-relaxed">
            AquaRise connects passionate people around the world to discover polluted waterbodies, join local cleanup efforts, organize community action, and safeguard our rivers, lakes, beaches, and aquatic ecosystems for future generations.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExploreCleanups}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full btn-primary-ocean font-extrabold text-base shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Compass className="w-5 h-5 text-white" />
              <span>Explore Cleanups</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={onBecomeGuardian}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white hover:bg-[#92F1EC] text-[#19887F] hover:text-[#071325] font-extrabold text-base border-2 border-[#19887F] hover:border-[#92F1EC] shadow-sm hover:scale-[1.02] transition-all duration-200"
            >
              <Shield className="w-5 h-5 text-[#076DDF]" />
              <span>Become a Guardian</span>
            </button>
          </div>

          {/* Action Trust Indicators */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left border-t border-[#92F1EC]">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#19887F] shrink-0" />
              <span>Global Community Driven</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#076DDF] shrink-0" />
              <span>In-Person & Remote Support</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#19887F] shrink-0" />
              <span>Impact Tracking & Points</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#076DDF] shrink-0" />
              <span>Certificates of Appreciation</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
