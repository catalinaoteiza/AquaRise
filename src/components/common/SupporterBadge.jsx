import React from 'react';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * Reusable AquaRise Supporter Badge.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.showLabel=true]
 * @param {string} [props.className='']
 */
export default function SupporterBadge({ size = 'md', showLabel = true, className = '' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full bg-gradient-to-r from-amber-400/20 via-teal-400/20 to-sky-400/20 text-amber-300 border border-amber-300/40 shadow-sm backdrop-blur-sm ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      title="AquaRise Supporter"
    >
      <span className="relative flex items-center justify-center">
        <Sparkles className={`${iconSizes[size] || iconSizes.md} text-amber-300 animate-pulse`} />
      </span>
      {showLabel && (
        <span className="tracking-wide bg-gradient-to-r from-amber-200 to-teal-100 bg-clip-text text-transparent font-black">
          AquaRise Supporter
        </span>
      )}
    </span>
  );
}
