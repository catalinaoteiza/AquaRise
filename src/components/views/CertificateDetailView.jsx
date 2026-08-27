import React, { useState, useEffect } from 'react';
import { Printer, Copy, ArrowLeft, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import { getPublicCertificate } from '../../services/completionService.js';
import Logo from '../common/Logo';

function formatCertificateDate(dateInput) {
  if (!dateInput) return '';
  try {
    const str = String(dateInput).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    }
    const date = new Date(str);
    if (isNaN(date.getTime())) return str;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return String(dateInput);
  }
}

export default function CertificateDetailView({ certificate, certificateCode, onBack, onVerifyLinkClick }) {
  const [copied, setCopied] = useState(false);
  const [certData, setCertData] = useState(certificate || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const rawCode = certificateCode || certificate?.certificate_code || certificate?.certificateCode;
  const targetCode = rawCode && typeof rawCode === 'string' && rawCode.trim().toUpperCase().startsWith('AQR-')
    ? rawCode.trim().toUpperCase()
    : null;

  useEffect(() => {
    let isMounted = true;
    async function loadRealCertificate() {
      if (certificate && certificate.certificate_code && certificate.recipient_name && certificate.mission_title) {
        setCertData(certificate);
        setIsLoading(false);
        setLoadError(false);
        return;
      }

      if (!targetCode) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(false);

      const res = await getPublicCertificate(targetCode);
      if (isMounted) {
        if (res && res.found) {
          setCertData(res);
          setLoadError(false);
        } else {
          setCertData(null);
          setLoadError(true);
        }
        setIsLoading(false);
      }
    }

    loadRealCertificate();

    return () => {
      isMounted = false;
    };
  }, [certificate, targetCode]);

  if (isLoading) {
    return (
      <div className="bg-[#DAF6F6] min-h-screen pt-32 pb-20 max-w-4xl mx-auto px-4 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#076DDF] animate-spin mx-auto" />
        <p className="text-sm text-slate-600 font-bold">Loading official certificate from AquaRise network...</p>
      </div>
    );
  }

  if (loadError || !certData || !certData.certificate_code || !certData.recipient_name || !certData.mission_title) {
    return (
      <div className="bg-[#DAF6F6] min-h-screen pt-32 pb-20 max-w-4xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-ocean-950">Certificate could not be loaded</h1>
        <p className="text-sm text-slate-600 font-medium">We could not locate an official AquaRise certificate record for this request.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full bg-[#076DDF] text-white font-bold text-xs shadow-md cursor-pointer"
        >
          Return to My Impact
        </button>
      </div>
    );
  }

  const recipientName = certData.recipient_name;
  const certCode = certData.certificate_code;
  const missionTitle = certData.mission_title;
  const waterbody = certData.waterbody_name || '';
  const locationText = [certData.city, certData.region, certData.country].filter(Boolean).join(', ') || certData.location || '';

  const volunteerMins = certData.volunteer_minutes || 0;
  const hoursDisplay = Math.floor(volunteerMins / 60);
  const minsDisplay = volunteerMins % 60;
  const timeText = volunteerMins > 0
    ? (hoursDisplay > 0
        ? `${hoursDisplay} hr${hoursDisplay > 1 ? 's' : ''}${minsDisplay > 0 ? ` ${minsDisplay} min` : ''}`
        : `${minsDisplay} min`)
    : '';

  const issuedDateText = formatCertificateDate(certData.issued_at);
  const eventDateText = formatCertificateDate(certData.event_date) || issuedDateText;

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
        
        {/* Top Action Bar */}
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
          
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#19887F]"></div>
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#19887F]"></div>
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#19887F]"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#19887F]"></div>

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

          <div className="text-center space-y-6 max-w-2xl mx-auto py-4">
            <p className="text-sm text-slate-600 font-medium tracking-normal">This certificate is proudly awarded to</p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-ocean-950 font-serif border-b-2 border-[#076DDF] inline-block px-8 py-1 tracking-normal">
              {recipientName}
            </h2>

            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed tracking-normal">
              in recognition of verified volunteer dedication and active environmental contribution during the{' '}
              <strong className="text-ocean-950 font-bold">{missionTitle}</strong>
              {waterbody ? (
                <>
                  {' '}protecting local waterbodies at{' '}
                  <strong className="text-[#19887F] font-bold">{waterbody}</strong>
                </>
              ) : null}
              {locationText ? <span className="text-slate-600 font-normal"> ({locationText})</span> : null}.
            </p>
          </div>

          {/* Key Certificate Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto p-4 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] text-center text-xs">
            {timeText ? (
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Verified Time</span>
                <strong className="text-sm text-[#19887F] font-extrabold block">{timeText}</strong>
              </div>
            ) : null}

            {eventDateText ? (
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Cleanup Date</span>
                <strong className="text-sm text-ocean-950 font-extrabold block">{eventDateText}</strong>
              </div>
            ) : null}

            {issuedDateText ? (
              <div className="col-span-2 sm:col-span-1 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Issued Date</span>
                <strong className="text-sm text-slate-800 font-extrabold block">{issuedDateText}</strong>
              </div>
            ) : null}
          </div>

          {/* Certificate Footer Verification Info */}
          <div className="pt-6 border-t border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Public Certificate Code</span>
              <strong className="text-sm font-mono text-ocean-950 font-extrabold tracking-normal block">{certCode}</strong>
              <button
                onClick={() => onVerifyLinkClick && onVerifyLinkClick(certCode)}
                className="no-print text-[#076DDF] hover:underline font-bold text-[11px] inline-flex items-center gap-1 mt-1 cursor-pointer"
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
