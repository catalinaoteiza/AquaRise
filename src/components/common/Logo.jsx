import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const iconHeights = {
    sm: 'h-8',
    md: 'h-[40px] sm:h-[44px]',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-18',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px] sm:text-[12px]',
    lg: 'text-[13px] sm:text-[14px]',
    xl: 'text-[15px] sm:text-[16px]',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-0.5 shrink-0 group cursor-pointer ${className}`}>
      {/* Large Icon Symbol (40-44px tall) */}
      <img
        src="/aquarise-icon.png"
        alt="AquaRise Symbol"
        className={`${iconHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105 block`}
      />

      {/* Separate HTML Text in Light Blue */}
      <span className={`font-extrabold tracking-tight ${textSizes[size]} text-[#38BDF8] text-center leading-none select-none`}>
        AquaRise
      </span>
    </div>
  );
}
