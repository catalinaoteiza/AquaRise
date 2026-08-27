import React from 'react';
import { Fish, Skull, ShieldAlert, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export default function EnvironmentalAwareness({ onReportPollution }) {
  const threats = [
    {
      title: 'Plastic Waste & River Flow',
      desc: 'Over 14 million tons of plastic enter water ecosystems annually. Inland rivers act as major conduits, carrying debris straight to coasts.',
      icon: Fish,
      stat: '80% Ocean Debris',
      statSub: 'Originates from polluted rivers',
    },
    {
      title: 'Hypoxia & Toxic Runoff',
      desc: 'Agricultural runoff and unmonitored waste create suffocating low-oxygen dead zones, devastating fish habitats and local water supplies.',
      icon: Skull,
      stat: '500+ Dead Zones',
      statSub: 'Documented globally',
    },
    {
      title: 'Microplastic Bioaccumulation',
      desc: 'Degraded plastic breaks down into toxic microscopic fragments, endangering aquatic life and entering coastal food webs.',
      icon: ShieldAlert,
      stat: '5g Microplastics',
      statSub: 'Ingested weekly per human average',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-[#9DE2DC] via-[#14B8A6]/25 to-[#0F766E]/40 text-[#042F2E] relative border-t border-teal-300/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial 2-Column Storytelling Showcase (Using Attached Image 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-20">
          
          {/* Left Column: Attached Image 2 Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/80 shadow-2xl bg-[#042F2E] group">
              <img
                src="/pollution-community-assessment.jpg"
                alt="AquaRise community Guardians assessing riverbank pollution and debris"
                className="w-full h-[360px] sm:h-[440px] object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#042F2E]/85 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-xs font-semibold text-teal-200 uppercase tracking-widest bg-white/20 px-3 py-0.5 rounded-full backdrop-blur">
                  Field Assessment
                </span>
                <p className="font-display text-lg sm:text-xl text-white font-normal">
                  Community Guardians evaluating unmonitored riverbank waste site
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Narrative Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-teal-200 text-[#0F766E] text-xs font-semibold uppercase tracking-wider shadow-sm backdrop-blur">
              <BookOpen className="w-4 h-4 text-[#0D9488]" />
              <span>From Pollution to Community Action</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl text-[#042F2E] font-normal leading-tight tracking-tight">
              Why Our Waters <br />
              <span className="text-[#0D9488] italic font-normal">Need Urgent Action</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed">
              Unmonitored plastic pollution silently degrades rivers, wetlands, and shorelines. When local Guardians identify, document, and clean these sites, we stop toxic breakdown at the source.
            </p>

            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/90 shadow-md space-y-3">
              <h4 className="font-bold text-[#042F2E] text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0D9488]" />
                <span>Local Action Drives Global Recovery</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                Every verified cleanup logged on AquaRise creates a permanent record of environmental stewardship and protects aquatic biodiversity for future generations.
              </p>
            </div>

            {onReportPollution && (
              <button
                type="button"
                onClick={onReportPollution}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#042F2E] hover:bg-[#0D9488] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Report a Polluted Site</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Threat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {threats.map((threat, idx) => {
            const Icon = threat.icon;
            return (
              <div
                key={idx}
                className="bg-white/85 backdrop-blur-md rounded-3xl p-7 border border-white/80 shadow-md flex flex-col justify-between space-y-6 hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0D9488] border border-teal-200">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-[#042F2E] tracking-tight">
                    {threat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {threat.desc}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80">
                  <span className="text-xl font-black text-[#0D9488] block">
                    {threat.stat}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {threat.statSub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
