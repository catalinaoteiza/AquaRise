import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';

export default function GuardiansSection({ onBecomeGuardian, profile }) {
  const isGuardian = Boolean(profile?.isGuardian);

  return (
    <section className="py-12 bg-[#DAF6F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#92F1EC] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Text */}
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-[#076DDF]" />
              <span>AquaRise Guardians</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#071325]">
              {isGuardian ? 'Your AquaRise Guardian Network' : 'Become an AquaRise Guardian'}
            </h3>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-medium">
              Join cleanup missions, organize community action, report pollution, and build a verified environmental impact record.
            </p>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={onBecomeGuardian}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full btn-primary-ocean font-extrabold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-white" />
              <span>{isGuardian ? 'View Guardian Profile' : 'Become a Guardian'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
