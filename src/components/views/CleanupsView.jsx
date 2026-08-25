import React, { useState, useEffect, useMemo } from 'react';
import { Flag, Calendar, Users, MapPin, ArrowRight, PlusCircle, Compass, Search, ExternalLink, Loader2, RefreshCw, Bookmark, CheckCircle2, ArrowLeft } from 'lucide-react';
import { discoveryService } from '../../services/discoveryService';
import { verifyExternalEventEvidence } from '../../services/sourceVerificationLayer';
import { isCleanupParticipating, joinOrSaveCleanup, leaveOrRemoveCleanup } from '../../services/participationService';
import { getCleanupDateStatus, formatCleanupDate, formatCleanupStartTime, getSearchableText, deduplicateCleanups } from '../../utils/cleanupUtils.js';
import { CURATED_VERIFIED_EXTERNAL_EVENTS } from '../../data/curatedVerifiedEvents.js';

export default function CleanupsView({
  waterbodies = [],
  missions = [],
  joinedMissionIds = [],
  onViewMission,
  onNavigateExplore,
  onCreateCleanup,
  onBecomeGuardian,
  onToast
}) {
  // Default to showing Upcoming opportunities (Requirement #6)
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [organizerFilter, setOrganizerFilter] = useState('All');
  const [participationTick, setParticipationTick] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  // Live Discovery State for External Cleanup Events
  const [liveDiscoveredEvents, setLiveDiscoveredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);

  useEffect(() => {
    const handleParticipationChange = () => setParticipationTick(prev => prev + 1);
    window.addEventListener('aquarise_participation_changed', handleParticipationChange);
    return () => window.removeEventListener('aquarise_participation_changed', handleParticipationChange);
  }, []);

  // Fetch live external cleanup opportunities using cleanup-intent queries
  const fetchLiveCleanupOpportunities = async () => {
    setIsLoading(true);
    setDiscoveryError(null);

    try {
      const locationOrIntent = searchQuery.trim() || 'beach river waterway';
      const fullQuery = `${locationOrIntent} cleanup volunteer`.trim();

      const response = await discoveryService.search(fullQuery, { type: 'cleanup' });

      if (response.error) {
        setDiscoveryError("We couldn't load external cleanup opportunities right now. Your AquaRise community missions are still available.");
        setLiveDiscoveredEvents([]);
      } else {
        const rawResults = response.results || [];
        
        const verifiedEvents = [];
        rawResults.forEach((item) => {
          if (item.cleanupEvent && verifyExternalEventEvidence(item.cleanupEvent) && !item.cleanupEvent.isDemoEvent) {
            verifiedEvents.push({
              id: item.cleanupEvent.id || `live-evt-${item.id}`,
              title: item.cleanupEvent.title,
              waterbodyName: item.waterbodyName || item.name,
              country: item.country,
              city: item.city,
              region: item.region,
              location: item.location || `${item.city || ''}, ${item.country || ''}`,
              meetingLocation: item.cleanupEvent.location || item.location,
              date: item.cleanupEvent.date,
              statusText: item.cleanupEvent.statusText || `Upcoming • ${item.cleanupEvent.date}`,
              time: 'TBD',
              duration: '3 hours',
              organizer: item.cleanupEvent.organizer || item.cleanupEvent.organization || 'External Organization',
              organizerType: 'External Organization',
              description: item.cleanupEvent.description || item.environmentalSummary,
              suppliesNeeded: ['Gloves', 'Trash bags'],
              volunteerCapacity: 50,
              participantCount: 0,
              cleanupGoal: 'Environmental debris clearance',
              safetyNotes: 'Follow local volunteer guidelines.',
              status: 'Upcoming',
              cleanupStatus: 'External Organization Event',
              isCommunityOrganized: false,
              isLiveSourced: true,
              eventUrl: item.cleanupEvent.eventUrl || item.sourceUrl,
              sourceUrl: item.cleanupEvent.sourceUrl || item.eventUrl,
              image: item.image
            });
          }
        });

        setLiveDiscoveredEvents(verifiedEvents);
      }
    } catch (err) {
      setDiscoveryError("We couldn't load external cleanup opportunities right now. Your AquaRise community missions are still available.");
      setLiveDiscoveredEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveCleanupOpportunities();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combine curated verified external events, user-created community missions, and live Tavily events with canonical deduplication (Requirement #1)
  const allMissionsList = useMemo(() => {
    const rawCombined = [
      ...CURATED_VERIFIED_EXTERNAL_EVENTS,
      ...missions.filter((m) => m && !m.isDemoEvent && !String(m.title || m.name || '').includes('(Demo)')),
      ...liveDiscoveredEvents
    ];
    return deduplicateCleanups(rawCombined);
  }, [missions, liveDiscoveredEvents]);

  // Dynamic Date Categorization Helper (Requirement #6)
  const isUpcoming = (m) => {
    if (!m || !m.date) return true;
    if (/^\d{4}-\d{2}-\d{2}/.test(m.date)) {
      return m.date >= todayStr;
    }
    return m.status !== 'Past' && m.status !== 'Completed';
  };  // Verified Filter Helper (Section 4 & Test D, K)
  const isVerifiedItem = (m) => {
    if (!m) return false;
    if (m.isLiveSourced || m.type === 'external' || m.organizerType === 'External Organization') {
      return verifyExternalEventEvidence(m);
    }
    return m.verificationStatus === 'verified' || m.status === 'Verified Complete';
  };

  const allVerifiedList = useMemo(() => {
    return allMissionsList.filter(isVerifiedItem);
  }, [allMissionsList]);

  // Faceted Filtering (Section 1 & 2: Normalized multi-term location & text search)
  const filteredMissions = useMemo(() => {
    return allMissionsList.filter((m) => {
      const normalizeQuery = (str) =>
        String(str || '')
          .toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const queryTerms = normalizeQuery(searchQuery).split(/\s+/).filter(Boolean);
      const searchableText = getSearchableText(m);

      const matchesSearch = queryTerms.length === 0 || queryTerms.every((term) => searchableText.includes(term));

      const matchesOrg = organizerFilter === 'All' || m.organizerType?.includes(organizerFilter);

      let matchesTab = true;
      if (activeFilter === 'upcoming') {
        matchesTab = isUpcoming(m);
      } else if (activeFilter === 'all') {
        matchesTab = isVerifiedItem(m);
      } else if (activeFilter === 'past') {
        matchesTab = !isUpcoming(m);
      } else if (activeFilter === 'aquarise') {
        matchesTab = (m.isUserCreated || m.cleanupStatus === 'AquaRise Mission' || m.organizerType === 'AquaRise Guardian') && isUpcoming(m);
      } else if (activeFilter === 'joined') {
        matchesTab = isCleanupParticipating(m) || joinedMissionIds.includes(m.id);
      }

      return matchesSearch && matchesOrg && matchesTab;
    });
  }, [allMissionsList, searchQuery, organizerFilter, activeFilter, joinedMissionIds, participationTick, todayStr]);

  const handleCardToggleSave = (e, mission) => {
    e.stopPropagation();
    const isSaved = isCleanupParticipating(mission);
    if (isSaved) {
      const res = leaveOrRemoveCleanup(mission);
      if (onToast) onToast(res.message, 'success');
    } else {
      const res = joinOrSaveCleanup(mission);
      if (onToast) onToast(res.message, 'success');
    }
  };

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* View Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#35AEAC]/20 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-white px-3.5 py-1 rounded-full border border-[#92F1EC] inline-block shadow-sm">
              Verified Field Action Hub
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-ocean-950">
              Cleanup <span className="text-[#19887F]">Missions</span>
            </h1>

            <p className="text-slate-700 text-base font-medium">
              Discover genuine user-created community cleanups and verified external opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateCleanup}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create a Cleanup</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#92F1EC] shadow-md">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#19887F] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search cleanups by title, location (e.g. California), or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#DAF6F6]/40 border border-teal-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF] placeholder:text-slate-500 font-medium"
            />
          </div>

          {/* Tab Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'upcoming', label: 'Upcoming Opportunities' },
              { id: 'all', label: `All Verified (${allVerifiedList.length})` },
              { id: 'aquarise', label: 'AquaRise Community' },
              { id: 'past', label: 'Past Cleanups' },
              { id: 'joined', label: 'My Saved / Joined' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#19887F] text-white shadow-sm scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-teal-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* UI Loading State */}
        {isLoading && (
          <div className="bg-white p-8 rounded-3xl border border-[#92F1EC] text-center space-y-3 shadow-md animate-fadeIn">
            <Loader2 className="w-8 h-8 text-[#076DDF] animate-spin mx-auto" />
            <p className="text-base font-black text-ocean-950">Finding verified cleanup opportunities...</p>
            <p className="text-xs text-slate-600 font-medium">Querying live environmental sources and volunteer listings.</p>
          </div>
        )}

        {/* UI Error State */}
        {discoveryError && !isLoading && (
          <div className="bg-white p-8 rounded-3xl border border-[#92F1EC] text-center space-y-4 shadow-md animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center font-bold text-lg border border-amber-200">
              !
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-ocean-950">{discoveryError}</h3>
              <p className="text-xs text-slate-600 font-medium">Check your connection or try refining your search location.</p>
            </div>
            <button
              onClick={fetchLiveCleanupOpportunities}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#076DDF] text-white text-xs font-bold shadow-md hover:bg-[#3C92FF]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Missions Grid or Required Empty State */}
        {!isLoading && !discoveryError && (
          filteredMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMissions.map((mission) => {
                const isParticipating = isCleanupParticipating(mission);
                const isCommunity = Boolean(mission.isUserCreated || mission.cleanupStatus === 'AquaRise Mission' || mission.organizerType === 'AquaRise Guardian');
                const dateStatus = getCleanupDateStatus(mission);
                const isPastMission = dateStatus === 'Past';
                const isVerified = mission.verificationStatus === 'verified' || mission.status === 'Verified Complete';

                // Display Date & Start Time (Section 2)
                const formattedDateStr = formatCleanupDate(mission.date, true);
                const startTimeStr = formatCleanupStartTime(mission.startTime || mission.time);
                const displayDateTime = startTimeStr !== 'Time not provided' ? `${formattedDateStr} • ${startTimeStr}` : `${formattedDateStr} • Time not provided`;

                return (
                  <div
                    key={mission.id}
                    onClick={() => onViewMission(mission)}
                    className="rounded-3xl overflow-hidden bg-white border border-[#92F1EC] flex flex-col justify-between group shadow-md hover:border-[#35AEAC] cursor-pointer transition-all"
                  >
                    {/* Image Banner */}
                    <div className="relative h-48 overflow-hidden shrink-0">
                      <img
                        src={mission.image || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800'}
                        alt={mission.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                      {/* Top Badges (Section 3: Independent Date Status + Verification Status Badges) */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Date Status Badge */}
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-sm ${
                            dateStatus === 'Past' ? 'bg-slate-600' : dateStatus === 'Today' ? 'bg-amber-600' : 'bg-[#19887F]'
                          }`}>
                            {dateStatus}
                          </span>

                          {/* Verification Status Badge */}
                          {isCommunity && (
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-sm ${
                              isVerified ? 'bg-emerald-600' : 'bg-amber-700'
                            }`}>
                              {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </span>
                          )}
                        </div>

                        {isParticipating ? (
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            {isCommunity ? 'Joined ✓' : 'Saved ✓'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/95 text-ocean-950 border border-white backdrop-blur-md shadow-sm">
                            {isCommunity ? 'AquaRise Mission' : 'External Opportunity'}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs text-white font-bold truncate drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5 text-[#92F1EC] shrink-0" />
                        <span className="truncate">{mission.location}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white">
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-ocean-950 group-hover:text-[#076DDF] transition-colors line-clamp-1">
                          {mission.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {mission.description}
                        </p>
                      </div>

                      {/* Mission Schedule & Stats (Section 2) */}
                      <div className="p-3 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Date & Time</span>
                          <span className="font-bold text-ocean-950 flex items-center gap-1 text-[11px] truncate" title={displayDateTime}>
                            <Calendar className="w-3 h-3 text-[#076DDF] shrink-0" />
                            <span className="truncate">{displayDateTime}</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Organizer</span>
                          <span className="font-bold text-[#19887F] truncate block">
                            {mission.organizer || 'Organizer not provided'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button (Section 5: Past missions must NOT allow new joins) */}
                      <div className="pt-2 flex items-center justify-between border-t border-[#92F1EC]" onClick={(e) => e.stopPropagation()}>
                        {isPastMission && !isParticipating ? (
                          <button
                            type="button"
                            disabled
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                          >
                            <span>Event Ended</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleCardToggleSave(e, mission)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isParticipating
                                ? 'bg-teal-100 text-[#19887F] border border-[#92F1EC]'
                                : 'bg-slate-100 text-ocean-950 hover:bg-teal-50 border border-teal-200'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5 text-[#076DDF]" />
                            <span>{isParticipating ? (isCommunity ? 'Joined ✓' : 'Saved ✓') : (isCommunity ? 'Join' : 'Save')}</span>
                          </button>
                        )}

                        {mission.eventUrl && mission.eventUrl !== '#' ? (
                          <a
                            href={mission.eventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#076DDF] hover:bg-[#3C92FF] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <span>Official Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onViewMission(mission)}
                            className="bg-[#076DDF] hover:bg-[#3C92FF] text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* REQUIRED HONEST EMPTY STATE */
            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#92F1EC] space-y-6 max-w-2xl mx-auto shadow-md animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-[#92F1EC] text-[#19887F] mx-auto flex items-center justify-center">
                <Flag className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-ocean-950">
                  {activeFilter === 'aquarise'
                    ? 'No AquaRise community missions yet'
                    : activeFilter === 'upcoming'
                    ? 'No upcoming cleanups found'
                    : 'No cleanups match your search'}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto font-medium">
                  {activeFilter === 'aquarise'
                    ? 'No community cleanup has been created here yet. Become a Guardian and organize the first one.'
                    : 'Search for another waterbody or organize a new cleanup mission.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={onCreateCleanup}
                  className="px-6 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Create a Cleanup</span>
                </button>

                <button
                  onClick={onNavigateExplore}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 text-xs font-bold border border-teal-200 flex items-center gap-2 transition-all"
                >
                  <Compass className="w-4 h-4 text-[#19887F]" />
                  <span>Explore External Opportunities</span>
                </button>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}
