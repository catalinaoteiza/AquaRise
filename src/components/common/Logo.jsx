import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const logoHeights = {
    sm: 'h-10 sm:h-12',
    md: 'h-[50px] sm:h-[58px]',
    lg: 'h-[58px] sm:h-[64px]',
    xl: 'h-[64px] sm:h-[72px]',
  };

  return (
    <div className={`inline-flex items-center justify-center shrink-0 group cursor-pointer ${className}`}>
      <img
        src="/aquarise-logo.png"
        alt="AquaRise"
        className={`${logoHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] block`}
      />
    </div>
  );
}
