import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const logoHeights = {
    sm: 'h-8',
    md: 'h-10 sm:h-12',
    lg: 'h-13 sm:h-15',
    xl: 'h-16 sm:h-20',
  };

  return (
    <div className={`inline-flex items-center group cursor-pointer ${className}`}>
      <img
        src="/aquarise-logo.png"
        alt="AquaRise"
        className={`${logoHeights[size]} w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105`}
      />
    </div>
  );
}
