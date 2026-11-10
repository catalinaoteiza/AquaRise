import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

const CAMPAIGN_SLUG = 'aquarise-x-al-musa-charity-uganda-cleanup';
const CAMPAIGN_URL = `https://donorbox.org/${CAMPAIGN_SLUG}`;

/**
 * Donorbox's official embedded donation form.
 * The widgets.js module is loaded globally from index.html so the custom
 * element is defined before this route mounts, including SPA navigation.
 */
export default function DonorboxWidget({ className = '' }) {
  return (
    <div className={`w-full max-w-xl mx-auto flex flex-col items-center ${className}`}>
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-3 bg-teal-700 px-5 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Secure donation form</p>
            <p className="mt-1 text-[11px] text-teal-50">AquaRise × Al Musa Charity Uganda</p>
          </div>
          <ShieldCheck className="h-5 w-5 shrink-0" />
        </div>

        <div className="w-full bg-white p-2 sm:p-4">
          <dbox-widget
            campaign={CAMPAIGN_SLUG}
            type="donation_form"
            enable-auto-scroll="true"
          ></dbox-widget>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 text-center text-[11px] text-slate-600 sm:flex-row sm:text-left">
          <span>Secure checkout powered by Donorbox</span>
          <a
            href={CAMPAIGN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline"
          >
            Open campaign directly <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        No AquaRise account required
      </p>
    </div>
  );
}
