import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const logoHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-[44px] sm:h-[48px]',
    lg: 'h-14 sm:h-16',
    xl: 'h-18 sm:h-20',
  };

  return (
    <div className={`inline-flex items-center justify-center shrink-0 group cursor-pointer ${className}`}>
      <img
        src="/aquarise-logo.png"
        alt="AquaRise Symbol"
        className={`${logoHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105 block`}
      />
    </div>
  );
}
