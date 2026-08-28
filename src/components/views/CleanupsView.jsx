import React, { useState, useEffect, useMemo } from 'react';
import { Flag, Calendar, Users, MapPin, ArrowRight, PlusCircle, Compass, Search, ExternalLink, Loader2, RefreshCw, Bookmark, CheckCircle2, ArrowLeft, Droplets } from 'lucide-react';
import { discoveryService } from '../../services/discoveryService';
import { verifyExternalEventEvidence } from '../../services/sourceVerificationLayer';
import { isCleanupParticipating, joinOrSaveCleanup, leaveOrRemoveCleanup } from '../../services/participationService';
import { getCleanupDateStatus, formatCleanupDate, formatCleanupStartTime, getSearchableText, deduplicateCleanups } from '../../utils/cleanupUtils.js';
import { CURATED_VERIFIED_EXTERNAL_EVENTS } from '../../data/curatedVerifiedEvents.js';

function CleanupCardBanner({ mission, isCommunity, isJoined }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = mission.bannerPhoto || mission.image || mission.bannerImage;

  return (
    <div className="relative h-48 w-full overflow-hidden bg-teal-50">
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={mission.title || mission.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#19887F] via-[#35AEAC] to-[#076DDF] p-6 text-white flex flex-col items-center justify-center text-center space-y-2 group-hover:scale-105 transition-transform duration-300">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-sm">
            <Droplets className="w-6 h-6" />
          </div>
          <span className="text-xs font-black line-clamp-1 opacity-90 px-4">
            {mission.waterbodyName || mission.title || mission.name}
          </span>
        </div>
      )}

      <div className="absolute top-3 left-3">
        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full text-white shadow-sm ${
          isCommunity ? 'bg-[#19887F]' : 'bg-[#076DDF]'
        }`}>
          {isCommunity ? 'AquaRise Mission' : 'External Opportunity'}
        </span>
      </div>

      {isJoined && (
        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-white" />
          <span>Joined</span>
        </div>
      )}
    </div>
  );
}

export default function CleanupsView({
  waterbodies = [],
  missions = [],
  joinedMissionIds = [],
  user,
  profile,
  onViewMission,
  onJoinMission,
  onLeaveMission,
  onNavigateExplore,
  onCreateCleanup,
  onBecomeGuardian,
  onOpenAuth,
  onToast
}) {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [organizerFilter, setOrganizerFilter] = useState('All');
  const [participationTick, setParticipationTick] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  const [liveDiscoveredEvents, setLiveDiscoveredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);

  useEffect(() => {
    const handleParticipationChange = () => setParticipationTick(prev => prev + 1);
    window.addEventListener('aquarise_participation_changed', handleParticipationChange);
    return () => window.removeEventListener('aquarise_participation_changed', handleParticipationChange);
  }, []);

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
    fetchLiveCleanupOpportunities();
  }, []);

  const allMissionsList = useMemo(() => {
    const combined = [];

    (missions || []).forEach((m) => {
      if (m && m.id) {
        combined.push({
          ...m,
          isUserCreated: true,
          organizerType: 'AquaRise Guardian',
          cleanupStatus: 'AquaRise Mission'
        });
      }
    });

    CURATED_VERIFIED_EXTERNAL_EVENTS.forEach((ext) => {
      if (ext && ext.id) {
        combined.push({
          ...ext,
          organizerType: 'External Organization',
          cleanupStatus: 'External Organization Event'
        });
      }
    });

    liveDiscoveredEvents.forEach((liveEvt) => {
      if (liveEvt && liveEvt.id) {
        combined.push({
          ...liveEvt,
          organizerType: 'External Organization',
          cleanupStatus: 'External Organization Event'
        });
      }
    });

    return deduplicateCleanups(combined);
  }, [missions, liveDiscoveredEvents]);

  const isUpcoming = (item) => {
    if (!item.date) return true;
    return item.date >= todayStr;
  };

  const isCommunityMission = (item) => {
    return Boolean(
      item.isUserCreated ||
      item.cleanupStatus === 'AquaRise Mission' ||
      item.organizerType === 'AquaRise Guardian' ||
      item.isCommunityOrganized
    );
  };

  const isVerifiedItem = (item) => {
    return Boolean(
      item.isUserCreated ||
      item.verificationStatus === 'verified' ||
      item.verificationStatus === 'unverified' ||
      item.sourceUrl ||
      item.eventUrl
    );
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (onRefreshMissions) {
        await onRefreshMissions();
      }
      await fetchLiveCleanupOpportunities();
    } catch (err) {
      console.warn('[AquaRise Refresh Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        matchesTab = isCommunityMission(m);
      } else if (activeFilter === 'joined') {
        matchesTab = joinedMissionIds.includes(m.id) || isCleanupParticipating(m);
      }

      return matchesSearch && matchesOrg && matchesTab;
    });
  }, [allMissionsList, searchQuery, organizerFilter, activeFilter, joinedMissionIds, participationTick, todayStr]);

  const handleCardToggleSave = async (e, mission) => {
    e.stopPropagation();
    const isCommunity = Boolean(mission.isCommunityOrganized || mission.sourceType === 'aquarise_community' || mission.isUserCreated || mission.organizerType === 'AquaRise Guardian');
    
    if (isCommunity) {
      // Canonical Join Guard logic matching MissionDetailModal exactly
      if (!user || !user.id) {
        if (onToast) onToast('Please sign in to join community cleanup missions.', 'info');
        if (onOpenAuth) onOpenAuth();
        return;
      }

      if (!profile?.isGuardian) {
        if (onToast) onToast('Become an AquaRise Guardian to join community cleanup missions.', 'info');
        if (onBecomeGuardian) onBecomeGuardian();
        return;
      }

      const targetMissionId = mission.missionId || mission.id;
      const isJoined = joinedMissionIds.includes(targetMissionId) || joinedMissionIds.includes(mission.id);
      if (isJoined) {
        if (onLeaveMission) {
          const res = await onLeaveMission(targetMissionId);
          if (res?.error && onToast) onToast(res.error, 'error');
        }
      } else {
        if (mission.date && mission.date < todayStr) {
          if (onToast) onToast('Past missions are completed and cannot accept new joins.', 'info');
          return;
        }

        if (onJoinMission) {
          const res = await onJoinMission(targetMissionId);
          if (res?.error && onToast) onToast(res.error, 'error');
        }
      }
    } else {
      // External cleanups (Tavily/curated)
      const isSaved = isCleanupParticipating(mission);
      if (isSaved) {
        const res = leaveOrRemoveCleanup(mission);
        if (onToast) onToast(res.message, 'success');
      } else {
        const res = joinOrSaveCleanup(mission);
        if (onToast) onToast(res.message, 'success');
      }
    }
  };

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* View Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#35AEAC]/20 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-white px-3.5 py-1 rounded-full border border-[#92F1EC] inline-block shadow-sm">
              Community Action Hub
            </span>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#042F2E] font-normal tracking-tight">
              Cleanup Missions & <span className="text-[#0D9488] italic font-normal">Opportunities</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Find user-created AquaRise community missions and verified external environmental cleanup events across global waters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCreateCleanup}
              className="px-5 py-2.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Organize Cleanup</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2.5 rounded-full bg-white hover:bg-teal-50 border border-[#92F1EC] text-[#19887F] transition-all cursor-pointer shrink-0"
              title="Refresh discovery"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Discovery Error Banner */}
        {discoveryError && (
          <div className="bg-teal-50 border border-teal-200 text-[#19887F] p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
            <span>{discoveryError}</span>
            <button
              onClick={() => setDiscoveryError(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 sm:p-3 rounded-3xl border border-[#92F1EC] shadow-md">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'upcoming'
                  ? 'bg-[#19887F] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-teal-50'
              }`}
            >
              Upcoming ({allMissionsList.filter(isUpcoming).length})
            </button>

            <button
              onClick={() => setActiveFilter('aquarise')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'aquarise'
                  ? 'bg-[#19887F] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-teal-50'
              }`}
            >
              AquaRise Missions ({allMissionsList.filter(isCommunityMission).length})
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#19887F] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-teal-50'
              }`}
            >
              All Verified ({allMissionsList.filter(isVerifiedItem).length})
            </button>

            <button
              onClick={() => setActiveFilter('joined')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'joined'
                  ? 'bg-[#19887F] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-teal-50'
              }`}
            >
              Joined ({joinedMissionIds.length})
            </button>

            <button
              onClick={() => setActiveFilter('past')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'past'
                  ? 'bg-[#19887F] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-teal-50'
              }`}
            >
              Past Events ({allMissionsList.filter((m) => !isUpcoming(m)).length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search waterbody or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-teal-50/50 border border-teal-100 focus:outline-none focus:border-[#19887F] text-xs font-semibold text-ocean-950 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Cleanups Grid */}
        {isLoading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#92F1EC] space-y-4 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#19887F] animate-spin mx-auto" />
            <p className="text-xs text-slate-600 font-bold">Discovering environmental cleanup opportunities...</p>
          </div>
        ) : (
          filteredMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMissions.map((mission) => {
                const isCommunity = Boolean(mission.isUserCreated || mission.cleanupStatus === 'AquaRise Mission' || mission.organizerType === 'AquaRise Guardian');
                const isJoined = isCommunity ? joinedMissionIds.includes(mission.id) : isCleanupParticipating(mission);
                const isPastMission = !isUpcoming(mission);

                return (
                  <div
                    key={mission.id}
                    onClick={() => onViewMission(mission)}
                    className="bg-white rounded-3xl border border-[#92F1EC] overflow-hidden flex flex-col justify-between shadow-md hover:border-[#35AEAC] hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <CleanupCardBanner mission={mission} isCommunity={isCommunity} isJoined={isJoined} />

                    {/* Content */}
                    <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-[#19887F] font-bold">
                          <MapPin className="w-3.5 h-3.5 text-[#19887F] shrink-0" />
                          <span className="truncate">{mission.waterbodyName} • {mission.location || `${mission.city || ''}, ${mission.country || ''}`}</span>
                        </div>

                        <h3 className="text-lg font-black text-ocean-950 group-hover:text-[#076DDF] transition-colors line-clamp-2">
                          {mission.title || mission.name}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">
                          {mission.description || 'Join volunteers to remove plastic debris and restore this waterbody.'}
                        </p>
                      </div>

                      {/* Details Strip */}
                      <div className="p-3 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Date</span>
                          <span className="font-bold text-ocean-950 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#076DDF]" />
                            {formatCleanupDate(mission.date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Organizer</span>
                          <span className="font-bold text-ocean-950 truncate block">
                            {mission.organizer || 'AquaRise Network'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 flex items-center justify-between border-t border-[#92F1EC]" onClick={(e) => e.stopPropagation()}>
                        {isPastMission && !isJoined ? (
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
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isJoined
                                ? 'bg-teal-100 text-[#19887F] border border-[#92F1EC]'
                                : 'bg-slate-100 text-ocean-950 hover:bg-teal-50 border border-teal-200'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5 text-[#076DDF]" />
                            <span>{isJoined ? (isCommunity ? 'Joined ✓' : 'Saved ✓') : (isCommunity ? 'Join' : 'Save')}</span>
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
                            className="bg-[#076DDF] hover:bg-[#3C92FF] text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
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
                  className="px-6 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Create a Cleanup</span>
                </button>

                <button
                  onClick={onNavigateExplore}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 text-xs font-bold border border-teal-200 flex items-center gap-2 transition-all cursor-pointer"
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
