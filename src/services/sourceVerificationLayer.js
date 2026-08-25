/**
 * Source Verification & Freshness Layer
 * Enforces strict verification standards for waterbodies and external cleanup events.
 * AquaRise prefers returning zero results over falsely presenting a generic webpage as a verified cleanup event.
 */

export const trustedOrganizations = [
  // International / Global Environmental Organizations
  { canonicalName: 'Ocean Conservancy', domains: ['oceanconservancy.org'] },
  { canonicalName: 'SEA LIFE TRUST', domains: ['sealifetrust.org'] },
  { canonicalName: 'The Ocean Cleanup', domains: ['theoceancleanup.com'] },
  { canonicalName: 'Let\'s Do It World', domains: ['letsdoitworld.org'] },
  { canonicalName: 'World Cleanup Day Org', domains: ['worldcleanupday.org'] },
  { canonicalName: 'Surfrider Foundation', domains: ['surfrider.org'] },
  { canonicalName: 'UN Environment Programme (UNEP)', domains: ['unep.org'] },
  { canonicalName: 'World Wildlife Fund (WWF)', domains: ['wwf.org'] },
  { canonicalName: 'Greenpeace International', domains: ['greenpeace.org'] },
  { canonicalName: 'ASCOA Cameroon', domains: ['ascoa.org'] },
  
  // United States Environmental Organizations and Agencies
  { canonicalName: 'Heal the Bay', domains: ['healthebay.org'] },
  { canonicalName: 'Keep America Beautiful', domains: ['kab.org'] },
  { canonicalName: 'California Coastal Commission', domains: ['coastal.ca.gov', 'ca.gov'] },
  { canonicalName: 'East Bay Regional Park District', domains: ['ebparks.org'] },
  { canonicalName: 'National Park Service', domains: ['nps.gov'] },
  { canonicalName: 'NOAA', domains: ['noaa.gov'] },
  { canonicalName: 'U.S. Environmental Protection Agency (EPA)', domains: ['epa.gov'] },
  
  // European Commission & International Institutions
  { canonicalName: 'European Commission', domains: ['ec.europa.eu', 'oceans-and-fisheries.ec.europa.eu'] },
  
  // United Kingdom
  { canonicalName: 'Marine Conservation Society', domains: ['mcsuk.org'] },
  { canonicalName: 'Surfers Against Sewage', domains: ['sas.org.uk'] },
  { canonicalName: 'Keep Britain Tidy', domains: ['keepbritaintidy.org'] },
  
  // Australia
  { canonicalName: 'Clean Up Australia', domains: ['cleanup.org.au'] },
  { canonicalName: 'Tangaroa Blue Foundation', domains: ['tangaroablue.org'] },
  
  // Regional Watershed / Conservation Groups
  { canonicalName: 'Clean a Creek Foundation', domains: ['cleanacreek.org'] }
];

/**
 * Looks up trusted organization status strictly by URL domain.
 * Name text alone does not grant trusted source status to prevent text spoofing.
 */
export function lookupTrustedOrganizationByDomain(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

    for (const org of trustedOrganizations) {
      for (const domain of org.domains) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          return {
            canonicalName: org.canonicalName,
            matchedDomain: domain,
            trustLevel: 'HIGH'
          };
        }
      }
    }

    if (hostname.endsWith('.gov') || hostname.includes('.gov.')) {
      return {
        canonicalName: 'Government Agency',
        matchedDomain: hostname,
        trustLevel: 'HIGH_GOV'
      };
    }

    return {
      canonicalName: 'Unknown Organizer',
      matchedDomain: hostname,
      trustLevel: 'UNKNOWN'
    };
  } catch (e) {
    return null;
  }
}

const GENERIC_SOURCE_CATEGORIES = [
  'environmental publication',
  'environmental organization',
  'external organization',
  'unknown organizer',
  'ngo',
  'ngo source',
  'conservation organization',
  'research source',
  'community organization',
  'sourced data',
  'global environmental database (demo)',
  'global environmental database',
  'demonstration external discovery',
  'aquarise demonstration platform',
  'demo environmental organization',
  'aquarise community'
];

const GENERIC_TITLE_PATTERNS = [
  'solutions for a sustainable future',
  'environmental cleanup: solutions for a sustainable future',
  'volunteer opportunities',
  'volunteer opportunity',
  'environmental programs',
  'get involved',
  'events',
  'event directory',
  'cleanup resources',
  'community cleanups',
  'programs',
  'resources',
  'clean up',
  'cleanup',
  'upcoming events',
  'news',
  'blog'
];

