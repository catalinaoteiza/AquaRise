import React from 'react';

export default function Badge({ level, className = '' }) {
  const getBadgeStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/15 text-red-300 border-red-500/30 shadow-red-500/10';
      case 'high urgency':
      case 'high':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/10';
      case 'moderate':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10';
      case 'upcoming':
        return 'bg-aqua-500/15 text-aqua-300 border-aqua-500/30 shadow-aqua-500/10';
      default:
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm ${getBadgeStyle(level)} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {level}
    </span>
  );
}
