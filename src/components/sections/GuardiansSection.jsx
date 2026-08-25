import React from 'react';
import { Shield, Sparkles, MapPin, Heart, AlertCircle, Users } from 'lucide-react';

export default function GuardiansSection({ onBecomeGuardian }) {
  const roles = [
    {
      title: 'In-Person Cleaners',
      desc: 'Join local missions to extract plastics, tires, and debris directly from shorelines and waters.',
      icon: MapPin,
      color: 'text-[#076DDF]',
      bgIcon: 'bg-[#EFF6FF]',
    },
    {
      title: 'Remote Supporters',
      desc: 'Sponsor vital supplies like trash bags, gloves, masks, and snacks for volunteers on the frontlines.',
      icon: Heart,
      color: 'text-[#19887F]',
      bgIcon: 'bg-[#E6FCFA]',
    },
    {
      title: 'Pollution Reporters',
      desc: 'Document endangered waterbodies with geotagged photos to rally community intervention.',
      icon: AlertCircle,
      color: 'text-[#35AEAC]',
      bgIcon: 'bg-[#F0FDFD]',
    },
    {
      title: 'Community Organizers',
      desc: 'Lead local AquaRise chapters, coordinate logistics, and inspire regional volunteer turnouts.',
      icon: Users,
      color: 'text-[#3C92FF]',
      bgIcon: 'bg-[#EFF6FF]',
    },
  ];

  return (
    <section className="py-20 bg-[#DAF6F6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Narrative Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#35AEAC]" />
              <span>Community Identity</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#071325] leading-tight">
              Who are <br />
              <span className="text-[#19887F]">AquaRise Guardians?</span>
            </h2>

            <p className="text-[#334155] text-base sm:text-lg leading-relaxed font-medium">
              <strong className="text-[#071325]">AquaRise Guardians</strong> are everyday people—students, families, divers, hikers, and local citizens—united by a single mission: restoring and protecting our planet’s vital waterbodies.
            </p>

            <p className="text-[#475569] text-sm sm:text-base leading-relaxed font-normal">
              Whether you roll up your sleeves at a river cleanup, report polluted sites in your town, organize events, or remotely contribute trash bags and gloves from thousands of miles away, <strong className="text-[#19887F]">you are a Guardian</strong>.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={onBecomeGuardian}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full btn-primary-ocean font-extrabold text-base shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Shield className="w-5 h-5 text-white" />
                <span>Become an AquaRise Guardian</span>
              </button>
            </div>
          </div>

          {/* Right Role Cards Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role, idx) => {
              const Icon = role.icon;
              return (
                <div
                  key={idx}
                  className="card-light-surface p-6 rounded-3xl bg-white border border-[#92F1EC] space-y-3 shadow-sm hover:border-[#35AEAC]"
                >
                  <div className={`p-3 rounded-2xl ${role.bgIcon} border border-[#92F1EC] inline-block ${role.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#071325]">{role.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-normal">{role.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
