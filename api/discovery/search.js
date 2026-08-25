/**
 * Vercel Serverless Function & Server API Route: /api/discovery/search
 * Securely calls Tavily Search API server-side using process.env.TAVILY_API_KEY.
 * NEVER exposes private API keys to client JavaScript or bundles.
 * AquaRise prefers returning zero results over falsely presenting a generic webpage as a verified cleanup event.
 */

const trustedOrganizations = [
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

function extractDomainName(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return '';
  }
}

/**
 * Looks up trusted organization status strictly by URL domain.
 * Name text alone does not grant trusted source status to prevent text spoofing.
 */
function lookupTrustedOrganizationByDomain(url) {
  if (!url || typeof url !== 'string') return { canonicalName: 'Unknown Organizer', matchedDomain: '', trustLevel: 'UNKNOWN' };
  try {
    const hostname = extractDomainName(url);

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
    return { canonicalName: 'Unknown Organizer', matchedDomain: '', trustLevel: 'UNKNOWN' };
  }
}

/**
 * Extracts real authoritative organization names.
 * NEVER fabricates organization names by capitalizing domain names and adding "Organization".
 */
function extractPublisherName(url, title = '', content = '') {
  const trustedInfo = lookupTrustedOrganizationByDomain(url);
  if (trustedInfo && trustedInfo.canonicalName !== 'Unknown Organizer' && trustedInfo.canonicalName !== 'Government Agency') {
    return trustedInfo.canonicalName;
  }

  if (trustedInfo && trustedInfo.trustLevel === 'HIGH_GOV') {
    const orgMatch = content.match(/(Department of|Commission|Agency|District|Authority|Bureau|Ministry)\s+([A-Z][A-Za-z0-9\s&]{3,30})/i);
    if (orgMatch && orgMatch[0]) {
      return orgMatch[0].trim();
    }
    return 'Government Agency';
  }

  // Try extracting explicit organization from metadata snippet
  const orgMatch = content.match(/(Hosted by|Organized by|Presented by)\s+([A-Z][A-Za-z0-9\s&]{3,40})/i);
  if (orgMatch && orgMatch[2]) {
    return orgMatch[2].trim();
  }

  return 'Unknown Organizer';
}

/**
 * Checks if a title is weak, generic, or non-event specific
 */
function isWeakOrGenericTitle(title = '') {
  if (!title) return true;
  const t = title.trim().toLowerCase();
  
  const genericTitles = [
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
    'blog',
    'home'
  ];

  if (genericTitles.includes(t)) return true;
  if (t.endsWith(' organization')) return true;
  if (t.length < 5) return true;

  return false;
}

function inferWaterbodyType(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes('river') || text.includes('stream') || text.includes('creek') || text.includes('basin')) return 'River';
  if (text.includes('lake') || text.includes('reservoir') || text.includes('lagoon')) return 'Lake';
  if (text.includes('beach') || text.includes('coast') || text.includes('dune') || text.includes('shore')) return 'Beach';
  if (text.includes('wetland') || text.includes('mangrove') || text.includes('marsh') || text.includes('swamp')) return 'Wetland';
  if (text.includes('bay') || text.includes('estuary') || text.includes('gulf')) return 'Coast';
  return 'River';
}

function inferAttentionLevel(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes('critical') || text.includes('severe') || text.includes('emergency') || text.includes('toxic') || text.includes('hazard')) return 'Critical';
  if (text.includes('high') || text.includes('urgency') || text.includes('threat') || text.includes('alarm')) return 'High Urgency';
  return 'Moderate';
}

/**
 * Hardened evidence validation for Tavily external cleanup events.
 * Trusted source status increases source confidence, but DOES NOT bypass event-specific evidence requirements!
 */
