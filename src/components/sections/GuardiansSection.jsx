import React from 'react';
import { Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function GuardiansSection({ onBecomeGuardian, profile }) {
  const isGuardian = Boolean(profile?.isGuardian);

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-[#0A4743] via-[#062E2C] to-[#031C1B] text-white relative overflow-hidden border-t border-teal-500/20">
      {/* Abyssal Glow Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Major Editorial Guardian CTA Card */}
        <div className="rounded-[2.5rem] bg-gradient-to-r from-[#0F766E]/50 via-[#0D9488]/30 to-[#0284C7]/20 border border-teal-400/30 p-8 sm:p-14 lg:p-16 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Subtle Graphic Water Glow Ring */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Left Text Column */}
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-teal-300/30 text-teal-200 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Shield className="w-4 h-4 text-teal-300" />
              <span>AquaRise Guardian Network</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight tracking-tight">
              {isGuardian ? (
                <>Your AquaRise <span className="text-[#5EEAD4] italic">Guardian Impact</span></>
              ) : (
                <>Become an <span className="text-[#5EEAD4] italic">AquaRise Guardian</span></>
              )}
            </h2>

            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-medium">
              Lead cleanup missions, report unmonitored waterbody pollution, build a verified environmental impact profile, and receive recognized digital certificates for your stewardship.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-teal-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" /> Verified Certificates
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" /> Mission Organizing
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" /> Community Recognition
              </span>
            </div>
          </div>

          {/* Right Action CTA Button */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBecomeGuardian}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4.5 rounded-full bg-[#5EEAD4] hover:bg-teal-200 text-[#031C1B] font-extrabold text-sm sm:text-base shadow-xl hover:shadow-teal-400/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Shield className="w-5 h-5 text-[#031C1B]" />
              <span>{isGuardian ? 'View Guardian Profile' : 'Become a Guardian'}</span>
              <ArrowRight className="w-5 h-5 text-[#031C1B]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
