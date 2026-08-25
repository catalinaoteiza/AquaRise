import React, { useState } from 'react';
import { Printer, Copy, CheckCircle2, ArrowLeft, ShieldCheck, QrCode, Award, ExternalLink, Calendar, MapPin, Clock, Trash2, Star } from 'lucide-react';
import Logo from '../common/Logo';

export default function CertificateDetailView({ certificate, onBack, onVerifyLinkClick }) {
  const [copied, setCopied] = useState(false);

  if (!certificate) {
    return (
      <div className="bg-[#DAF6F6] min-h-screen pt-32 pb-20 max-w-4xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-ocean-950">Certificate Not Found</h1>
        <p className="text-sm text-slate-600 font-medium">We could not locate this certificate record.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full bg-[#076DDF] text-white font-bold text-xs shadow-md"
        >
          Return to My Impact
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificateId}`;
    navigator.clipboard?.writeText?.(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-[#DAF6F6] min-h-screen certificate-page-view pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        
        {/* Top Action Bar (Screen Only - Hidden in Print via .no-print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#92F1EC] shadow-md">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-ocean-950 font-bold text-xs border border-[#92F1EC] hover:bg-[#92F1EC]/30 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#076DDF]"
          >
            <ArrowLeft className="w-4 h-4 text-[#19887F]" />
            <span>Back to My Impact</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs border border-teal-200 transition-all"
            >
              <Copy className="w-4 h-4 text-[#19887F]" />
              <span>{copied ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Document Card */}
        <div className="printable-certificate bg-white p-8 sm:p-14 rounded-3xl border-4 border-[#35AEAC] shadow-2xl relative space-y-8 overflow-hidden">
          
          {/* Certificate Frame Accents */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#19887F]"></div>
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#19887F]"></div>
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#19887F]"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#19887F]"></div>

          {/* Certificate Header */}
          <div className="text-center space-y-3 border-b border-teal-200 pb-6">
            <div className="flex justify-center">
              <Logo />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-[#19887F] block">
              Official Environmental Recognition
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-ocean-950 font-serif">
              Certificate of Appreciation
            </h1>

            <p className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
              Issued by AquaRise Guardian Global Network
            </p>
          </div>

          {/* Certificate Body Text */}
          <div className="text-center space-y-6 max-w-2xl mx-auto py-4">
            <p className="text-sm text-slate-600 font-medium">This certificate is proudly awarded to</p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-ocean-950 font-serif border-b-2 border-[#076DDF] inline-block px-8 py-1">
              {certificate.guardianName}
            </h2>

            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              In recognition of dedicated environmental volunteer service and outstanding contribution to the cleanup and preservation of <strong>{certificate.waterbodyName}</strong>.
            </p>
          </div>

          {/* Certificate Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-teal-200 text-xs text-slate-700">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Verified Hours</span>
              <span className="font-bold text-[#19887F] text-sm">{certificate.volunteerHours} Hours</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Date Issued</span>
              <span className="font-bold text-ocean-950 text-sm">{certificate.issuedDate}</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Certificate ID</span>
              <span className="font-bold text-[#076DDF] font-mono text-sm">{certificate.certificateId}</span>
            </div>
          </div>

          {/* Certificate Signatures & Seal Footer */}
          <div className="pt-6 border-t border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <div className="font-serif italic text-lg font-bold text-ocean-950 border-b border-slate-300 pb-1 px-4 inline-block">
                AquaRise Council
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Guardian Operations Board</span>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm">
              <Award className="w-6 h-6 text-amber-600" />
              <span>Verified Authentic Record</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
