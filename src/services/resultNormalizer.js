import { verifySourceMetadata, verifyExternalEventEvidence, checkEventFreshness, isSpecificSourceName, isValidExternalUrl } from './sourceVerificationLayer';

/**
 * Result Normalizer
 * Converts raw API discovery items or demo payloads into canonical AquaRise Discovery Objects.
 */
export function normalizeDiscoveryResult(rawItem, defaultContentType = 'Live / Sourced') {
  if (!rawItem) return null;

  const verification = verifySourceMetadata(rawItem);
  
  let cleanupEventObj = null;
  let hasValidExternalEvent = false;

  if (rawItem.cleanupEvent) {
    const freshness = checkEventFreshness(rawItem.cleanupEvent.date);
    cleanupEventObj = {
      id: rawItem.cleanupEvent.id || `ext-evt-${rawItem.id}`,
      title: rawItem.cleanupEvent.title || 'Community Cleanup Event',
      organizer: rawItem.cleanupEvent.organizer || '',
      organizerType: rawItem.cleanupEvent.organizerType || 'External Organization',
      date: rawItem.cleanupEvent.date || '',
      location: rawItem.cleanupEvent.meetingLocation || rawItem.location || `${rawItem.city || ''}, ${rawItem.country || ''}`,
      eventUrl: rawItem.cleanupEvent.eventUrl || rawItem.sourceUrl || '',
      description: rawItem.cleanupEvent.description || 'External environmental cleanup initiative.',
      statusText: freshness.statusText,
      isPast: freshness.isPast,
      isDemoEvent: rawItem.cleanupEvent.isDemoEvent ?? rawItem.isDemoEvent ?? (defaultContentType === 'Demo')
    };

    hasValidExternalEvent = verifyExternalEventEvidence(cleanupEventObj) && !cleanupEventObj.isDemoEvent;
  }

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const sourceNameClean = isSpecificSourceName(rawItem.sourceName)
    ? rawItem.sourceName
    : 'Demo Data — No Live Source';

  const sourceUrlClean = isValidExternalUrl(rawItem.sourceUrl)
    ? rawItem.sourceUrl
    : '';

  // Determine cleanupStatus based strictly on verified evidence
  let cleanupStatus = 'No Cleanup Yet';
  if (rawItem.cleanupStatus === 'AquaRise Mission' && (rawItem.isUserCreated || !rawItem.isDemoEvent)) {
    cleanupStatus = 'AquaRise Mission';
  } else if (hasValidExternalEvent) {
    cleanupStatus = 'External Organization Event';
  }

  return {
    id: rawItem.id || `wb-disc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: rawItem.waterbodyName || rawItem.name || 'Unnamed Waterbody',
    waterbodyName: rawItem.waterbodyName || rawItem.name || 'Unnamed Waterbody',
    waterbodyType: rawItem.waterbodyType || rawItem.type || 'Waterbody',
    type: rawItem.waterbodyType || rawItem.type || 'Waterbody',
    country: rawItem.country || 'Global',
    city: rawItem.city || '',
    region: rawItem.region || '',
    location: rawItem.location || `${rawItem.city ? rawItem.city + ', ' : ''}${rawItem.country || ''}`,
    coordinates: rawItem.coordinates || null,
    attentionLevel: rawItem.attentionLevel || rawItem.severity || 'Moderate',
    environmentalConcern: rawItem.environmentalConcern || rawItem.mainIssue || 'Environmental attention required',
    environmentalSummary: rawItem.environmentalSummary || rawItem.description || 'Reported pollution concern.',
    description: rawItem.environmentalSummary || rawItem.description || 'Reported pollution concern.',
    sourceName: sourceNameClean,
    sourceUrl: sourceUrlClean,
    lastChecked: rawItem.lastChecked || currentDateStr,
    retrievedAt: rawItem.retrievedAt || new Date().toISOString(),
    image: rawItem.image || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800',
    cleanupStatus,
    cleanupEvent: hasValidExternalEvent ? cleanupEventObj : (rawItem.isDemoEvent ? cleanupEventObj : null),
    verificationStatus: verification.status,
    contentType: rawItem.contentType || defaultContentType,
    isVerifiedData: verification.isValid,
    isDemoEvent: rawItem.isDemoEvent ?? (defaultContentType === 'Demo')
  };
}