/**
 * Validates whether a source name is a real specific source or just a generic category
 */
export function isSpecificSourceName(sourceName) {
  if (!sourceName || typeof sourceName !== 'string') return false;
  const normalized = sourceName.trim().toLowerCase();
  return !GENERIC_SOURCE_CATEGORIES.includes(normalized) && !normalized.endsWith(' organization');
}

/**
 * Validates whether a title is a generic non-event page title
 */
export function isWeakOrGenericTitle(title) {
  if (!title || typeof title !== 'string') return true;
  const normalized = title.trim().toLowerCase();
  if (normalized.length < 5) return true;
  if (GENERIC_TITLE_PATTERNS.includes(normalized)) return true;
  if (normalized.endsWith(' organization')) return true;
  return false;
}

/**
 * Validates whether a source URL is a real external link (not # or placeholder)
 */
export function isValidExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '#' || trimmed.startsWith('https://example.org')) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Determines exact verification status for source metadata
 */
export function verifySourceMetadata(item) {
  if (!item) {
    return {
      isValid: false,
      status: 'Source Needed',
      reasons: ['Missing item payload'],
      sourceNameDisplay: 'Source Needed'
    };
  }

  if (item.isDemoEvent || item.contentType === 'Demo') {
    return {
      isValid: false,
      status: 'Demo Data',
      reasons: ['Development demonstration record'],
      sourceNameDisplay: 'Demo Data — No Live Source'
    };
  }

  if (item.isCommunityReport) {
    return {
      isValid: false,
      status: 'Community Report',
      reasons: ['Community report filed by user'],
      sourceNameDisplay: 'Community Submission'
    };
  }

  const reasons = [];
  const sourceName = item.sourceName || item.organizer;
  const sourceUrl = item.sourceUrl || item.eventUrl;

  const hasSpecificSource = isSpecificSourceName(sourceName);
  const hasValidUrl = isValidExternalUrl(sourceUrl);
  const hasLastChecked = Boolean(item.lastChecked);

  if (!hasSpecificSource) reasons.push('Source name is generic category or missing');
  if (!hasValidUrl) reasons.push('Source URL is missing or placeholder');
  if (!hasLastChecked) reasons.push('Missing last checked timestamp');

  const isValid = reasons.length === 0;

  return {
    isValid,
    status: isValid ? 'Source Verified' : 'Source Needed',
    reasons,
    sourceNameDisplay: hasSpecificSource ? sourceName : 'Demo Data — No Live Source'
  };
}

/**
 * Dynamic freshness check for external cleanup events against current date
 */
export function checkEventFreshness(eventDateStr) {
  if (!eventDateStr) {
    return { isUpcoming: false, isPast: false, statusText: 'Date Unspecified' };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsedDate = new Date(eventDateStr);

    if (isNaN(parsedDate.getTime())) {
      return { isUpcoming: true, isPast: false, statusText: eventDateStr };
    }

    if (parsedDate < today) {
      return {
        isUpcoming: false,
        isPast: true,
        statusText: 'Past Event'
      };
    }

    return {
      isUpcoming: true,
      isPast: false,
      statusText: `Upcoming • ${eventDateStr}`
    };
  } catch (err) {
    return { isUpcoming: true, isPast: false, statusText: eventDateStr };
  }
}

/**
 * Verifies whether an external cleanup event has ALL required evidence
 */
export function verifyExternalEventEvidence(event) {
  const result = verifyExternalEventDetails(event);
  return result.isValid;
}

/**
 * Hardened verification with explicit rejection reasons for dev diagnostics
 */
export function verifyExternalEventDetails(event) {
  if (!event) return { isValid: false, reasons: ['missing_event_payload'] };

  const reasons = [];

  if (!event.title || !event.title.trim()) {
    reasons.push('missing_event_title');
  } else if (isWeakOrGenericTitle(event.title)) {
    reasons.push('generic_page');
  }

  if (!isSpecificSourceName(event.organizer)) {
    reasons.push('weak_source');
  }

  if (!event.date || event.date === 'TBD') {
    reasons.push('missing_date');
  } else {
    const freshness = checkEventFreshness(event.date);
    if (freshness.isPast) {
      reasons.push('past_event');
    }
  }

  if (!event.location && !event.meetingLocation) {
    reasons.push('missing_location');
  }

  if (!isValidExternalUrl(event.eventUrl || event.sourceUrl)) {
    reasons.push('insufficient_event_evidence');
  }

  return {
    isValid: reasons.length === 0,
    reasons
  };
}
