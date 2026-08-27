import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const logoHeights = {
    sm: 'h-8',
    md: 'h-11 sm:h-13',
    lg: 'h-14 sm:h-16',
    xl: 'h-18 sm:h-22',
  };

  return (
    <div className={`inline-flex items-center justify-center shrink-0 group cursor-pointer ${className}`}>
      <img
        src="/aquarise-logo.png"
        alt="AquaRise"
        className={`${logoHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105 block`}
      />
    </div>
  );
}
