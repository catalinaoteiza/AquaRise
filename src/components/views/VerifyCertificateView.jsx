import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, CheckCircle2, Award, Calendar, MapPin, Clock, ArrowRight, Compass, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import { getPublicCertificate } from '../../services/completionService.js';
import { findCertificateById } from '../../utils/storage';

export default function VerifyCertificateView({ initialCertId = '', onViewCertificate, onNavigateHome }) {
  const [searchId, setSearchId] = useState(initialCertId);
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLookup = async (code) => {
    const trimmed = (code || '').trim();
    if (!trimmed) return;

    setIsSearching(true);
    setErrorMessage('');
    setVerifiedCert(null);
    setIsRevoked(false);

    // 1. Query Supabase RPC get_public_certificate
    const res = await getPublicCertificate(trimmed);

    if (res && res.found) {
      if (res.status === 'revoked') {
        setIsRevoked(true);
        setVerifiedCert(res);
      } else {
        setVerifiedCert(res);
        setIsRevoked(false);
      }
      setIsSearching(false);
      setHasSearched(true);
      return;
    }

    // 2. Fallback to LocalStorage for legacy demo certificates
    const legacyCert = findCertificateById(trimmed);
    if (legacyCert) {
      setVerifiedCert({
        certificate_code: legacyCert.certificateId,
        recipient_name: legacyCert.guardianName,
        mission_title: `${legacyCert.waterbodyName || 'Community'} Cleanup`,
        waterbody_name: legacyCert.waterbodyName,
        volunteer_minutes: (legacyCert.volunteerHours || 3) * 60,
        issued_at: legacyCert.issuedDate || legacyCert.issuedAt,
        status: 'valid'
      });
      setIsRevoked(false);
    } else {
      setErrorMessage(res?.error || 'Certificate not found.');
    }

    setIsSearching(false);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialCertId) {
      setSearchId(initialCertId);
      executeLookup(initialCertId);
    }
  }, [initialCertId]);

  const handleVerify = (e) => {
    e?.preventDefault();
    executeLookup(searchId);
  };

  const formatMinutes = (mins) => {
    if (!mins) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${h} hr ${m} min`;
  };

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        
        {/* Back Button */}
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#19887F] text-xs font-black uppercase tracking-wider shadow-sm border border-[#92F1EC]">
            <ShieldCheck className="w-4 h-4 text-[#19887F]" />
            <span>AquaRise Certificate Verification Portal</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#042F2E] font-normal tracking-tight">
            Verify <span className="text-[#0D9488] italic font-normal">Certificate</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg font-medium">
            Validate authentic AquaRise Certificates of Appreciation issued for verified environmental volunteer participation.
          </p>
        </div>

        {/* Verification Input Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] shadow-md space-y-6">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Enter Certificate Code (e.g. AQR-8F32C91A7B4D)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-slate-50 border border-teal-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] uppercase tracking-wider font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-3 rounded-2xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Verify Certificate</span>
            </button>
          </form>
        </div>

        {/* Verification Result Display */}
        {hasSearched && (
          isRevoked ? (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-rose-300 shadow-lg space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                    Certificate Status Warning
                  </span>
                  <h3 className="text-lg font-bold text-ocean-950">Certificate Revoked</h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                This certificate (Code: <strong className="font-mono">{verifiedCert?.certificate_code}</strong>) was officially revoked and is no longer valid.
              </p>
            </div>
          ) : verifiedCert ? (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-300 shadow-lg space-y-6 animate-fadeIn">
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Official Verification Confirmed
                  </span>
                  <h3 className="text-lg font-bold text-ocean-950">Verified AquaRise Certificate ✓</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Recipient Name</span>
                  <strong className="text-base text-ocean-950 font-bold block">{verifiedCert.recipient_name}</strong>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Certificate Code</span>
                  <strong className="text-base text-ocean-950 font-mono font-bold block">{verifiedCert.certificate_code}</strong>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Cleanup Mission & Location</span>
                  <strong className="text-sm text-ocean-950 font-bold block">
                    {verifiedCert.mission_title}
                  </strong>
                  <span className="text-slate-500 text-[11px] block">
                    {[verifiedCert.waterbody_name, verifiedCert.city, verifiedCert.country].filter(Boolean).join(', ')}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold block">Verified Volunteer Time & Issued Date</span>
                  <strong className="text-sm text-[#19887F] font-bold block">
                    {formatMinutes(verifiedCert.volunteer_minutes)} • {new Date(verifiedCert.issued_at).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 text-center text-xs text-teal-800 font-medium">
                Verified by AquaRise Environmental Action Network
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-rose-200 shadow-md space-y-4 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ocean-950">Certificate Not Found</h3>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                No active AquaRise certificate matches code "{searchId}". Please check for typos and try again.
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