function validateTavilyExternalEvent(item) {
  const title = item.title?.replace(/[-|].*$/, '').trim() || '';
  const content = item.content || '';
  const url = item.url || '';

  const trustedInfo = lookupTrustedOrganizationByDomain(url);
  const sourceTrustText = trustedInfo.trustLevel === 'HIGH'
    ? `Source Trust: HIGH — matched ${trustedInfo.matchedDomain}`
    : trustedInfo.trustLevel === 'HIGH_GOV'
      ? `Source Trust: HIGH_GOV — matched ${trustedInfo.matchedDomain}`
      : `Source Trust: UNKNOWN — performing strict evidence validation`;

  // 1. Title Validation
  if (isWeakOrGenericTitle(title)) {
    return { valid: false, reason: 'generic_page', sourceTrustText };
  }

  // Check if title has event/cleanup intent
  const hasEventInTitle = /cleanup|clean-up|clean up|coastal|beach|river|lake|trash sweep|sweep|world cleanup/i.test(title);
  if (!hasEventInTitle) {
    return { valid: false, reason: 'missing_event_title', sourceTrustText };
  }

  // 2. Directory Page Check
  const parsedUrlPath = url.toLowerCase();
  const isDirectoryUrl = parsedUrlPath.endsWith('/events') || parsedUrlPath.endsWith('/volunteer-opportunities') || parsedUrlPath.endsWith('/get-involved') || parsedUrlPath.includes('/volunteer-opportunities');
  const isSpecificCampaignTitle = /coastal cleanup day|international coastal cleanup|world cleanup day|24-hour global clean-up|coastal clean up day 2026/i.test(title);
  
  if (isDirectoryUrl && !isSpecificCampaignTitle) {
    return { valid: false, reason: 'generic_event_directory', sourceTrustText };
  }

  // 3. Source URL check
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return { valid: false, reason: 'weak_source', sourceTrustText };
  }

  // 4. Organizer Credibility (Unknown organizers allowed ONLY if page evidence is exceptionally strong)
  const publisher = extractPublisherName(url, title, content);
  if (publisher === 'Unknown Organizer' && trustedInfo.trustLevel === 'UNKNOWN' && !url.includes('.gov') && !url.includes('.org')) {
    return { valid: false, reason: 'weak_source', sourceTrustText };
  }

  // 5. Date Extraction & Proximity Matching (date_not_tied_to_event)
  const dateMatch = content.match(/(202[6-9]-[-0-9]+|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? (?:202[6-9]))/i);
  if (!dateMatch) {
    return { valid: false, reason: 'missing_date', sourceTrustText };
  }

  const dateStr = dateMatch[0];
  const dateIdx = content.indexOf(dateStr);
  
  // Verify date-to-event proximity
  if (dateIdx !== -1) {
    const snippetStart = Math.max(0, dateIdx - 80);
    const snippetEnd = Math.min(content.length, dateIdx + dateStr.length + 80);
    const dateContext = content.substring(snippetStart, snippetEnd).toLowerCase();

    const hasEventProximity = /cleanup|clean up|event|held|takes place|annual|volunteer|coastal|beach|river|september|october|2026|2027/i.test(dateContext);
    if (!hasEventProximity) {
      return { valid: false, reason: 'date_not_tied_to_event', sourceTrustText };
    }
  }

  // 6. Dynamic Future Date Check
  const parsedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!isNaN(parsedDate.getTime()) && parsedDate < today) {
    return { valid: false, reason: 'past_event', sourceTrustText };
  }

  return {
    valid: true,
    organizer: publisher,
    date: dateStr,
    reason: 'Accepted',
    sourceTrustText
  };
}

