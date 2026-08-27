import React from 'react';
import { ArrowRight, Globe2, Compass, AlertTriangle, CheckCircle2, Shield, Eye, FileText, Users, Award } from 'lucide-react';

export default function Hero({ onExploreCleanups, onReportPollution }) {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#F0FDFD] via-[#E2F7F5] to-[#CBEFEF] text-[#071325]">
      {/* Soft Ambient Aquatic Light Flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#38BDF8]/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header Stack */}
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Editorial Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-teal-200/80 text-[#0F766E] text-xs sm:text-sm font-semibold tracking-wide shadow-sm backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-[#0D9488] animate-ping"></span>
            <Globe2 className="w-4 h-4 text-[#0D9488]" />
            <span>Global Environmental Action Platform</span>
          </div>

          {/* Big Editorial Display Headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#042F2E] leading-[1.08] tracking-tight font-normal">
            Cleaner Waters. <br />
            <span className="text-[#0D9488] italic font-normal">Stronger Communities.</span>
          </h1>

          {/* Concise Supporting Narrative */}
          <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
            AquaRise helps people discover cleanup opportunities, report polluted waterbodies, organize community action, and track verified environmental impact across global aquatic ecosystems.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onExploreCleanups}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-xl hover:shadow-teal-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-teal-100" />
              <span>Explore Cleanups</span>
              <ArrowRight className="w-4 h-4 text-teal-100" />
            </button>

            <button
              type="button"
              onClick={onReportPollution}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white hover:bg-teal-50 text-[#042F2E] font-bold text-sm border border-teal-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-[#0284C7]" />
              <span>Report Pollution</span>
            </button>
          </div>

          {/* Feature Micro-Cards Under Hero */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/85 backdrop-blur border border-teal-200/80 shadow-sm hover:shadow transition-all group">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4 text-[#0D9488]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#042F2E] leading-tight">Discover Cleanups</span>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/85 backdrop-blur border border-teal-200/80 shadow-sm hover:shadow transition-all group">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4 text-[#0284C7]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#042F2E] leading-tight">Report Pollution</span>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/85 backdrop-blur border border-teal-200/80 shadow-sm hover:shadow transition-all group">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4 text-[#059669]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#042F2E] leading-tight">Organize Action</span>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/85 backdrop-blur border border-teal-200/80 shadow-sm hover:shadow transition-all group">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4 text-[#D97706]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#042F2E] leading-tight">Track Verified Impact</span>
            </div>
          </div>

        </div>

        {/* Hero Editorial Showcase Image (Full Coverage, No Black Side Gaps) */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-teal-200/80 shadow-2xl group w-full">
            <img
              src="/pollution-riverbank-action.jpg"
              alt="Community Guardian recovering plastic debris from polluted riverbank"
              className="w-full h-[340px] sm:h-[440px] md:h-[500px] object-cover object-center transform transition-transform duration-700 group-hover:scale-105 block"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#042F2E]/90 via-[#042F2E]/30 to-transparent"></div>

            {/* Caption & Floating Badge */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-white">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur border border-white/30 text-xs font-semibold text-teal-100">
                  <Shield className="w-3.5 h-3.5 text-teal-300" />
                  <span>Real Environmental Action</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl text-white font-normal">
                  Restoring Rivers, Coasts & Communities
                </h3>
                <p className="text-xs sm:text-sm text-teal-100/90 font-sans leading-relaxed">
                  Every cleanup mission logged on AquaRise prevents plastic breakdown and protects aquatic biodiversity.
                </p>
              </div>

              <button
                type="button"
                onClick={onExploreCleanups}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#042F2E] font-bold text-xs shadow-md hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <span>Find Local Missions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
