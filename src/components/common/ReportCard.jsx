import React from 'react';
import { MapPin, Calendar, AlertTriangle, ArrowRight, Flag, Info } from 'lucide-react';

export default function ReportCard({ report, onViewReport, onViewDetails, onProposeCleanup }) {
  const handleView = onViewDetails || onViewReport;
  const getSeverityBadgeClass = (severity) => {
    switch (String(severity || '').toLowerCase()) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'moderate':
      default:
        return 'bg-teal-50 text-[#19887F] border-teal-200';
    }
  };

  const hasPhoto = Array.isArray(report?.images) && report.images.length > 0 && report.images[0];

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#92F1EC] flex flex-col justify-between shadow-md hover:border-[#35AEAC] transition-all group h-full">
      
      {/* Top Image & Badges */}
      <div className="relative h-48 overflow-hidden shrink-0 bg-slate-100">
        {hasPhoto ? (
          <img
            src={report.images[0]}
            alt={report.waterbodyName || 'Pollution Report'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 text-[#19887F] p-4 text-center">
            <AlertTriangle className="w-10 h-10 text-[#19887F] mb-1" />
            <span className="text-xs font-bold">AquaRise Community Observation</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/40 via-transparent to-black/10"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${getSeverityBadgeClass(report.pollutionSeverity)}`}>
            {report.pollutionSeverity || 'Moderate'} Severity
          </span>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#19887F] border border-teal-200 shadow-sm">
            Community Report
          </span>
        </div>

        {/* Location Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-ocean-950 border border-teal-200 shadow-sm truncate">
          <MapPin className="w-3.5 h-3.5 text-[#19887F] shrink-0" />
          <span className="truncate">{report.city ? `${report.city}, ${report.country}` : report.country || report.locationDescription || 'Geotagged Location'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px] font-extrabold text-[#19887F] uppercase tracking-wider">{report.waterbodyType || 'Waterbody'}</span>
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              {report.submittedAt ? `Reported ${report.submittedAt}` : 'Recent'}
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-ocean-950 group-hover:text-[#076DDF] transition-colors line-clamp-1">
            {report.waterbodyName}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
            {report.description}
          </p>

          {/* Pollution Types Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {report.pollutionTypes?.slice(0, 3).map((type, idx) => (
              <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#19887F] border border-teal-200">
                {type}
              </span>
            ))}
            {report.pollutionTypes?.length > 3 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                +{report.pollutionTypes.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Verification Disclaimer */}
        <div className="p-2.5 rounded-2xl bg-teal-50/50 border border-teal-200/60 text-[10px] text-slate-600 flex items-start gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-[#19887F] shrink-0 mt-0.5" />
          <span className="line-clamp-2">Guardian-submitted observation. Not yet independently verified.</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (handleView) handleView(report);
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-ocean-950 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#076DDF]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onProposeCleanup) onProposeCleanup(report);
            }}
            className="py-2.5 px-3 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Propose Cleanup</span>
          </button>
        </div>

      </div>

    </div>
  );
}