export default async function handler(req, res) {
  const queryParam = req.query?.q || req.body?.q || 'beach cleanup volunteer';
  const countryParam = req.query?.country || req.body?.country || '';
  const searchType = req.query?.type || req.body?.type || 'waterbody';

  const apiKey = process.env.TAVILY_API_KEY || process.env.TAVILY_KEY;

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      error: 'TAVILY_API_KEY is not configured on server.',
      fallbackToSourcedData: false,
      results: []
    });
  }

  try {
    let searchString = '';
    if (searchType === 'cleanup' || queryParam.includes('cleanup') || queryParam.includes('volunteer')) {
      searchString = `${queryParam} ${countryParam} beach river waterway cleanup volunteer upcoming event`.trim();
    } else {
      searchString = `${queryParam} ${countryParam} water pollution environmental report`.trim();
    }

    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: searchString,
        search_depth: 'advanced',
        include_answer: false,
        include_images: true,
        max_results: 8
      })
    });

    if (!tavilyResponse.ok) {
      return res.status(500).json({
        success: false,
        error: `Tavily API returned HTTP status ${tavilyResponse.status}`,
        results: []
      });
    }

    const data = await tavilyResponse.json();
    const rawResults = data.results || [];

    const currentDateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const seenUrls = new Set();
    const seenTitles = new Set();

    let candidatesCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;
    const devDiagnosticLogs = [];

    const normalized = [];

    rawResults.forEach((item, idx) => {
      const canonicalUrl = item.url?.toLowerCase().trim();
      let cleanTitle = item.title?.replace(/[-|].*$/, '').trim() || 'Sourced Waterbody';
      if (cleanTitle.length > 60) {
        cleanTitle = cleanTitle.substring(0, 58) + '...';
      }

      if (seenUrls.has(canonicalUrl) || seenTitles.has(cleanTitle.toLowerCase())) {
        return;
      }
      seenUrls.add(canonicalUrl);
      seenTitles.add(cleanTitle.toLowerCase());
      candidatesCount++;

      const domain = extractDomainName(item.url);
      const waterbodyType = inferWaterbodyType(item.title, item.content);
      const attentionLevel = inferAttentionLevel(item.title, item.content);

      const eventValidation = validateTavilyExternalEvent(item);
      let cleanupEventObj = null;
      let cleanupStatus = 'No Cleanup Yet';

      if (eventValidation.valid) {
        acceptedCount++;
        cleanupEventObj = {
          id: `tavily-evt-${Date.now()}-${idx}`,
          title: cleanTitle,
          organization: eventValidation.organizer,
          organizer: eventValidation.organizer,
          organizerType: 'External Organization',
          date: eventValidation.date,
          startDate: eventValidation.date,
          location: countryParam && countryParam !== 'All' ? countryParam : 'Sourced Location',
          country: countryParam || 'Global',
          sourceUrl: item.url,
          eventUrl: item.url,
          sourceDomain: domain,
          description: item.content?.substring(0, 200) || 'Verified external environmental cleanup event.',
          eventType: 'External Cleanup',
          waterbodyType,
          external: true,
          statusText: `Upcoming • ${eventValidation.date}`,
          verificationStatus: 'Source Verified',
          tags: ['External Cleanup', waterbodyType, 'Volunteer'],
          isDemoEvent: false
        };
        cleanupStatus = 'External Organization Event';

        if (process.env.NODE_ENV !== 'production') {
          devDiagnosticLogs.push({
            status: 'ACCEPTED',
            title: cleanTitle,
            organizer: eventValidation.organizer,
            date: eventValidation.date,
            sourceUrl: item.url,
            sourceTrust: eventValidation.sourceTrustText,
            result: 'Verified Specific Cleanup Opportunity'
          });
        }
      } else {
        rejectedCount++;
        if (process.env.NODE_ENV !== 'production') {
          devDiagnosticLogs.push({
            status: 'REJECTED',
            title: cleanTitle,
            reason: eventValidation.reason,
            sourceTrust: eventValidation.sourceTrustText,
            sourceUrl: item.url
          });
        }
      }

      normalized.push({
        id: `tavily-wb-${Date.now()}-${idx}`,
        waterbodyName: cleanTitle,
        name: cleanTitle,
        waterbodyType,
        type: waterbodyType,
        country: countryParam && countryParam !== 'All' ? countryParam : 'Global',
        city: '',
        region: '',
        location: countryParam && countryParam !== 'All' ? countryParam : 'Global Environmental Location',
        coordinates: null,
        attentionLevel,
        environmentalConcern: item.title || 'Reported pollution and environmental concern',
        environmentalSummary: item.content || 'Environmental reporting covering plastic, industrial, or runoff pollution.',
        description: item.content || 'Environmental reporting covering plastic, industrial, or runoff pollution.',
        sourceName: eventValidation.valid ? eventValidation.organizer : domain,
        sourceUrl: item.url,
        sourceDomain: domain,
        lastChecked: currentDateStr,
        retrievedAt: new Date().toISOString(),
        image: item.images?.[0] || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800',
        cleanupStatus,
        cleanupEvent: cleanupEventObj,
        verificationStatus: item.url && item.url.startsWith('http') ? 'Source Verified' : 'Source Needed',
        contentType: 'Live / Sourced',
        isDemoEvent: false,
        isLiveSourced: true
      });
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AquaRise Discovery Diagnostics] Raw results: ${rawResults.length}`);
      console.log(`[AquaRise Discovery Diagnostics] Candidates: ${candidatesCount}`);
      console.log(`[AquaRise Discovery Diagnostics] Accepted: ${acceptedCount}`);
      console.log(`[AquaRise Discovery Diagnostics] Rejected: ${rejectedCount}`);
      console.log('[AquaRise Discovery Diagnostic Details]:', devDiagnosticLogs);
    }

    return res.status(200).json({
      success: true,
      provider: 'Tavily Search API',
      query: searchString,
      rawCount: rawResults.length,
      candidatesCount,
      acceptedCount,
      rejectedCount,
      diagnosticLogs: devDiagnosticLogs,
      results: normalized
    });
  } catch (err) {
    console.error('Tavily Server Endpoint Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to execute Tavily search on server.',
      results: []
    });
  }
}
