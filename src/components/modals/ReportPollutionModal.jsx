import React, { useEffect } from 'react';
import { AlertTriangle, MapPin, ArrowRight, X } from 'lucide-react';

export default function ReportPollutionModal({ isOpen, onClose, onNavigateReport }) {
  useEffect(() => {
    if (isOpen && onNavigateReport) {
      onClose();
      onNavigateReport();
    }
  }, [isOpen, onClose, onNavigateReport]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative text-ocean-950 text-center space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#19887F] mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[#19887F]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-ocean-950">File a Pollution Report</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Report a polluted waterbody using our full interactive field map and photo evidence uploader.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            if (onNavigateReport) onNavigateReport();
          }}
          className="w-full py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Open Full Report Form</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
