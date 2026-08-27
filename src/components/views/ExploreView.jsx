import React, { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Clock, Globe, ExternalLink, Compass, X, Info, Sparkles, Filter, AlertTriangle, ArrowRight, ShieldCheck, Waves, Flag, CheckCircle2 } from 'lucide-react';
import { FEATURED_EXTERNAL_CLEANUPS, DISCOVERY_WATERS_NEEDING_ATTENTION } from '../../data/featuredCleanups';
import { CURATED_VERIFIED_EXTERNAL_EVENTS } from '../../data/curatedVerifiedEvents';
import { getSearchableText, getCleanupDateStatus, deduplicateCleanups } from '../../utils/cleanupUtils';

export default function ExploreView({
  missions = [],
  reports = [],
  onViewDetails,
  onViewMission,
  onViewReport,
  onProposeCleanup,
  onReportPollution
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCleanupModal, setSelectedCleanupModal] = useState(null);

  // 1. Combine external verified events and published community missions with canonical deduplication (Section 1)
  const allDiscoverableCleanups = useMemo(() => {
    const rawItems = [];

    // Add curated verified external events first
    CURATED_VERIFIED_EXTERNAL_EVENTS.forEach((item) => {
      if (item && item.id) {
        rawItems.push({
          ...item,
          sourceKind: 'external',
          badgeText: 'External Opportunity'
        });
      }
    });

    // Add featured external cleanups from discovery data
    FEATURED_EXTERNAL_CLEANUPS.forEach((item) => {
      if (item && item.id) {
        rawItems.push({
          ...item,
          organizer: item.organization || item.organizer || 'External Organization',
          sourceUrl: item.sourceUrl || item.eventUrl,
          sourceKind: 'external',
          badgeText: 'External Opportunity'
        });
      }
    });

    // Add genuine user-created AquaRise community missions
    if (Array.isArray(missions)) {
      missions.forEach((m) => {
        if (m && m.id && !m.isDemoEvent && !String(m.title || m.name || '').includes('(Demo)')) {
          rawItems.push({
            ...m,
            sourceKind: 'community',
            badgeText: 'AquaRise Mission'
          });
        }
      });
    }

    return deduplicateCleanups(rawItems);
  }, [missions]);

  // 2. Multi-term accent-insensitive filtering across both sources (Section 4, 5, 6, 7, 8, 9, 10, 11)
  const filteredCleanups = useMemo(() => {
    const normalizeStr = (str) =>
      String(str || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const queryTerms = normalizeStr(searchQuery).split(/\s+/).filter(Boolean);

    const matches = allDiscoverableCleanups.filter((item) => {
      // Multi-field searchable text
      const itemSearchText = getSearchableText(item);
      const matchesSearch =
        queryTerms.length === 0 ||
        queryTerms.every((term) => itemSearchText.includes(term));

      // Category / Tab Filtering
      let matchesCategory = true;
      const cat = selectedCategory;

      if (cat === 'Upcoming') {
        const dateStatus = getCleanupDateStatus(item);
        matchesCategory = dateStatus === 'Upcoming' || dateStatus === 'Today';
      } else if (cat === 'Beaches') {
        const text = itemSearchText;
        const tags = (item.tags || []).map(normalizeStr);
        matchesCategory =
          text.includes('beach') ||
          text.includes('coast') ||
          text.includes('coastal') ||
          text.includes('shoreline') ||
          tags.some((t) => t.includes('beach') || t.includes('coast'));
      } else if (cat === 'Rivers & Waterways') {
        const text = itemSearchText;
        const tags = (item.tags || []).map(normalizeStr);
        matchesCategory =
          text.includes('river') ||
          text.includes('lake') ||
          text.includes('stream') ||
          text.includes('waterway') ||
          text.includes('wetland') ||
          text.includes('estuary') ||
          text.includes('creek') ||
          text.includes('pond') ||
          tags.some((t) => t.includes('river') || t.includes('waterway'));
      } else if (cat === 'Global Events') {
        // Global events are external-focused with worldwide scope
        const text = itemSearchText;
        matchesCategory =
          item.sourceKind === 'external' &&
          (text.includes('worldwide') ||
            text.includes('global') ||
            item.location === 'Worldwide' ||
            item.country === 'Worldwide');
      } else if (cat === 'AquaRise Community') {
        matchesCategory = item.sourceKind === 'community';
      }

      return matchesSearch && matchesCategory;
    });

    // Required Debug Logging (Section 21)
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      const commLoaded = allDiscoverableCleanups.filter((i) => i.sourceKind === 'community').length;
      const extLoaded = allDiscoverableCleanups.filter((i) => i.sourceKind === 'external').length;
      const commMatches = matches.filter((i) => i.sourceKind === 'community').length;
      const extMatches = matches.filter((i) => i.sourceKind === 'external').length;

      console.log(`[AquaRise Explore Debug]`, {
        'Explore community missions loaded': commLoaded,
        'Explore external events loaded': extLoaded,
        'Combined discoverable items': allDiscoverableCleanups.length,
        'Search query': searchQuery,
        'Selected category': selectedCategory,
        'Matching community missions': commMatches,
        'Matching external events': extMatches
      });
    }

    return matches;
  }, [allDiscoverableCleanups, searchQuery, selectedCategory]);

  const handleOpenSource = (e, url) => {
    e.stopPropagation();
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Dynamic Section Heading (Section 12 & 13)
  const getSectionTitle = () => {
    switch (selectedCategory) {
      case 'Global Events':
        return {
          title: 'Verified External Cleanups',
          subtitle: 'Live international cleanups hosted by verified environmental organizations.',
          badgeSuffix: 'Sourced Opportunities'
        };
      case 'AquaRise Community':
        return {
          title: 'AquaRise Community Missions',
          subtitle: 'Volunteer cleanup missions organized by AquaRise Guardians around the world.',
          badgeSuffix: 'Community Missions'
        };
      case 'Beaches':
        return {
          title: 'Coastal & Beach Cleanups',
          subtitle: 'Shoreline and beach restoration projects from external and community partners.',
          badgeSuffix: 'Beach Cleanups'
        };
      case 'Rivers & Waterways':
        return {
          title: 'River & Waterway Cleanups',
          subtitle: 'Creek, riverbank, lake, and wetland cleanup initiatives.',
          badgeSuffix: 'Waterway Projects'
        };
      case 'Upcoming':
        return {
          title: 'Upcoming Cleanups',
          subtitle: 'Active and upcoming cleanup opportunities scheduled soon.',
          badgeSuffix: 'Upcoming Events'
        };
      case 'All':
      default:
        return {
          title: 'Cleanup Opportunities',
          subtitle: 'Explore verified external opportunities and AquaRise community missions.',
          badgeSuffix: 'Opportunities'
        };
    }
  };

  const sectionMeta = getSectionTitle();

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
        
        {/* 1. HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#19887F] text-xs font-black uppercase tracking-wider shadow-sm border border-[#92F1EC]">
            <Waves className="w-4 h-4 text-[#35AEAC]" />
            <span>Global Water Action Network</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#042F2E] font-normal tracking-tight">
            Explore <span className="text-[#0D9488] italic font-normal">Cleanup Opportunities</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
            Discover real cleanup efforts around the world and find a way to help protect our waters.
          </p>
        </div>

        {/* 2. SEARCH & CATEGORY CHIPS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#92F1EC] space-y-6 shadow-md">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#19887F] absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by city, country, waterbody, organization, or cleanup..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#DAF6F6]/40 border border-teal-200 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] focus:bg-white placeholder:text-slate-500 font-medium transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-ocean-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-[#19887F] uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#35AEAC]" />
              Filters:
            </span>
            {['All', 'Upcoming', 'Beaches', 'Rivers & Waterways', 'Global Events', 'AquaRise Community'].map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-[#19887F] text-white shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-teal-100'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. DISCOVERABLE CLEANUPS GRID */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#35AEAC]/20 pb-4">
            <div>
              <h2 className="text-2xl font-black text-ocean-950 flex items-center gap-2.5">
                <span>{sectionMeta.title}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#19887F]/10 text-[#19887F] border border-[#19887F]/20">
                  {filteredCleanups.length} {sectionMeta.badgeSuffix}
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {sectionMeta.subtitle}
              </p>
            </div>
          </div>

          {filteredCleanups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCleanups.map((item) => {
                const isCommunity = item.sourceKind === 'community' || item.isUserCreated || item.cleanupStatus === 'AquaRise Mission';
                const dateStatus = getCleanupDateStatus(item);
                const verificationStatus = item.verificationStatus || 'unverified';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isCommunity && onViewMission) {
                        onViewMission(item);
                      } else {
                        setSelectedCleanupModal(item);
                      }
                    }}
                    className="rounded-3xl overflow-hidden p-6 flex flex-col justify-between bg-white border border-[#92F1EC] shadow-md hover:border-[#35AEAC] transition-all cursor-pointer group"
                  >
                    <div className="space-y-4">
                      {/* Top Badges Bar (Section 2 & 16) */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-extrabold uppercase px-2.5 py-0.5 rounded-full border text-[10px] ${
                            isCommunity
                              ? 'bg-teal-50 text-[#19887F] border-teal-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {isCommunity ? 'AQUARISE MISSION' : 'EXTERNAL OPPORTUNITY'}
                          </span>

                          {/* Verification Badge for Community Missions */}
                          {isCommunity && (
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              verificationStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : verificationStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}>
                              {verificationStatus === 'verified' ? 'VERIFIED' : verificationStatus === 'pending' ? 'PENDING' : 'UNVERIFIED'}
                            </span>
                          )}
                        </div>

                        <span className="text-slate-500 font-semibold text-[11px] shrink-0">{item.date}</span>
                      </div>

                      {/* Image Header */}
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={item.bannerPhoto || item.image}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-xs font-bold text-white truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#92F1EC] shrink-0" />
                          <span className="truncate">
                            {item.city ? `${item.city}, ${item.country}` : item.location || item.country || 'Geotagged Location'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-ocean-950 group-hover:text-[#076DDF] transition-colors leading-snug">
                          {item.title || item.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#19887F]" />
                          <span>{item.organizer || item.organization || 'AquaRise Guardian'}</span>
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal pt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 mt-4 border-t border-[#92F1EC]">
                      {/* Tags */}
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#19887F] border border-teal-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {isCommunity ? 'AquaRise Field Action' : 'Official Sourced Opportunity'}
                        </span>

                        {!isCommunity && item.sourceUrl && item.sourceUrl !== '#' ? (
                          <button
                            type="button"
                            onClick={(e) => handleOpenSource(e, item.sourceUrl)}
                            className="bg-[#076DDF] hover:bg-[#3C92FF] text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <span>View Official Event</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewMission) onViewMission(item);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-ocean-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-teal-200 transition-all cursor-pointer"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#076DDF]" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#92F1EC] space-y-4 shadow-sm">
              <Compass className="w-12 h-12 text-[#35AEAC] mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-ocean-950">No cleanups match your current filter</h3>
              <p className="text-xs text-slate-600 font-medium">Try adjusting your search terms or category chips.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-5 py-2.5 rounded-xl bg-[#076DDF] text-white font-bold text-xs hover:bg-[#3C92FF] transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* 4. AQUARISE DISCOVERY CONCEPT: "Waters that need our attention" */}
        <div className="pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#35AEAC]/20 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#19887F] bg-white px-3 py-1 rounded-full mb-2 border border-[#92F1EC] shadow-sm">
                <Compass className="w-3.5 h-3.5 text-[#35AEAC]" />
                AquaRise Waterbody Discovery Concept
              </div>
              <h2 className="text-2xl font-black text-ocean-950">
                Waters that need our attention
              </h2>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                Discover endangered waterbodies, understand their pollution burden, and find an existing cleanup or organize a new mission.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DISCOVERY_WATERS_NEEDING_ATTENTION.map((waterbody) => (
              <div
                key={waterbody.id}
                className="rounded-3xl overflow-hidden p-6 flex flex-col justify-between bg-white border border-[#92F1EC] shadow-md hover:border-[#35AEAC] transition-all"
              >
                <div className="space-y-4">
                  {/* Visual Area */}
                  <div className="relative h-36 rounded-2xl overflow-hidden">
                    <img
                      src={waterbody.image}
                      alt={waterbody.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Status Chip */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#19887F] text-white shadow">
                        No Verified Cleanup Listed
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 text-xs font-bold text-white flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#92F1EC]" />
                      <span>{waterbody.location}</span>
                    </div>
                  </div>

                  {/* Waterbody Details */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#19887F] tracking-wider block">
                      {waterbody.type}
                    </span>
                    <h3 className="text-base font-black text-ocean-950">{waterbody.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-normal">
                      {waterbody.concern}
                    </p>
                  </div>
                </div>

                {/* Status Relationship Banner & Functional CTAs */}
                <div className="space-y-3 pt-4 mt-4 border-t border-[#92F1EC]">
                  
                  {/* Clickable relationship button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onProposeCleanup) {
                        onProposeCleanup({
                          waterbodyName: waterbody.name,
                          country: waterbody.country || 'Indonesia',
                          location: waterbody.location,
                          city: waterbody.city,
                          region: waterbody.region
                        });
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-[#92F1EC] text-[11px] font-bold text-[#19887F] flex items-center justify-between transition-colors text-left cursor-pointer"
                  >
                    <span>No cleanup listed yet → Organize one</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#076DDF] shrink-0" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onProposeCleanup) {
                          onProposeCleanup({
                            waterbodyName: waterbody.name,
                            country: waterbody.country || 'Indonesia',
                            location: waterbody.location,
                            city: waterbody.city,
                            region: waterbody.region
                          });
                        }
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5 text-white" />
                      <span>Organize Cleanup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(waterbody.name);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs border border-teal-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-[#19887F]" />
                      <span>Explore</span>
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 5. INTERACTIVE EVENT DETAIL MODAL */}
        {selectedCleanupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#92F1EC] p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-ocean-950">
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCleanupModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-ocean-950 border border-teal-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-3 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-teal-50 text-[#19887F] border border-teal-200">
                    {selectedCleanupModal.badge || 'EXTERNAL OPPORTUNITY'}
                  </span>
                  {selectedCleanupModal.category && (
                    <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#076DDF] text-white">
                      {selectedCleanupModal.category}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-ocean-950">
                  {selectedCleanupModal.title || selectedCleanupModal.name}
                </h2>

                <p className="text-xs text-[#19887F] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#19887F]" />
                  <span>Organized by {selectedCleanupModal.organizer || selectedCleanupModal.organization}</span>
                </p>
              </div>

              {/* Image Banner */}
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={selectedCleanupModal.image || selectedCleanupModal.bannerPhoto || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800'}
                  alt={selectedCleanupModal.title || selectedCleanupModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#92F1EC]" />
                  <span>{selectedCleanupModal.location}</span>
                </div>
              </div>

              {/* Event Schedule Info */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-teal-200 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">Event Date</span>
                  <strong className="text-ocean-950 font-bold flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#076DDF]" />
                    {selectedCleanupModal.date}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold font-mono">Start Time</span>
                  <strong className="text-ocean-950 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#19887F]" />
                    {selectedCleanupModal.startTime || selectedCleanupModal.time || '10:00 AM'}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ocean-950 uppercase tracking-wider">About This Opportunity</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {selectedCleanupModal.description}
                </p>
              </div>

              {/* External Registration Notice */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-[#19887F]">External Registration Notice</p>
                <p>Registration for this cleanup is handled directly by the official organizer ({selectedCleanupModal.organizer || selectedCleanupModal.organization}). AquaRise helps you discover and track verified opportunities.</p>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCleanupModal(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-teal-200 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close Window
                </button>

                <button
                  type="button"
                  onClick={(e) => handleOpenSource(e, selectedCleanupModal.sourceUrl || selectedCleanupModal.eventUrl)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>View Official Event</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
