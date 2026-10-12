import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Lock,
  AlertCircle,
  Info,
  ArrowLeft,
  Droplets,
  Star,
  Check
} from 'lucide-react';
import { useRevenueCat } from '../../context/RevenueCatContext';
import SupporterBadge from '../common/SupporterBadge';

export default function SupporterView({
  user,
  onOpenAuth,
  onBack,
  onToast
}) {
  const {
    isConfigured,
    isSupporter,
    supporterData,
    currentOffering,
    monthlyPackage,
    loading,
    actionLoading,
    dashboardIssues,
    managementUrl,
    refreshSubscription,
    subscribeMonthly,
    showPaywall
  } = useRevenueCat();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfigDetails, setShowConfigDetails] = useState(false);

  // Price formatting
  const formattedPrice =
    monthlyPackage?.product?.currentPrice?.formattedPrice ||
    monthlyPackage?.product?.price?.formattedPrice ||
    '$4.99';

  const billingPeriod = 'monthly';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorMessage('');
    try {
      await refreshSubscription();
      if (onToast) onToast('Subscription status refreshed', 'success');
    } catch {
      setErrorMessage('Failed to refresh subscription status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubscribe = async () => {
    setErrorMessage('');
    const result = await subscribeMonthly();
    if (result.success) {
      if (onToast) onToast('Welcome to AquaRise Supporters! 🌊', 'success');
    } else if (!result.cancelled) {
      setErrorMessage(result.error || 'Subscription checkout could not be completed.');
    }
  };

  const handleOpenPaywall = async () => {
    setErrorMessage('');
    const result = await showPaywall();
    if (result.success) {
      if (onToast) onToast('Thank you for becoming an AquaRise Supporter!', 'success');
    } else if (!result.cancelled) {
      setErrorMessage(result.error || 'Failed to open web paywall.');
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    try {
      const d = new Date(dateObj);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-[#071325] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-teal-500/30">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation Back */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        )}

        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-amber-400/10 border border-amber-400/30 mb-2">
            <SupporterBadge size="lg" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Support the Mission for{' '}
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-amber-200 bg-clip-text text-transparent">
              Clean Water
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            AquaRise is powered by volunteers and community caretakers. Your monthly supporter membership
            funds trash cleanup supplies, water quality testing tools, and open waterway stewardship.
          </p>
        </div>

        {/* Sandbox Indicator Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between text-xs text-amber-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-base">🧪</span>
            <div>
              <span className="font-extrabold text-amber-300">RevenueCat Sandbox Mode</span> — Testing environment. Real payments will not be charged.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowConfigDetails(!showConfigDetails)}
            className="text-[11px] underline text-amber-300 hover:text-white cursor-pointer ml-2 shrink-0 font-bold"
          >
            {showConfigDetails ? 'Hide Status' : 'SDK Status'}
          </button>
        </div>

        {/* Developer Dashboard Diagnostic Drawer */}
        {showConfigDetails && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs space-y-2 text-slate-300">
            <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-400" />
                RevenueCat Integration Diagnostics
              </span>
              <span className={isConfigured ? 'text-emerald-400' : 'text-rose-400'}>
                {isConfigured ? 'API Key Configured' : 'Missing API Key'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div>Target Entitlement: <span className="text-teal-300 font-bold">aquarise_supporter</span></div>
              <div>Current Offering: <span className="text-sky-300">{currentOffering?.identifier || 'None detected'}</span></div>
              <div>Monthly Package: <span className="text-sky-300">{monthlyPackage?.identifier || 'None detected'}</span></div>
              <div>Web Paywall Attached: <span className="text-sky-300">{currentOffering?.hasPaywall ? 'Yes' : 'No'}</span></div>
            </div>
            {dashboardIssues.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-800">
                <div className="text-amber-400 font-bold mb-1">Dashboard Notices:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {dashboardIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-400/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Main Status / Membership Card */}
        {isSupporter ? (
          /* ACTIVE SUPPORTER CARD */
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-950/80 via-[#042F2E]/80 to-slate-900/90 border border-teal-500/40 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-800/50 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SupporterBadge size="md" />
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold uppercase tracking-wider">
                    Active Membership
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">Thank you for supporting AquaRise! 🌊</h2>
                <p className="text-xs text-teal-200/80">
                  Your monthly contribution keeps local waters clean and open to community science.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800/40 hover:bg-teal-700/50 text-teal-200 text-xs font-bold border border-teal-600/30 transition-all cursor-pointer self-start sm:self-center"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
              </button>
            </div>

            {/* Subscription Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-900/30 border border-teal-800/40">
                <div className="text-slate-400 font-bold mb-1">Entitlement</div>
                <div className="text-white font-extrabold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>aquarise_supporter</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-900/30 border border-teal-800/40">
                <div className="text-slate-400 font-bold mb-1">Renews / Expires</div>
                <div className="text-white font-extrabold text-sm">
                  {formatDate(supporterData.expiresDate)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-900/30 border border-teal-800/40">
                <div className="text-slate-400 font-bold mb-1">Billing Status</div>
                <div className="text-emerald-300 font-extrabold text-sm">
                  {supporterData.willRenew ? 'Auto-renews monthly' : 'Active (Set to expire)'}
                </div>
              </div>
            </div>

            {/* Management URL */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {managementUrl ? (
                <a
                  href={managementUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-ocean-950 font-black text-xs shadow-lg transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Manage Subscription in RevenueCat</span>
                </a>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Manage your subscription through your payment receipt email or RevenueCat customer portal.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SUBSCRIPTION OFFERING CARD */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Plan Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-teal-950/40 border border-teal-500/30 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SupporterBadge size="sm" />
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
                    Monthly Pass
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">AquaRise Supporter</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous funding for cleaner lakes, rivers, and coastal shores.
                  </p>
                </div>

                <div className="py-4 border-y border-teal-900/50 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {formattedPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/ month</span>
                </div>

                {/* Benefits */}
                <div className="space-y-2.5 text-xs">
                  <div className="text-slate-300 font-bold mb-2">Supporter Benefits:</div>
                  {[
                    'Special AquaRise Supporter badge displayed on your profile',
                    'Direct sponsorship of clean-up bags, gloves & safety kits',
                    'Digital Supporter recognition certificate',
                    'Priority notifications for community cleanup initiatives',
                    'Cancel anytime with one click in the subscriber portal'
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-slate-300">
                      <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {!user && (
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 text-[11px] text-sky-200 flex items-center justify-between mb-2">
                    <span>Sign in to link this subscription to your AquaRise profile:</span>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="font-extrabold underline text-white hover:text-sky-300 cursor-pointer ml-2"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={actionLoading || loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-400 via-sky-400 to-teal-500 hover:from-teal-300 hover:to-sky-400 text-ocean-950 font-black text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {actionLoading
                      ? 'Processing Checkout...'
                      : `Subscribe for ${formattedPrice}/mo`}
                  </span>
                </button>

                {/* Web Paywall Button if offering has paywall */}
                {currentOffering?.hasPaywall && (
                  <button
                    type="button"
                    onClick={handleOpenPaywall}
                    disabled={actionLoading || loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-teal-300/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>View RevenueCat Web Paywall</span>
                  </button>
                )}
              </div>
            </div>

            {/* Impact & Transparency Column */}
            <div className="flex flex-col justify-between space-y-6">
              
              {/* Badge Preview Showcase */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-teal-300">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>SUPPORTER BADGE SHOWCASE</span>
                </div>
                <p className="text-xs text-slate-300">
                  When you become a supporter, your badge appears next to your name on cleanup leaderboards, community missions, and on your profile:
                </p>
                
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center justify-center font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-xs">
                        {user?.email?.split('@')[0] || 'WaterGuardian_Demo'}
                      </div>
                      <div className="text-[10px] text-slate-400">Community Volunteer</div>
                    </div>
                  </div>
                  <SupporterBadge size="sm" />
                </div>
              </div>

              {/* Free Guarantee Notice */}
              <div className="p-6 rounded-3xl bg-teal-950/30 border border-teal-800/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-teal-300">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>AQUARISE FREE PROMISE</span>
                </div>
                <h4 className="text-base font-black text-white">All Core Features Are 100% Free</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every community cleanup mission, waterbody pollution report, explorer map, and guardian
                  certification will <strong>always be free</strong> for everyone. Subscriptions are purely
                  optional for those who wish to directly fund grassroots cleanup equipment and operations.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
