import React from 'react';
import { X, Globe2, Users, MapPin, Flag, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RegionalNetworkModal({ network, isOpen, onClose, onViewMission, onViewReport }) {
  if (!isOpen || !network) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 border-b border-teal-200 pb-4">
          <div className="p-3.5 rounded-2xl bg-teal-50 text-[#19887F] border border-teal-200">
            <Globe2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#19887F] bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
              {network.location}
            </span>
            <h2 className="text-2xl font-black text-ocean-950">{network.name}</h2>
            <p className="text-xs text-slate-600 font-semibold">{network.guardiansText}</p>
          </div>
        </div>

        {/* Real Network Activity Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200">
            <span className="text-xs text-slate-500 uppercase font-bold block">Community Missions</span>
            <span className="text-2xl font-black text-[#076DDF]">{network.missions?.length || 0}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200">
            <span className="text-xs text-slate-500 uppercase font-bold block">Pollution Reports</span>
            <span className="text-2xl font-black text-amber-600">{network.reports?.length || 0}</span>
          </div>
        </div>

        {/* Regional Guardians List */}
        {network.guardianList?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-ocean-950 tracking-wider">Active Regional Guardians</h3>
            <div className="flex flex-wrap gap-2">
              {network.guardianList.map((gName, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-teal-50 text-[#19887F] text-xs font-bold border border-teal-200">
                  {gName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Genuine Community Missions in Region */}
        {network.missions?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-ocean-950 tracking-wider flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-[#076DDF]" />
              Local Community Missions
            </h3>
            <div className="space-y-2">
              {network.missions.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-teal-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-ocean-950">{m.title}</h4>
                    <p className="text-xs text-slate-500">{m.location} • {m.date}</p>
                  </div>
                  {onViewMission && (
                    <button
                      onClick={() => {
                        onClose();
                        onViewMission(m);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#076DDF] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genuine Local Reports */}
        {network.reports?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-ocean-950 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Local Pollution Reports
            </h3>
            <div className="space-y-2">
              {network.reports.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-teal-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-ocean-950">{r.title}</h4>
                    <p className="text-xs text-slate-500">{r.waterbodyName} • Severity: {r.severity}</p>
                  </div>
                  {onViewReport && (
                    <button
                      onClick={() => {
                        onClose();
                        onViewReport(r);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 text-ocean-950 text-xs font-bold flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
