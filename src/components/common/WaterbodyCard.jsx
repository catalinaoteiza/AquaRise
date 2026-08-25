import React from 'react';
import { MapPin, Calendar, Users, ShieldCheck, ArrowRight, ExternalLink, Link2, Clock, Info } from 'lucide-react';
import Badge from './Badge';
import { isSpecificSourceName, isValidExternalUrl } from '../../services/sourceVerificationLayer';

export default function WaterbodyCard({ waterbody, onViewDetails }) {
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'AquaRise Mission':
        return 'bg-emerald/15 text-emerald border-emerald/30';
      case 'External Organization Event':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'No Cleanup Yet':
      default:
        return 'bg-slate-800/80 text-slate-400 border-slate-700';
    }
  };

  const isDemo = waterbody.isDemoEvent || waterbody.cleanupEvent?.isDemoEvent || waterbody.contentType === 'Demo';

  const getContentTypeTag = () => {
    if (isDemo) {
      return <span className="bg-slate-800 text-slate-400 border-slate-700 border px-2 py-0.5 rounded-full text-[10px] font-bold">Demo Data</span>;
    }

    const type = waterbody.contentType || (waterbody.isCommunityReport ? 'Community Report' : 'Live / Sourced');
    switch (type) {
      case 'Live / Sourced':
        return <span className="bg-aqua-500/15 text-aqua-300 border-aqua-500/30 border px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Live / Sourced</span>;
      case 'External Organization':
        return <span className="bg-sky-500/15 text-sky-300 border-sky-500/30 border px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">External Org</span>;
      case 'AquaRise Mission':
        return <span className="bg-emerald/15 text-emerald border-emerald/30 border px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">AquaRise Mission</span>;
      case 'Community Report':
        return <span className="bg-amber-500/15 text-amber-300 border-amber-500/30 border px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Community Report</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 border-slate-700 border px-2 py-0.5 rounded-full text-[10px] font-bold">Demo Data</span>;
    }
  };

  const getVerificationTag = () => {
    const status = waterbody.verificationStatus || (isDemo ? 'Demo Data' : 'Source Needed');
    switch (status) {
      case 'Source Verified':
        return (
          <span className="text-[11px] font-bold text-emerald flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald"></span>
            Source Verified
          </span>
        );
      case 'Community Report':
        return (
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Community Report
          </span>
        );
      case 'Demo Data':
        return (
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Demo Data
          </span>
        );
      case 'Source Needed':
      default:
        return (
          <span className="text-[11px] font-semibold text-yellow-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            Source Needed
          </span>
        );
    }
  };

  const sourceNameDisplay = isSpecificSourceName(waterbody.sourceName)
    ? waterbody.sourceName
    : 'Demo Data — No Live Source';

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-ocean-700/70 flex flex-col justify-between group h-full">
      
      {/* Top Image Banner & Badges */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <img
          src={waterbody.image}
          alt={waterbody.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/20 to-black/30"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge level={waterbody.attentionLevel} />
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-ocean-950/80 backdrop-blur-md text-aqua-300 border border-ocean-700">
            {waterbody.type || waterbody.waterbodyType}
          </span>
        </div>

        {/* Location Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-950/85 backdrop-blur-md text-xs font-semibold text-slate-200 border border-ocean-700 truncate">
          <MapPin className="w-3.5 h-3.5 text-aqua-400 shrink-0" />
          <span className="truncate">{waterbody.location}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          {/* Cleanup Status Tag & Content Type */}
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(waterbody.cleanupStatus)}`}>
              {waterbody.cleanupStatus === 'External Organization Event' && <ExternalLink className="w-3 h-3" />}
              {waterbody.cleanupStatus === 'AquaRise Mission' && <ShieldCheck className="w-3 h-3" />}
              {waterbody.cleanupStatus}
            </span>

            {getContentTypeTag()}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white group-hover:text-aqua-300 transition-colors line-clamp-1">
            {waterbody.name}
          </h3>

          {/* Environmental Concern */}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {waterbody.description || waterbody.environmentalSummary}
          </p>
        </div>

        {/* Source Details */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-ocean-800">
          <span className="flex items-center gap-1 text-slate-400 truncate max-w-[170px]">
            <Link2 className="w-3 h-3 text-aqua-400 shrink-0" />
            Source: <strong className="text-slate-300 truncate">{sourceNameDisplay}</strong>
          </span>
          <span className="text-[10px] text-slate-500 shrink-0">Checked: {waterbody.lastChecked || 'Aug 24'}</span>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-ocean-800/80">
          {getVerificationTag()}

          <button
            onClick={() => onViewDetails(waterbody)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-aqua-300 hover:text-white transition-colors group-hover:translate-x-0.5 transition-transform"
          >
            <span>Explore Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
