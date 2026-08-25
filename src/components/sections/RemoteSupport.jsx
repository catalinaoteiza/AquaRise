import React from 'react';
import { Package, ShieldCheck, Shield, HeartPulse, Coffee, Wrench, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function RemoteSupport({ supplies, onSponsorSupply }) {
  const getSupplyIcon = (iconName) => {
    switch (iconName) {
      case 'Package':
        return Package;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Shield':
        return Shield;
      case 'HeartPulse':
        return HeartPulse;
      case 'Coffee':
        return Coffee;
      case 'Wrench':
        return Wrench;
      default:
        return Package;
    }
  };

  return (
    <section className="py-20 bg-[#E6FCFA] relative border-t border-[#92F1EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider shadow-sm">
            <HeartHandshake className="w-4 h-4 text-[#35AEAC]" />
            <span>Remote Volunteer Empowerment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#071325]">
            Can’t Attend In Person? <br />
            <span className="text-[#19887F]">Support Cleanup Missions Remotely</span>
          </h2>

          <p className="text-[#334155] text-base sm:text-lg font-medium">
            Every cleanup requires essential field supplies. Remote AquaRise Guardians can equip on-the-ground volunteers with trash bags, gloves, masks, sanitizer, and hydration kits.
          </p>
        </div>

        {/* Supplies Sponsorship Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supplies.map((item) => {
            const Icon = getSupplyIcon(item.icon);
            return (
              <div
                key={item.id}
                className="card-light-surface p-6 rounded-3xl bg-white border border-[#92F1EC] shadow-sm flex flex-col justify-between group hover:border-[#35AEAC]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-[#F0FDFD] border border-[#92F1EC] text-[#19887F] group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E6FCFA] text-[#19887F] border border-[#92F1EC]">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#071325] mb-1 group-hover:text-[#076DDF] transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-[#475569] mb-3 font-normal">
                    {item.unitDescription}
                  </p>

                  {/* Impact Message Box */}
                  <div className="p-3 rounded-2xl bg-[#F0FDFD] border border-[#92F1EC] text-xs text-[#071325] flex items-start gap-2 mb-6 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#19887F] shrink-0 mt-0.5" />
                    <span>{item.impactMsg}</span>
                  </div>
                </div>

                {/* Pricing & Sponsor CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-[#92F1EC]">
                  <div>
                    <span className="text-xs text-[#475569] block font-medium">Est. Sponsorship</span>
                    <span className="text-xl font-black text-[#071325]">${item.unitCost}</span>
                    <span className="text-xs text-[#475569]"> / pack</span>
                  </div>

                  <button
                    onClick={() => onSponsorSupply(item)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#19887F] hover:bg-[#35AEAC] text-white font-extrabold text-xs shadow-sm transition-all duration-200"
                  >
                    <span>Simulate Sponsor</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Hackathon Simulation Note */}
        <div className="mt-12 p-4 rounded-2xl bg-white border border-[#92F1EC] text-center text-xs text-[#475569] max-w-xl mx-auto shadow-sm font-medium">
          💡 <strong>Hackathon Prototype Note:</strong> Clicking "Simulate Sponsor" records a simulated supply contribution to your local Guardian activity log and awards impact points.
        </div>

      </div>
    </section>
  );
}
