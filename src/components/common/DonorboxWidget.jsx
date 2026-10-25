import React, { useEffect, useState, useRef } from 'react';
import { Heart, ExternalLink, ShieldCheck, Lock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const CAMPAIGN_SLUG = 'aquarise-x-al-musa-charity-uganda-cleanup';
const CAMPAIGN_URL = `https://donorbox.org/${CAMPAIGN_SLUG}`;
const SCRIPT_URL = 'https://donorbox.org/widgets.js';

/**
 * Dedicated Donorbox Widget Component.
 * Injects https://donorbox.org/widgets.js once and mounts <dbox-widget>.
 * Includes loading state, error fallback, and verified direct donation campaign link.
 */
export default function DonorboxWidget({ className = '' }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if script is already present in document
    const existingScript = document.querySelector(`script[src="${SCRIPT_URL}"]`);

    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    // Load Donorbox widget script once
    const script = document.createElement('script');
    script.type = 'module';
    script.src = SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      console.warn('[DonorboxWidget] Failed to load Donorbox script. Direct campaign fallback active.');
      setHasError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Do not remove script on unmount so subsequent renders or other components reuse it
    };
  }, []);

  return (
    <div className={`w-full max-w-xl mx-auto flex flex-col items-center ${className}`}>
      
      {/* Widget Card Container */}
      <div className="w-full bg-white rounded-3xl border border-teal-100 shadow-2xl overflow-hidden text-slate-800">
        
        {/* Widget Top Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0D9488] via-[#19887F] to-[#076DDF] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wide uppercase block">Secure Donation Form</span>
              <span className="text-[10px] text-teal-100 font-medium">AquaRise × Al Musa Charity Uganda</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-100 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
            <Lock className="w-3 h-3 text-emerald-300" />
            <span>256-bit SSL</span>
          </div>
        </div>

        {/* Form Body / Custom Element Mount */}
        <div ref={containerRef} className="p-2 sm:p-4 min-h-[560px] flex flex-col items-center justify-center relative bg-slate-50/50">
          
          {/* Loading indicator until script loads */}
          {!scriptLoaded && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-white/90 backdrop-blur-sm z-10">
              <RefreshCw className="w-8 h-8 text-[#19887F] animate-spin" />
              <p className="text-xs font-bold text-slate-700">Loading secure donation form...</p>
              <p className="text-[11px] text-slate-500 max-w-xs">Connecting to verified Donorbox checkout</p>
            </div>
          )}

          {/* Official Donorbox Custom Element */}
          <div className="w-full flex justify-center">
            <dbox-widget
              campaign={CAMPAIGN_SLUG}
              type="donation_form"
              enable-auto-scroll="true"
              style={{ width: '100%', minHeight: '520px', display: 'block' }}
            ></dbox-widget>
          </div>

          {/* Script Load Error Fallback Banner */}
          {hasError && (
            <div className="p-5 my-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 text-center w-full">
              <div className="flex items-center justify-center gap-2 font-black text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Donation Form Display Notice</span>
              </div>
              <p className="text-[11px] text-amber-800">
                If your browser or an ad-blocker prevented the embed from loading, you can donate directly on the official Donorbox campaign page:
              </p>
              <a
                href={CAMPAIGN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#19887F] hover:bg-[#0D9488] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer mt-1"
              >
                <span>Open Verified Donorbox Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Security & Direct Link Footer */}
        <div className="px-6 py-3.5 bg-slate-100/90 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Powered by Donorbox • Safe, direct payment processing</span>
          </div>
          
          <a
            href={CAMPAIGN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#076DDF] hover:text-[#0551a8] font-bold inline-flex items-center gap-1 hover:underline shrink-0"
            title="Open campaign in new tab"
          >
            <span>Verified Campaign Page</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Under-Form Trust Reassurance */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
          No AquaRise account required
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
          100% Volunteer field supplies
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
          Direct international transfer
        </span>
      </div>

    </div>
  );
}
