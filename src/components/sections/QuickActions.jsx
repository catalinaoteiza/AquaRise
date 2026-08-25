import React from 'react';
import { Compass, AlertTriangle, PlusCircle, ArrowRight } from 'lucide-react';

export default function QuickActions({ onExploreCleanups, onReportPollution, onOrganizeCleanup }) {
  const actions = [
    {
      title: 'Find a Cleanup',
      description: 'Discover cleanup opportunities near you or around the world.',
      buttonText: 'Find Cleanups',
      icon: Compass,
      iconBg: 'bg-blue-50 text-[#076DDF]',
      onClick: onExploreCleanups
    },
    {
      title: 'Report Pollution',
      description: 'Document a polluted river, lake, beach, pond, or other waterbody that needs attention.',
      buttonText: 'Report a Site',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-[#19887F]',
      onClick: onReportPollution
    },
    {
      title: 'Organize a Cleanup',
      description: 'If no cleanup exists, create an AquaRise community mission.',
      buttonText: 'Create Mission',
      icon: PlusCircle,
      iconBg: 'bg-teal-50 text-[#35AEAC]',
      onClick: onOrganizeCleanup
    }
  ];

  return (
    <section className="py-10 bg-[#DAF6F6] border-t border-[#92F1EC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-[#92F1EC] shadow-sm hover:shadow-md hover:border-[#35AEAC] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${act.iconBg} border border-teal-100 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#071325]">{act.title}</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
                    {act.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={act.onClick}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-teal-50 hover:bg-[#19887F] text-[#19887F] hover:text-white font-extrabold text-xs transition-colors cursor-pointer border border-[#92F1EC]"
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
