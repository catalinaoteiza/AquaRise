import React from 'react';
import { AlertOctagon, Fish, Skull, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export default function EnvironmentalAwareness() {
  const threats = [
    {
      title: 'Plastic Waste & Entanglement',
      desc: 'Over 14 million tons of plastic enter oceans and rivers annually. Marine animals mistake debris for food or suffer fatal entanglement.',
      icon: Fish,
      stat: '80% Ocean Plastic',
      statSub: 'Originates from polluted rivers',
    },
    {
      title: 'Toxic Runoff & Chemical Micro-Pollutants',
      desc: 'Agricultural runoff and industrial waste create toxic hypoxia dead zones, destroying freshwater fish populations and drinking supplies.',
      icon: Skull,
      stat: '500+ Dead Zones',
      statSub: 'Documented worldwide',
    },
    {
      title: 'Microplastic Bioaccumulation',
      desc: 'Degraded plastics break into invisible microparticles that enter food chains, threatening aquatic life, birds, and human health.',
      icon: ShieldAlert,
      stat: '5g Microplastics',
      statSub: 'Ingested weekly per human average',
    },
  ];

  return (
    <section className="py-20 bg-[#DAF6F6] relative border-t border-[#92F1EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider shadow-sm">
            <BookOpen className="w-4 h-4 text-[#35AEAC]" />
            <span>Environmental Education & Awareness</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#071325]">
            Why Protecting Our <span className="text-[#19887F]">Water Ecosystems</span> Matters
          </h2>

          <p className="text-[#334155] text-base sm:text-lg font-medium">
            Water pollution is an urgent crisis affecting coastal communities, drinking water security, fragile wildlife, and marine life across the globe.
          </p>
        </div>

        {/* Threat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {threats.map((threat, idx) => {
            const Icon = threat.icon;
            return (
              <div
                key={idx}
                className="card-light-surface p-8 rounded-3xl bg-white border border-[#92F1EC] shadow-sm flex flex-col justify-between hover:border-[#35AEAC]"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F0FDFD] flex items-center justify-center text-[#19887F] mb-6 border border-[#92F1EC]">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-black text-[#071325] mb-3">
                    {threat.title}
                  </h3>

                  <p className="text-[#475569] text-sm leading-relaxed mb-6 font-normal">
                    {threat.desc}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0FDFD] border border-[#92F1EC]">
                  <span className="text-xl font-black text-[#19887F] block">
                    {threat.stat}
                  </span>
                  <span className="text-xs text-[#475569] font-medium">
                    {threat.statSub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hope Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-white border border-[#92F1EC] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-xl font-black text-[#071325] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#19887F]" />
              Local Actions Drive Global Recovery
            </h4>
            <p className="text-sm text-[#475569] font-medium">
              When community Guardians remove debris before it breaks down, we directly preserve biodiversity and prevent ocean toxicity.
            </p>
          </div>
          <div className="shrink-0">
            <span className="px-4 py-2 rounded-full bg-[#E6FCFA] text-[#19887F] text-xs font-extrabold border border-[#92F1EC]">
              Awareness Hub Active
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
