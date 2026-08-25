import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, ShieldCheck, Users, AlertTriangle, ExternalLink, CheckCircle2, Flag, Package, Info, ShieldAlert, Link2 } from 'lucide-react';
import Badge from '../common/Badge';
import LocationMapPlaceholder from '../common/LocationMapPlaceholder';
import { isSpecificSourceName, isValidExternalUrl, verifyExternalEventEvidence } from '../../services/sourceVerificationLayer';

export default function WaterbodyDetailView({
  waterbody,
  onBackToExplore,
  onProposeCleanup,
  onSponsorSupplies,
  onBecomeGuardian
}) {
  const [joinedAquaRiseEvent, setJoinedAquaRiseEvent] = useState(false);

  if (!waterbody) return null;

  const event = waterbody.cleanupEvent;
  const isDemo = waterbody.isDemoEvent || waterbody.verificationStatus === 'Demo Data' || event?.isDemoEvent;

  // Strict verification check for source metadata
  const hasRealSourceUrl = isValidExternalUrl(waterbody.sourceUrl);
  const hasRealSourceName = isSpecificSourceName(waterbody.sourceName);
  
  const sourceNameDisplay = hasRealSourceName
    ? waterbody.sourceName
    : 'External Environmental Source';

  // Evaluate whether a genuine verified cleanup opportunity exists
  const hasVerifiedEvent =
    (waterbody.cleanupStatus === 'AquaRise Mission' && !isDemo) ||
    (waterbody.cleanupStatus === 'External Organization Event' && verifyExternalEventEvidence(event) && !isDemo);

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* Top Breadcrumb / Standardized Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToExplore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-ocean-950 font-bold text-xs border border-[#92F1EC] hover:bg-[#92F1EC]/30 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#076DDF]"
          >
            <ArrowLeft className="w-4 h-4 text-[#19887F]" />
            <span>Back to Explore Waterbodies</span>
          </button>

          <div className="flex items-center gap-2">
            <Badge level={waterbody.attentionLevel} />
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-ocean-950 border border-teal-200 shadow-sm">
              {waterbody.type || waterbody.waterbodyType}
            </span>
          </div>
        </div>

        {/* 1. Waterbody Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Hero Image Banner */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#92F1EC] relative min-h-[320px] sm:min-h-[400px] shadow-lg">
            <img
              src={waterbody.image}
              alt={waterbody.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-ocean-950 border border-white shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#19887F]" />
                <span>{waterbody.location}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">{waterbody.name}</h1>
            </div>
          </div>

          {/* Overview Details Panel */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] flex flex-col justify-between space-y-6 shadow-md">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#19887F] bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
                  Waterbody Profile & Context
                </span>
                <h2 className="text-2xl font-black text-ocean-950">{waterbody.name}</h2>
                <p className="text-xs text-slate-500 font-semibold">{waterbody.city ? `${waterbody.city}, ` : ''}{waterbody.region ? `${waterbody.region}, ` : ''}{waterbody.country}</p>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {waterbody.description || waterbody.summary}
              </p>

              {/* Status & Metrics Badge */}
              <div className="p-4 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-ocean-950">
                  <span>Current Water Quality Status</span>
                  <span className="text-[#19887F]">{waterbody.statusText || 'Needs Attention'}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Environmental Source</span>
                  <span className="font-bold text-ocean-950">{sourceNameDisplay}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 border-t border-teal-200">
              <button
                onClick={() => onProposeCleanup(waterbody)}
                className="w-full py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                <span>Organize Cleanup Mission for {waterbody.name}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
