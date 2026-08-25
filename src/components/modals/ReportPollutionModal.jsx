import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Camera, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ReportPollutionModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'River',
    urgency: 'High Urgency',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative text-ocean-950">
        
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#19887F]/10 text-[#19887F] border border-[#19887F]/20">
                <AlertTriangle className="w-6 h-6 text-[#19887F]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ocean-950">Report a Polluted Waterbody</h3>
                <p className="text-xs text-slate-600">Alert the AquaRise community to waterbodies needing attention.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ocean-950 mb-1">Waterbody Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muddy Creek or Silver Lake West"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ocean-950 mb-1">Waterbody Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  >
                    <option value="River">River / Stream</option>
                    <option value="Lake">Lake / Pond</option>
                    <option value="Beach">Beach / Coast</option>
                    <option value="Wetland">Wetland / Mangrove</option>
                    <option value="Estuary">Estuary / Bay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-950 mb-1">Pollution Level</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High Urgency">High Urgency</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 mb-1">Location / GPS Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="City, State, Country or Lat/Lng coordinates"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 mb-1">Pollution Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe visible waste, oil slicks, foam, or environmental hazards..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                ></textarea>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>Community reports help Guardians organize future cleanups. All reports are timestamped and tagged for local validation.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-sm shadow-md transition-all"
              >
                Submit Report
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-ocean-950">Pollution Report Submitted!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your report for <strong>{formData.name}</strong> has been logged in AquaRise.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs shadow-md"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
