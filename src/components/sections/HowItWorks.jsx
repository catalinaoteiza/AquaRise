import React from 'react';
import { Search, Users, Zap, Award, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Discover',
      sentence: 'Find polluted waterbodies and legitimate cleanup opportunities in your area or around the globe.',
      icon: Search,
      glow: 'from-cyan-500/20 to-teal-500/20',
      badgeColor: 'text-cyan-300'
    },
    {
      title: 'Join or Organize',
      sentence: 'Participate in existing community cleanups or create a new AquaRise mission where action is needed.',
      icon: Users,
      glow: 'from-teal-500/20 to-emerald-500/20',
      badgeColor: 'text-teal-300'
    },
    {
      title: 'Take Action',
      sentence: 'Gather with fellow Guardians, collect waste, log evidence, and report environmental findings.',
      icon: Zap,
      glow: 'from-emerald-500/20 to-sky-500/20',
      badgeColor: 'text-emerald-300'
    },
    {
      title: 'Track Impact',
      sentence: 'Receive verified completion recognition, digital certificates, and log lifetime Guardian contributions.',
      icon: Award,
      glow: 'from-sky-500/20 to-blue-500/20',
      badgeColor: 'text-sky-300'
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-[#0F766E] via-[#0D5C56] to-[#0A4743] text-white relative border-t border-teal-500/30 overflow-hidden">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16 sm:mb-20">
          <span className="text-xs font-semibold tracking-widest text-teal-200 uppercase bg-white/10 px-3.5 py-1 rounded-full border border-teal-300/30 inline-block backdrop-blur">
            Simple 4-Step Process
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-white font-normal tracking-tight">
            From Pollution to <span className="text-[#5EEAD4] italic font-normal">Verified Action</span>
          </h2>
          <p className="text-sm sm:text-base text-teal-100/90 font-medium">
            Designed for seamless community engagement, transparent reporting, and accountable environmental stewardship.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/15 shadow-xl hover:border-teal-300/40 hover:bg-white/15 transition-all duration-300 flex flex-col justify-between space-y-6 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-white shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-teal-200" />
                  </div>
                  <span className={`text-sm font-black font-mono ${step.badgeColor} tracking-wider`}>
                    0{idx + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                    {step.sentence}
                  </p>
                </div>

                {/* Arrow Connector for Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-teal-300/40">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
