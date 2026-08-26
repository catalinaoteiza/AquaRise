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

  const recipientName = certificate.recipient_name || certificate.recipientName || certificate.guardianName || 'AquaRise Guardian';
  const certCode = certificate.certificate_code || certificate.certificateCode || certificate.certificateId || 'AQR-VALID';
  const missionTitle = certificate.mission_title || certificate.missionTitle || `${certificate.waterbodyName || 'Community'} Cleanup`;
  const waterbody = certificate.waterbody_name || certificate.waterbodyName || 'Local Waterbody';
  const locationText = [certificate.city, certificate.region, certificate.country].filter(Boolean).join(', ') || certificate.location || 'Global Cleanup Site';
  
  const volunteerMins = certificate.volunteer_minutes || (certificate.volunteerHours ? certificate.volunteerHours * 60 : 120);
  const hoursDisplay = Math.floor(volunteerMins / 60);
  const minsDisplay = volunteerMins % 60;
  const timeText = hoursDisplay > 0 ? `${hoursDisplay} hr${hoursDisplay > 1 ? 's' : ''} ${minsDisplay > 0 ? `${minsDisplay} m` : ''}` : `${minsDisplay} min`;

  const issuedDateText = certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString() : (certificate.issuedDate || '2026');
  const eventDateText = certificate.event_date ? new Date(certificate.event_date).toLocaleDateString() : (certificate.eventDate || issuedDateText);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/verify/${certCode}`;
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs border border-teal-200 transition-all cursor-pointer"
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
              <img
                src="/aquarise-logo.png"
                alt="AquaRise"
                className="certificate-logo h-14 sm:h-16 w-auto max-w-[100px] object-contain mx-auto block"
              />
            </div>

            <span className="text-xs font-black uppercase tracking-wider text-[#19887F] block">
              Official Environmental Recognition
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-ocean-950 font-serif tracking-normal">
              Certificate of Appreciation
            </h1>

            <p className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
              Issued by AquaRise Guardian Global Network
            </p>
          </div>

          {/* Certificate Body Text */}
          <div className="text-center space-y-6 max-w-2xl mx-auto py-4">
            <p className="text-sm text-slate-600 font-medium tracking-normal">This certificate is proudly awarded to</p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-ocean-950 font-serif border-b-2 border-[#076DDF] inline-block px-8 py-1 tracking-normal">
              {recipientName}
            </h2>

            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed tracking-normal">
              in recognition of verified volunteer dedication and active environmental contribution during the{' '}
              <strong className="text-ocean-950 font-bold">{missionTitle}</strong> protecting local waterbodies at{' '}
              <strong className="text-[#19887F] font-bold">{waterbody}</strong> ({locationText}).
            </p>
          </div>

          {/* Key Certificate Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto p-4 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] text-center text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Verified Time</span>
              <strong className="text-sm text-[#19887F] font-extrabold block">{timeText}</strong>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Cleanup Date</span>
              <strong className="text-sm text-ocean-950 font-extrabold block">{eventDateText}</strong>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Issued Date</span>
              <strong className="text-sm text-slate-800 font-extrabold block">{issuedDateText}</strong>
            </div>
          </div>

          {/* Certificate Footer Verification Info */}
          <div className="pt-6 border-t border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Public Certificate Code</span>
              <strong className="text-sm font-mono text-ocean-950 font-extrabold tracking-normal block">{certCode}</strong>
              <button
                onClick={() => onVerifyLinkClick && onVerifyLinkClick(certCode)}
                className="no-print text-[#076DDF] hover:underline font-bold text-[11px] inline-flex items-center gap-1 mt-1"
              >
                <span>Verify Online</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs tracking-normal">
              <ShieldCheck className="w-5 h-5 text-[#19887F]" />
              <span>Verified by AquaRise</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
