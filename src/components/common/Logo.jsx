import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-xl bg-gradient-to-tr from-ocean-600 via-aqua-500 to-emerald shadow-lg shadow-aqua-500/20 group-hover:shadow-aqua-500/40 transition-all duration-300 group-hover:scale-105`}>
        {/* Water Droplet + Rising Wave SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/5 h-3/5 text-ocean-950 stroke-current stroke-[2.5]"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          <path d="M7 16.5c1.5 1 3.5 1 5 0s3.5-1 5 0" />
        </svg>
        {/* Subtle cyan glow dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-aqua-300 animate-ping opacity-75"></span>
      </div>
      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight ${textSizes[size]} text-white flex items-center gap-0.5`}>
          Aqua<span className="aqua-gradient-text">Rise</span>
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] font-semibold tracking-widest text-aqua-400/80 uppercase -mt-1">
            Guardian Network
          </span>
        )}
      </div>
    </div>
  );
}
