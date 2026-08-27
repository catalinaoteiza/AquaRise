import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const logoHeights = {
    sm: 'h-9 sm:h-11',
    md: 'h-13 sm:h-16',
    lg: 'h-16 sm:h-20',
    xl: 'h-20 sm:h-24',
  };

  return (
    <div className={`inline-flex items-center justify-center shrink-0 group cursor-pointer ${className}`}>
      <img
        src="/aquarise-logo.png"
        alt="AquaRise"
        className={`${logoHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105 block drop-shadow-sm`}
      />
    </div>
  );
}
