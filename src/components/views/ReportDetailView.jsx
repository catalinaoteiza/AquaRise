import React from 'react';
import { ArrowLeft, MapPin, Calendar, AlertTriangle, ShieldAlert, Flag, Info, CheckCircle2, Shield, Camera } from 'lucide-react';
import Badge from '../common/Badge';
import InteractiveLeafletMap from '../common/InteractiveLeafletMap';

export default function ReportDetailView({ report, onBackToReports, onProposeCleanup }) {
  if (!report) return null;

  const hasPhotos = Array.isArray(report.images) && report.images.length > 0 && Boolean(report.images[0]);
  const hasCoords = Boolean(report.coordinates && report.coordinates.lat && report.coordinates.lng);

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        
        {/* Top Navigation / Standardized Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToReports}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-ocean-950 font-bold text-xs border border-[#92F1EC] hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#19887F]" />
            <span>← Back to Community Reports</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              {report.pollutionSeverity || 'High'} Severity
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-[#19887F] border border-teal-200">
              Community Report
            </span>
          </div>
        </div>

        {/* Main Details Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#92F1EC] shadow-xl space-y-8">
          
          {/* Header & Title */}
          <div className="space-y-3 border-b border-teal-200 pb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>Report ID: {report.id}</span>
              <span>•</span>
              <span>Submitted {report.submittedAt || 'Recently'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-ocean-950">{report.waterbodyName}</h1>
            
            <div className="flex items-center gap-2 text-sm font-bold text-[#19887F]">
              <MapPin className="w-4 h-4 text-[#19887F]" />
              <span>
                {[report.city, report.region, report.country].filter(Boolean).join(', ') || report.locationDescription || 'Geotagged Location'}
              </span>
            </div>
          </div>

          {/* Photos Grid or AquaRise Neutral Placeholder */}
          <div>
            <h3 className="text-xs font-extrabold text-ocean-950 uppercase tracking-wider mb-3">Field Photo Evidence</h3>
            {hasPhotos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.images.map((imgSrc, idx) => (
                  <div key={idx} className="h-56 rounded-2xl border border-teal-200 overflow-hidden shadow-sm">
                    <img src={imgSrc} alt={`Report Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100/60 border border-teal-200 text-center space-y-2">
                <Camera className="w-8 h-8 text-[#19887F] mx-auto opacity-70" />
                <span className="text-xs font-bold text-[#19887F] block">No Photo Uploaded</span>
                <p className="text-[11px] text-slate-600 font-medium max-w-sm mx-auto">
                  The reporter did not include photo evidence with this observation.
                </p>
              </div>
            )}
          </div>

          {/* Description & Attributes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-xs font-extrabold text-ocean-950 uppercase tracking-wider mb-2">Pollution Observation Details</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-teal-200">
                  {report.description}
                </p>
              </div>

              {/* Observed Contaminants Chips */}
              {report.pollutionTypes && report.pollutionTypes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-ocean-950 uppercase tracking-wider">Observed Contaminants</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.pollutionTypes.map((type) => (
                      <span key={type} className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#19887F] text-xs font-bold border border-teal-200">
                        ✓ {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-teal-200">
                  <span className="text-slate-500 block font-bold text-[10px] uppercase">Waterbody Type</span>
                  <strong className="text-ocean-950 font-bold">{report.waterbodyType || 'River'}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-teal-200">
                  <span className="text-slate-500 block font-bold text-[10px] uppercase">Affected Area</span>
                  <strong className="text-ocean-950 font-bold">{report.affectedArea || 'Localized area'}</strong>
                </div>
              </div>
            </div>

            {/* Organize Cleanup Callout */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#DAF6F6]/50 border border-[#92F1EC] space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#19887F] bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                  Field Response Engine
                </span>
                <h3 className="text-xl font-extrabold text-ocean-950 pt-1">Mobilize Local Cleanup Action</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Turn this observation into a real volunteer cleanup mission. Pre-fills location details from this report.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onProposeCleanup(report)}
                className="w-full py-4 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flag className="w-4 h-4 text-white" />
                <span>Propose Cleanup for this Report</span>
              </button>
            </div>

          </div>

          {/* Interactive Geotagged Map & Exact Location Breakdown (Section 6) */}
          <div className="space-y-4 pt-4 border-t border-teal-200">
            <h3 className="text-xs font-extrabold text-ocean-950 uppercase tracking-wider">Geotagged Location & Field Coordinates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-teal-200">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Broad Location</span>
                <strong className="text-ocean-950 font-bold text-sm">
                  {[report.city, report.region, report.country].filter(Boolean).join(', ') || 'Location specified'}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Exact Reported Point</span>
                {hasCoords ? (
                  <div className="space-y-0.5">
                    <strong className="text-[#19887F] font-bold font-mono text-sm block">
                      {report.coordinates.lat}, {report.coordinates.lng}
                    </strong>
                    {report.exactLocationLabel && (
                      <span className="text-slate-600 font-medium text-[11px] block truncate" title={report.exactLocationLabel}>
                        📍 {report.exactLocationLabel}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 italic">No GPS coordinates provided</span>
                )}
              </div>
            </div>

            <InteractiveLeafletMap
              initialLat={report.coordinates?.lat}
              initialLng={report.coordinates?.lng}
              readOnly={true}
              height="320px"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
