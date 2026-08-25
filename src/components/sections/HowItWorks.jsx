import React from 'react';
import { Search, Zap, HeartHandshake, Award, ArrowRight } from 'lucide-react';

export default function HowItWorks({ onBecomeGuardian }) {
  const steps = [
    {
      num: '01',
      title: 'Discover',
      description: 'Find polluted rivers, lakes, beaches, ponds, and other waterbodies that need urgent community attention around the globe.',
      icon: Search,
      iconColor: 'text-[#076DDF]',
      bgIcon: 'bg-[#EFF6FF]',
    },
    {
      num: '02',
      title: 'Take Action',
      description: 'Join an existing cleanup event or collaborate with AquaRise to organize a brand-new cleanup mission in your local community.',
      icon: Zap,
      iconColor: 'text-[#19887F]',
      bgIcon: 'bg-[#E6FCFA]',
    },
    {
      num: '03',
      title: 'Make an Impact',
      description: 'Clean the waterbody, volunteer your time, safely remove waste, or support Guardians remotely with vital supplies like gloves & trash bags.',
      icon: HeartHandshake,
      iconColor: 'text-[#35AEAC]',
      bgIcon: 'bg-[#F0FDFD]',
    },
    {
      num: '04',
      title: 'Grow Your Impact',
      description: 'Build your AquaRise Guardian profile, earn impact points, track waste collected, and receive Certificates of Appreciation for completed work.',
      icon: Award,
      iconColor: 'text-[#3C92FF]',
      bgIcon: 'bg-[#EFF6FF]',
    },
  ];

  return (
    <section className="py-20 bg-[#E6FCFA] relative border-y border-[#92F1EC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-white px-3.5 py-1 rounded-full border border-[#92F1EC] shadow-sm inline-block">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#071325]">
            How <span className="text-[#19887F]">AquaRise Works</span>
          </h2>
          <p className="text-[#334155] text-base sm:text-lg font-medium">
            Empowering individuals from reporting pollution to celebrating tangible environmental restoration.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="card-light-surface p-8 rounded-3xl relative flex flex-col justify-between bg-white border border-[#92F1EC] shadow-sm group"
              >
                {/* Step Header */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${step.bgIcon} border border-[#92F1EC] flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${step.iconColor}`} />
                    </div>
                    <span className="text-3xl font-black text-[#92F1EC] group-hover:text-[#19887F] transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#071325] mb-3 group-hover:text-[#076DDF] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-[#475569] text-sm leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Subtle Step Arrow Indicator */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#35AEAC]">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA banner under steps */}
        <div className="mt-12 text-center">
          <button
            onClick={onBecomeGuardian}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full btn-primary-ocean text-sm font-extrabold shadow-md hover:scale-105 transition-all"
          >
            <span>Start Taking Action Today</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </section>
  );
}
