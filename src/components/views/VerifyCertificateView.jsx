import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, CheckCircle2, Award, Calendar, MapPin, Clock, ArrowRight, Compass, ArrowLeft } from 'lucide-react';
import { findCertificateById } from '../../utils/storage';

export default function VerifyCertificateView({ initialCertId = '', onViewCertificate, onNavigateHome }) {
  const [searchId, setSearchId] = useState(initialCertId);
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-verify if initialCertId is passed
  useEffect(() => {
    if (initialCertId) {
      setSearchId(initialCertId);
      const found = findCertificateById(initialCertId);
      setVerifiedCert(found || null);
      setHasSearched(true);
    }
  }, [initialCertId]);

  const handleVerify = (e) => {
    e?.preventDefault();
    if (!searchId.trim()) return;
    const found = findCertificateById(searchId);
    setVerifiedCert(found || null);
    setHasSearched(true);
  };

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        
        {/* Standardized AquaRise Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-ocean-950 font-bold text-xs border border-[#92F1EC] hover:bg-[#92F1EC]/30 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#076DDF]"
          >
            <ArrowLeft className="w-4 h-4 text-[#19887F]" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* View Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#19887F]/10 border border-[#19887F]/30 text-[#19887F] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#19887F]" />
            <span>AquaRise Certificate Verification Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-ocean-950">
            Verify <span className="text-[#076DDF]">Certificate</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg font-medium">
            Validate authentic AquaRise Certificates of Appreciation issued for environmental volunteer participation.
          </p>
        </div>

        {/* Verification Input Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md space-y-6">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Enter Certificate ID (e.g. AR-2026-8F3K21)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-slate-50 border border-teal-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] uppercase tracking-wider font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all shrink-0"
            >
              Verify Certificate
            </button>
          </form>
        </div>

        {/* Verification Result Display */}
        {hasSearched && (
          verifiedCert ? (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-300 shadow-lg space-y-6 animate-fadeIn">
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Official Verification Confirmed
                  </span>
                  <h3 className="text-lg font-bold text-ocean-950">Valid AquaRise Certificate</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Recipient Name</span>
                  <strong className="text-base text-ocean-950 font-bold block">{verifiedCert.guardianName}</strong>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Certificate ID</span>
                  <strong className="text-base text-ocean-950 font-mono font-bold block">{verifiedCert.certificateId}</strong>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Cleanup Mission</span>
                  <strong className="text-sm text-ocean-950 font-bold block">{verifiedCert.waterbodyName} Cleanup</strong>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Verified Hours & Issued Date</span>
                  <strong className="text-sm text-[#19887F] font-bold block">{verifiedCert.volunteerHours} hrs • {verifiedCert.issuedDate}</strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onViewCertificate(verifiedCert)}
                  className="px-6 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all"
                >
                  View Full Certificate Details ➔
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-md text-center space-y-4 animate-fadeIn">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-xl font-bold text-ocean-950">Certificate Not Found</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                No certificate matches ID <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-ocean-950">{searchId}</code>. Check the certificate code or generate a certificate from your My Impact dashboard.
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
