import React from 'react';
import { MapPin, ArrowRight, Compass, Flag, Search, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

export default function ExplorePreview({ waterbodies = [], onViewMission, onExploreAll, onProposeCleanup }) {
  return (
    <section className="py-20 bg-[#DAF6F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-white px-3.5 py-1 rounded-full border border-[#92F1EC] mb-3 inline-block shadow-sm">
              Waters Needing Attention
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ocean-950">
              Explore <span className="text-[#19887F]">Polluted Waterbodies</span>
            </h2>
            <p className="text-slate-700 text-base mt-2 font-medium">
              Discover endangered waters, understand their pollution burden, and organize a cleanup or search for external opportunities.
            </p>
          </div>

          <button
            onClick={() => onExploreAll()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#19887F] font-extrabold text-sm border-2 border-[#19887F] hover:bg-[#92F1EC] hover:text-ocean-950 transition-all shrink-0 self-start md:self-auto shadow-sm"
          >
            <span>Explore All Waterbodies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Waterbodies Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {waterbodies.slice(0, 3).map((wb) => {
            const hasVerifiedCleanup = Boolean(wb.cleanupEvent && !wb.cleanupEvent.isDemoEvent);

            return (
              <div
                key={wb.id}
                className="rounded-3xl overflow-hidden bg-white border border-[#92F1EC] shadow-md flex flex-col justify-between group hover:border-[#35AEAC] transition-all"
              >
                {/* Image & Location */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={wb.image}
                    alt={wb.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow ${
                      hasVerifiedCleanup
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#19887F] text-white'
                    }`}>
                      {hasVerifiedCleanup ? 'Cleanup Available' : 'No Verified Cleanup Listed'}
                    </span>
                  </div>

                  {/* Location Pill */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-ocean-950 border border-white shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-[#076DDF]" />
                    <span>{wb.location}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#19887F] tracking-wider block">
                      {wb.type}
                    </span>
                    <h3 className="text-xl font-black text-ocean-950 group-hover:text-[#076DDF] transition-colors line-clamp-1">
                      {wb.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {wb.description}
                    </p>
                  </div>

                  {/* Relationship Status & CTAs */}
                  <div className="space-y-3 pt-4 border-t border-[#92F1EC] text-xs">
                    
                    {/* Interactive Relationship Row */}
                    <button
                      onClick={() => {
                        if (hasVerifiedCleanup) {
                          onViewMission && onViewMission(wb.cleanupEvent);
                        } else {
                          onProposeCleanup && onProposeCleanup(wb);
                        }
                      }}
                      className="w-full p-3 rounded-2xl bg-teal-50/80 hover:bg-teal-100/80 border border-[#92F1EC] text-[11px] font-bold text-[#19887F] flex items-center justify-between transition-colors text-left"
                    >
                      <span>
                        {hasVerifiedCleanup
                          ? 'Cleanup available → View opportunity'
                          : 'No cleanup listed yet → Organize one'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#076DDF] shrink-0" />
                    </button>

                    {/* Dual Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onProposeCleanup && onProposeCleanup(wb)}
                        className="py-2.5 px-3 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Organize</span>
                      </button>

                      <button
                        onClick={() => onExploreAll && onExploreAll(wb.location || wb.name)}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs border border-teal-200 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Search className="w-3.5 h-3.5 text-[#19887F]" />
                        <span>Explore</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
