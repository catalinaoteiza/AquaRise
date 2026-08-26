import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const logoHeights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  return (
    <div className={`inline-flex items-center group cursor-pointer ${className}`}>
      <img
        src="/aquarise-logo.png"
        alt="AquaRise"
        className={`${logoHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105`}
      />
    </div>
  );
}
