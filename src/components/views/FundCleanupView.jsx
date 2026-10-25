import React, { useState, useEffect } from 'react';
import {
  Heart,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Package,
  Wrench,
  Truck,
  Droplets,
  AlertTriangle,
  Info,
  ArrowDown,
  ArrowLeft,
  Users,
  Sparkles,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import DonorboxWidget from '../common/DonorboxWidget';

const CAMPAIGN_URL = 'https://donorbox.org/aquarise-x-al-musa-charity-uganda-cleanup';

export default function FundCleanupView({ onNavigateHome, onToast }) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Dynamic social sharing & SEO document title / description
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Fund a Cleanup in Uganda — AquaRise × Al Musa Charity';

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';

    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Support community cleanup missions in Uganda with AquaRise and Al Musa Charity. Help remove plastic waste, protect freshwater resources, and equip local volunteers.'
      );
    }

    return () => {
      document.title = previousTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
    };
  }, []);

  const getPublicShareUrl = () => {
    if (typeof window === 'undefined') return 'https://aquarise.org/donate';
    return `${window.location.origin}/donate`;
  };

  const handleCopyLink = () => {
    const url = getPublicShareUrl();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      if (onToast) onToast('Donation link copied to clipboard!', 'success');
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(getPublicShareUrl());
    const text = encodeURIComponent(
      'Join me in funding vital community waterbody cleanups in Uganda with AquaRise & Al Musa Charity! Every dollar equips local volunteers with safety gear and collection tools: '
    );
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getPublicShareUrl());
    const text = encodeURIComponent(
      'Support community water cleanup missions in Uganda with @AquaRise & Al Musa Charity! Help clear plastic waste from vulnerable waterways: '
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const scrollToForm = () => {
    const element = document.getElementById('donation-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const impactTiers = [
    {
      amount: '$15',
      title: 'Volunteer Safety Gear',
      desc: 'Suggested contribution to help support protective rubber boots and heavy-duty gloves for volunteers in the field.',
      icon: ShieldCheck,
      color: 'teal'
    },
    {
      amount: '$35',
      title: 'Collection Tools & Sacks',
      desc: 'Suggested contribution to help supply cleanup tools such as rakes and durable bags for clearing debris from drainage canals.',
      icon: Package,
      color: 'emerald'
    },
    {
      amount: '$75',
      title: 'Waste Hauling & Transport',
      desc: 'Suggested contribution to help cover transportation costs for hauling collected plastic waste to authorized disposal or recycling points.',
      icon: Truck,
      color: 'sky'
    },
    {
      amount: '$150+',
      title: 'Community Cleanup Mission',
      desc: 'Suggested contribution to support wider community cleanup operations, volunteer logistics, and environmental restoration efforts.',
      icon: Users,
      color: 'amber'
    }
  ];

  const faqs = [
    {
      question: 'Do I need an AquaRise account to donate?',
      answer:
        'No account is required! This donation experience is completely public and open to everyone worldwide. You can donate anonymously or with your name without signing up or creating an AquaRise profile.'
    },
    {
      question: 'How are donations processed and where does the money go?',
      answer:
        "Funds are collected through AquaRise's connected payment account and intended to be transferred to Al Musa Charity through Western Union. Payment processing and international transfer fees may apply. 100% of received campaign funds are deployed for volunteer cleanup equipment, safety gear, tools, and waste transportation."
    },
    {
      question: 'Is my donation tax-deductible?',
      answer:
        'AquaRise and Al Musa Charity make no claims regarding tax deductibility in your local jurisdiction. Contributions are direct grassroots sponsorships for on-the-ground volunteer environmental operations. Please consult your local tax advisor regarding charitable contribution rules.'
    },
    {
      question: 'What payment methods does Donorbox support?',
      answer:
        'Donorbox supports major credit and debit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay through secure PCI-DSS Level 1 certified processors.'
    },
    {
      question: 'What is Al Musa Charity?',
      answer:
        'Al Musa Charity is a community-based grassroots organization in Uganda focused on youth empowerment, local humanitarian support, and direct environmental cleanup initiatives across vulnerable water catchment basins and urban drainage corridors.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#071325] text-slate-100 selection:bg-teal-500/30">
      
      {/* Top Breadcrumb / Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-4">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to AquaRise Home</span>
          </button>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 sm:pb-24 pt-4">
        {/* Ambient Glow Flares */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/10 via-teal-500/15 to-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          {/* Collaboration Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-teal-500/20 border border-rose-400/30 text-rose-300 text-xs font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-sm">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
            <span>AquaRise × Al Musa Charity Collaboration • Uganda</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Fund a Community Cleanup in{' '}
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-teal-300 bg-clip-text text-transparent">
              Uganda
            </span>
          </h1>

          {/* Subtitle / Narrative */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Equip grassroots youth volunteers and community water caretakers in Uganda with heavy-duty boots,
            puncture-proof gloves, trash rakes, and waste transport to clear plastic pollution from vulnerable drainage
            canals and freshwater wetlands.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={scrollToForm}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-teal-400 hover:from-rose-400 hover:to-teal-300 text-ocean-950 font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center gap-2.5 transform active:scale-95"
            >
              <Heart className="w-5 h-5 text-rose-950 fill-rose-950" />
              <span>Donate Now</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-teal-300/30 transition-all cursor-pointer flex items-center gap-2 backdrop-blur-sm"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-teal-300" />
                  <span>Share Campaign</span>
                </>
              )}
            </button>
          </div>

          {/* Key Trust Signals Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
              <span className="font-black text-white text-sm sm:text-base text-teal-300">100%</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Grassroots Volunteer Gear</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
              <span className="font-black text-white text-sm sm:text-base text-amber-300">Public</span>
              <span className="text-[11px] text-slate-400 mt-0.5">No Account Required</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
              <span className="font-black text-white text-sm sm:text-base text-rose-300">Direct</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Western Union Transfer</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
              <span className="font-black text-white text-sm sm:text-base text-emerald-300">Verified</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Donorbox Secure Checkout</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Grid: Story & Impact + Embedded Donation Form */}
      <section id="donation-form-section" className="py-12 border-t border-slate-800/80 bg-[#06101F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Environmental Crisis, Action in Uganda, & Transparency */}
            <div className="lg:col-span-6 space-y-10">
              
              {/* Mission Narrative Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-teal-500/20 shadow-xl space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-teal-400 uppercase tracking-wider">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <span>The Environmental Challenge in Uganda</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Protecting Local Catchments from Plastic Flooding
                  </h2>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-medium">
                  <p>
                    Across Ugandan urban centers and peri-urban settlements, open drainage canals and streams serve as the
                    lifeline draining rainwater toward Lake Victoria and regional river basins. Without municipal waste
                    hauling infrastructure in many districts, discarded plastic bottles, single-use bags, and packaging
                    accumulate rapidly in these channels.
                  </p>
                  <p>
                    During seasonal downpours, choked drainage channels cause destructive flash floods, carrying wastewater
                    into homes and washing tons of microplastics into freshwater ecosystems that millions depend upon for
                    daily drinking water and fishing.
                  </p>
                </div>

                {/* What Al Musa Charity Does */}
                <div className="p-5 rounded-2xl bg-[#071F2C] border border-teal-600/30 space-y-3">
                  <div className="flex items-center gap-2 font-black text-sm text-white">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Al Musa Charity On-The-Ground Action</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Al Musa Charity mobilizes local Ugandan youth, students, and community volunteers to conduct rigorous
                    physical cleanup campaigns. Volunteers enter blocked channels with rakes and sacks to manually remove
                    tons of plastic waste before it reaches deeper river tributaries.
                  </p>
                </div>
              </div>

              {/* Suggested Contribution Amounts */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-lg font-black text-white">Suggested Contribution Levels</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Amounts shown are suggested contribution levels to illustrate how community donations help support volunteer gear, collection tools, and waste transport in Uganda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {impactTiers.map((tier, idx) => {
                    const Icon = tier.icon;
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-colors space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-amber-300">{tier.amount}</span>
                          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-300">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <h4 className="font-extrabold text-white text-xs sm:text-sm">{tier.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{tier.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mandatory Transparency & Fund Flow Notice */}
              <div className="p-6 rounded-3xl bg-slate-950/90 border border-amber-400/40 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>TRANSPARENCY & FUND FLOW DETAILS</span>
                </div>

                <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p className="font-medium text-amber-100 bg-amber-500/10 p-3 rounded-xl border border-amber-400/20">
                    <strong>Important Fund Transfer Notice:</strong> Funds are collected through AquaRise's connected
                    payment account and intended to be transferred to Al Musa Charity through Western Union. Payment
                    processing and international transfer fees may apply.
                  </p>

                  <p className="text-[11px] text-slate-400">
                    <strong>Tax Deductibility Clarification:</strong> Please note that AquaRise and Al Musa Charity make no
                    unsupported claims regarding tax deductibility of contributions in your country or jurisdiction. All
                    funds directly finance grassroots volunteer field supplies (gumboots, gloves, trash sacks, and transport)
                    for physical environmental restoration.
                  </p>

                  <p className="text-[11px] text-slate-400">
                    <strong>Payment Processing:</strong> Transactions are securely handled by Donorbox and certified
                    payment processors. AquaRise does not store or process payment card information directly.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Verified Campaign Slug:</span>
                  <a
                    href={CAMPAIGN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <span>aquarise-x-al-musa-charity-uganda-cleanup</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Embedded Donorbox Donation Widget */}
            <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
              
              <div className="text-center sm:text-left space-y-1">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Direct Contribution</span>
                <h3 className="text-2xl font-black text-white">Choose Your Donation Amount</h3>
                <p className="text-xs text-slate-400">
                  Select a one-time gift or monthly support. Every contribution directly equips a volunteer in the field.
                </p>
              </div>

              {/* Donorbox Widget Mount */}
              <DonorboxWidget />

              {/* Direct External Link Fallback Box */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2 text-xs">
                <p className="text-slate-400">
                  Prefer donating in a separate window or having browser issues?
                </p>
                <a
                  href={CAMPAIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-extrabold text-xs border border-teal-500/30 transition-all cursor-pointer"
                >
                  <span>Open Official Campaign Page on Donorbox</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Public Social Sharing Section */}
      <section className="py-16 border-t border-slate-800 bg-[#071325]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-extrabold uppercase tracking-wider">
            <Share2 className="w-3.5 h-3.5" />
            <span>Multiply Your Impact</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white">
            Share this Campaign with Your Community
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Sharing takes only 5 seconds and directly puts cleanup tools in the hands of Ugandan volunteers. Share this
            public link on WhatsApp, Instagram bio, TikTok, or Twitter/X:
          </p>

          {/* Shareable URL Bar with Copy Button */}
          <div className="max-w-lg mx-auto flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-inner">
            <input
              type="text"
              readOnly
              value={getPublicShareUrl()}
              className="bg-transparent px-3 py-2 text-xs font-mono text-teal-300 w-full focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-ocean-950 font-black text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Social Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleShareTwitter}
              className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Post on X (Twitter)</span>
            </button>

            <a
              href="https://www.instagram.com/aqua_riseapp/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Tag @aqua_riseapp</span>
            </a>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-slate-800 bg-[#06101F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-teal-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-teal-400" />
              <span>Questions & Answers</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-extrabold text-white hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-300' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
