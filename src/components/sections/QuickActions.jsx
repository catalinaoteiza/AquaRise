import React from 'react';
import { Compass, AlertTriangle, PlusCircle, ArrowRight } from 'lucide-react';

export default function QuickActions({ onExploreCleanups, onReportPollution, onOrganizeCleanup }) {
  const actions = [
    {
      title: 'Find a Cleanup',
      description: 'Discover verified cleanup opportunities near you or search global community missions.',
      buttonText: 'Find Cleanups',
      icon: Compass,
      iconBg: 'bg-teal-50 text-[#0D9488]',
      onClick: onExploreCleanups
    },
    {
      title: 'Report Pollution',
      description: 'Document a polluted river, lake, beach, or pond that urgently needs community intervention.',
      buttonText: 'Report a Site',
      icon: AlertTriangle,
      iconBg: 'bg-sky-50 text-[#0284C7]',
      onClick: onReportPollution
    },
    {
      title: 'Organize a Cleanup',
      description: 'Create an official AquaRise community mission where action is missing.',
      buttonText: 'Create Mission',
      icon: PlusCircle,
      iconBg: 'bg-emerald-50 text-[#059669]',
      onClick: onOrganizeCleanup
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#CBEFEF] via-[#B8ECE8] to-[#9DE2DC] text-[#071325] border-t border-teal-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest text-[#0F766E] uppercase bg-white/90 px-3.5 py-1 rounded-full border border-teal-200 inline-block shadow-sm backdrop-blur">
            Platform Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-[#042F2E] font-normal tracking-tight">
            Action for Every <span className="text-[#0D9488] italic">Waterbody</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-medium">
            Whether participating, reporting, or organizing, every step builds verified environmental recovery.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-7 sm:p-8 border border-white/80 shadow-lg shadow-teal-900/5 hover:-translate-y-1 hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${act.iconBg} border border-teal-100 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#042F2E] tracking-tight">{act.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {act.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={act.onClick}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-teal-50 hover:bg-[#0D9488] text-[#0F766E] hover:text-white font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border border-teal-200/80 shadow-sm"
                >
                  <span>{act.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
