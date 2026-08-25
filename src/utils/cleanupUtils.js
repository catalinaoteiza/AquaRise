/**
 * Safely parses YYYY-MM-DD date string into a local Date object without UTC day shifts.
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.substring(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
}

/**
 * Returns Date object representing mission start date & time in local timezone.
 */
export function getMissionStartDateTime(mission) {
  if (!mission || !mission.date) return new Date();

  const startDate = parseLocalDate(mission.date);
  let hours = 10;
  let minutes = 0;

  const raw = mission.rawStartTime || mission.startTime;
  if (typeof raw === 'string' && raw.includes(':')) {
    const parts = raw.split(':');
    hours = parseInt(parts[0], 10) || 10;
    minutes = parseInt(parts[1], 10) || 0;
    if (raw.toLowerCase().includes('pm') && hours < 12) hours += 12;
    if (raw.toLowerCase().includes('am') && hours === 12) hours = 0;
  }

  startDate.setHours(hours, minutes, 0, 0);
  return startDate;
}

/**
 * Returns Date object representing mission end date & time in local timezone.
 */
export function getMissionEndDateTime(mission) {
  const startDateTime = getMissionStartDateTime(mission);
  let durationMins = mission?.durationMinutes || 120;

  if (!mission?.durationMinutes && mission?.estimatedDuration) {
    const match = String(mission.estimatedDuration).match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (String(mission.estimatedDuration).toLowerCase().includes('hour')) {
        durationMins = val * 60;
      } else {
        durationMins = val;
      }
    }
  }

  return new Date(startDateTime.getTime() + (durationMins * 60 * 1000));
}

/**
 * Determines whether a participant is eligible to submit completion evidence for a mission.
 * Evidence can ONLY be submitted AFTER the cleanup mission end time has passed.
 */
export function canSubmitCompletionEvidence(mission) {
  if (!mission) return false;
  const now = new Date();
  const endDateTime = getMissionEndDateTime(mission);

  // If mission is explicitly marked past or completed
  if (mission.status === 'Past' || mission.status === 'Completed' || mission.cleanupStatus === 'Past Event') {
    return true;
  }

  return now >= endDateTime;
}

/**
 * Calculates date status for a cleanup mission: 'Today', 'Upcoming', or 'Past'
 * Dynamically evaluates calendar date, start time, and estimated duration.
 */
export function getCleanupDateStatus(mission) {
  if (!mission || !mission.date) return 'Upcoming';

  const now = new Date();
  const todayYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (/^\d{4}-\d{2}-\d{2}/.test(mission.date)) {
    const missionYMD = mission.date.substring(0, 10);

    if (missionYMD < todayYMD) {
      return 'Past';
    }

    if (missionYMD > todayYMD) {
      return 'Upcoming';
    }

    // Same calendar date (missionYMD === todayYMD)
    const endDateTime = getMissionEndDateTime(mission);
    if (now > endDateTime) {
      return 'Past';
    }

    return 'Today';
  }

  if (mission.status === 'Past' || mission.status === 'Completed' || mission.cleanupStatus === 'Past Event') {
    return 'Past';
  }

  return 'Upcoming';
}

/**
 * Formats cleanup date into a human-friendly string (e.g. 'August 24, 2026' or 'Aug 24')
 */
export function formatCleanupDate(dateStr, compact = false) {
  if (!dateStr) return 'Date not provided';
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr;

  try {
    const dateObj = parseLocalDate(dateStr);
    if (compact) {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (err) {
    return dateStr;
  }
}

/**
 * Formats cleanup start time or returns fallback
 */
export function formatCleanupStartTime(startTime) {
  if (!startTime || startTime === 'TBD' || startTime === 'TBA') {
    return 'Time not provided';
  }
  return startTime;
}

/**
 * Formats cleanup estimated duration
 */
export function formatCleanupDuration(duration) {
  if (!duration) return 'Not specified';
  return duration;
}

/**
 * Builds normalized, accent-insensitive searchable text representation for any cleanup entity.
 * Includes title, waterbody, city, country, region, location, meeting point, organizer, description.
 */
export function getSearchableText(mission) {
  if (!mission) return '';

  const parts = [
    mission.title,
    mission.name,
    mission.waterbodyName,
    mission.city,
    mission.country,
    mission.region,
    mission.location,
    mission.meetingLocation,
    mission.meetingPoint,
    mission.organizer,
    mission.organizerType,
    mission.description
  ];

  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalizes a URL to a canonical identity string.
 */
export function normalizeCanonicalUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.trim());
    let host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    let pathname = parsed.pathname.replace(/\/+$/, '');
    return `${host}${pathname}`.toLowerCase();
  } catch (err) {
    return url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '').split('?')[0];
  }
}

/**
 * Normalizes an event title string to a canonical representation.
 */
export function normalizeCanonicalTitle(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—_]/g, '-')
    .replace(/[:'"\.,!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a date string to canonical YYYY-MM-DD format if possible.
 */
export function normalizeCanonicalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const matchYMD = dateStr.match(/\b(20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (matchYMD) return matchYMD[0];

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}

  return dateStr.trim().toLowerCase();
}

/**
 * Normalizes an organizer string to a canonical representation.
 */
export function normalizeCanonicalOrganizer(organizer) {
  if (!organizer || typeof organizer !== 'string') return '';
  return organizer
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[:'"\.,!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Robustly deduplicates an array of cleanup events across curated, live Tavily, and community sources.
 * Prefers events with official source URLs, richer verification, and complete descriptions.
 */
export function deduplicateCleanups(cleanups) {
  if (!Array.isArray(cleanups)) return [];

  const deduplicated = [];

  for (const item of cleanups) {
    if (!item) continue;

    const itemUrl = normalizeCanonicalUrl(item.sourceUrl || item.eventUrl || item.url);
    const itemTitle = normalizeCanonicalTitle(item.title || item.name);
    const itemDate = normalizeCanonicalDate(item.date);
    const itemOrganizer = normalizeCanonicalOrganizer(item.organizer || item.organization);

    const existingIndex = deduplicated.findIndex((existing) => {
      const existingUrl = normalizeCanonicalUrl(existing.sourceUrl || existing.eventUrl || existing.url);
      const existingTitle = normalizeCanonicalTitle(existing.title || existing.name);
      const existingDate = normalizeCanonicalDate(existing.date);
      const existingOrganizer = normalizeCanonicalOrganizer(existing.organizer || existing.organization);

      // Match 1: Identical canonical source URL
      if (itemUrl && existingUrl && itemUrl === existingUrl) return true;

      // Match 2: Same canonical title AND same canonical date
      if (itemTitle && existingTitle && itemTitle === existingTitle && itemDate && existingDate && itemDate === existingDate) return true;

      // Match 3: Same canonical organizer AND same canonical title
      if (itemOrganizer && existingOrganizer && itemOrganizer === existingOrganizer && itemTitle && existingTitle && itemTitle === existingTitle) return true;

      return false;
    });

    if (existingIndex === -1) {
      deduplicated.push(item);
    } else {
      // Pick richer version between item and existing
      const existing = deduplicated[existingIndex];
      const existingScore = (existing.sourceUrl ? 5 : 0) + (existing.description?.length || 0) + (existing.verificationStatus === 'verified' ? 10 : 0);
      const itemScore = (item.sourceUrl ? 5 : 0) + (item.description?.length || 0) + (item.verificationStatus === 'verified' ? 10 : 0);

      if (itemScore > existingScore) {
        deduplicated[existingIndex] = item;
      }
    }
  }

  return deduplicated;
}
