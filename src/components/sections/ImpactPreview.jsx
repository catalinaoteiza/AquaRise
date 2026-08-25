import React from 'react';
import { Waves, Flag, Users, Clock, Trash2, Info } from 'lucide-react';

export default function ImpactPreview({ stats = [] }) {
  const safeStats = Array.isArray(stats) ? stats : [];

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Waves':
        return Waves;
      case 'Flag':
        return Flag;
      case 'Users':
        return Users;
      case 'Clock':
        return Clock;
      case 'Trash2':
        return Trash2;
      default:
        return Waves;
    }
  };

  return (
    <section className="py-20 bg-[#E6FCFA] relative border-y border-[#92F1EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
              <Info className="w-3.5 h-3.5 text-[#35AEAC]" />
              <span>Platform Impact Preview • Demo Values</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#071325]">
              Global Environmental <span className="text-[#19887F]">Impact</span>
            </h2>
          </div>
          <p className="text-[#334155] text-xs sm:text-sm max-w-md font-medium">
            * These statistics demonstrate the metrics AquaRise automatically aggregates as Guardians participate in real cleanup missions worldwide.
          </p>
        </div>

        {/* 5 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {safeStats.map((stat) => {
            const Icon = getIcon(stat.iconName);
            return (
              <div
                key={stat.id}
                className="card-light-surface p-6 rounded-3xl bg-white border border-[#92F1EC] shadow-sm flex flex-col justify-between group hover:border-[#35AEAC]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-[#F0FDFD] border border-[#92F1EC] text-[#076DDF] group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-[#19887F] bg-[#E6FCFA] px-2.5 py-0.5 rounded-full border border-[#92F1EC]">
                      {stat.change}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black text-[#071325] tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-base font-extrabold text-[#076DDF]">
                      {stat.unit}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#071325]">
                    {stat.label}
                  </h3>
                </div>

                <p className="text-xs text-[#475569] mt-4 pt-3 border-t border-[#92F1EC] font-normal">
                  {stat.subtext}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
