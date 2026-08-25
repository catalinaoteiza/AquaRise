import React from 'react';
import { Search, Users, Zap, Award, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Discover',
      sentence: 'Find polluted waters and legitimate cleanup opportunities.',
      icon: Search,
      color: 'text-[#076DDF]',
      bg: 'bg-blue-50'
    },
    {
      title: 'Join or Organize',
      sentence: 'Join an existing effort or create a community cleanup where none exists.',
      icon: Users,
      color: 'text-[#19887F]',
      bg: 'bg-teal-50'
    },
    {
      title: 'Take Action',
      sentence: 'Participate in cleanup work, pollution reporting, or community support.',
      icon: Zap,
      color: 'text-[#35AEAC]',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Track Impact',
      sentence: 'Build a verified record of contributions and environmental impact.',
      icon: Award,
      color: 'text-[#3C92FF]',
      bg: 'bg-sky-50'
    }
  ];

  return (
    <section className="py-12 bg-[#E6FCFA] border-y border-[#92F1EC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <span className="text-[11px] font-black tracking-widest text-[#19887F] uppercase bg-white px-3 py-1 rounded-full border border-[#92F1EC] inline-block shadow-sm">
            Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#071325]">
            How <span className="text-[#19887F]">AquaRise Works</span>
          </h2>
        </div>

        {/* Compact Horizontal Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#92F1EC] shadow-sm flex flex-col justify-between space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${step.bg} border border-teal-100 flex items-center justify-center font-bold ${step.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-300 group-hover:text-[#19887F] transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#071325]">{step.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-normal">
                    {step.sentence}
                  </p>
                </div>

                {/* Arrow connector for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#35AEAC]/50">
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
