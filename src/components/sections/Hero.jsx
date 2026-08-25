import React from 'react';
import { ArrowRight, Globe2, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Hero({ onExploreCleanups, onReportPollution }) {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-[#DAF6F6]">
      {/* Subtle Aquatic Gradient Accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#92F1EC]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Platform Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#92F1EC] text-[#19887F] text-xs sm:text-sm font-extrabold tracking-wide shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#19887F] animate-ping"></span>
            <Globe2 className="w-4 h-4 text-[#35AEAC]" />
            <span>Global Environmental Action Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#071325] leading-[1.1]">
            Cleaner Waters. <br />
            <span className="text-[#19887F]">Stronger Communities.</span>
          </h1>

          {/* Concise Supporting Explanation */}
          <p className="text-base sm:text-lg text-[#334155] max-w-2xl mx-auto font-medium leading-relaxed">
            AquaRise helps people discover cleanup opportunities, report polluted waterbodies, organize community action, and track verified environmental impact across global aquatic ecosystems.
          </p>

          {/* Primary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onExploreCleanups}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full btn-primary-ocean font-extrabold text-sm shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Explore Cleanups</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={onReportPollution}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-[#92F1EC] text-[#071325] font-extrabold text-sm border-2 border-[#19887F] shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-[#076DDF]" />
              <span>Report Pollution</span>
            </button>
          </div>

          {/* Action Highlights */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left border-t border-[#92F1EC]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#19887F] shrink-0" />
              <span>Discover Cleanups</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#076DDF] shrink-0" />
              <span>Report Pollution</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#19887F] shrink-0" />
              <span>Organize Action</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#071325]">
              <CheckCircle2 className="w-4 h-4 text-[#076DDF] shrink-0" />
              <span>Track Verified Impact</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
