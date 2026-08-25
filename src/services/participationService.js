// Centralized Participation & Saved Cleanups Service for AquaRise Stage 6C
import { getStoredParticipations, getJoinedMissionIds, removeParticipationRecord, saveParticipationRecord } from '../utils/storage.js';

const STORAGE_KEY = 'aquarise_user_participation';

/**
 * Generates a stable deterministic ID for cleanups.
 * For external events, uses ext_${sourceUrl}_${date}.
 * For community missions, uses event.id.
 */
export function generateStableCleanupId(event) {
  if (!event) return `cleanup_${Date.now()}`;
  
  if (event.isUserCreated || event.isCommunityOrganized || event.cleanupStatus === 'AquaRise Mission') {
    return event.id || `mission_${Date.now()}`;
  }

  const urlKey = String(event.sourceUrl || event.eventUrl || event.id || '').replace(/[^a-z0-9]/g, '');
  const dateKey = String(event.date || '').replace(/[^a-z0-9]/g, '');
  return `ext_${urlKey}_${dateKey}`;
}

/**
 * Retrieves all stored participations (joined missions & saved external cleanups).
 */
export function getParticipations() {
  const primary = getStoredParticipations();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return primary;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const merged = [...primary];
      parsed.forEach((item) => {
        if (item && !merged.some((p) => p.id === item.id || p.missionId === item.id)) {
          merged.push(item);
        }
      });
      return merged;
    }
  } catch (err) {}
  return primary;
}

/**
 * Checks if a cleanup is currently joined or saved by the user.
 */
export function isCleanupParticipating(event) {
  if (!event) return false;
  const eventId = typeof event === 'string' ? event : (event.id || event.missionId);
  const joinedIds = getJoinedMissionIds();
  if (joinedIds.includes(eventId)) return true;

  const list = getParticipations();
  return list.some((item) => item.id === eventId || item.missionId === eventId || item.cleanupMissionId === eventId);
}

/**
 * Joins a community mission or saves an external cleanup.
 */
export function joinOrSaveCleanup(event) {
  if (!event) return { success: false, message: 'Invalid cleanup record' };

  const list = getParticipations();
  const stableId = generateStableCleanupId(event);
  
  const existing = list.find(item => item.id === stableId || item.originalId === event.id);
  if (existing) {
    return {
      success: false,
      message: 'Cleanup is already saved in My Cleanups'
    };
  }

  const isCommunity = Boolean(event.isUserCreated || event.isCommunityOrganized || event.cleanupStatus === 'AquaRise Mission' || event.organizerType === 'AquaRise Guardian');
  const type = isCommunity ? 'community' : 'external';

  const newRecord = {
    id: stableId,
    originalId: event.id,
    title: event.title || event.name || 'Environmental Cleanup',
    waterbodyName: event.waterbodyName || event.name || 'Waterbody Location',
    location: event.location || event.meetingLocation || 'Location TBD',
    country: event.country || 'Global',
    date: event.date || 'TBD',
    time: event.time || 'TBD',
    organizer: event.organizer || event.organization || 'Organizer not provided',
    organizerType: isCommunity ? 'AquaRise Guardian' : 'External Organization',
    description: event.description || 'Verified environmental cleanup opportunity.',
    sourceUrl: event.sourceUrl || event.eventUrl || '#',
    type,
    statusText: event.statusText || `Upcoming • ${event.date || 'TBD'}`,
    image: event.image || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800',
    verificationStatus: isCommunity ? (event.verificationStatus || 'Unverified') : 'Source Verified',
    savedAt: new Date().toISOString()
  };

  const updatedList = [newRecord, ...list];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  window.dispatchEvent(new CustomEvent('aquarise_participation_changed', { detail: { action: 'add', record: newRecord } }));

  return {
    success: true,
    message: isCommunity ? 'Mission joined successfully!' : 'Cleanup saved to My Cleanups.',
    type
  };
}

/**
 * Leaves a community mission or removes an external cleanup from My Cleanups.
 */
export function leaveOrRemoveCleanup(event) {
  if (!event) return { success: false, message: 'Invalid cleanup record' };

  const list = getParticipations();
  const targetId = typeof event === 'string' ? event : generateStableCleanupId(event);
  const originalId = typeof event === 'object' ? (event.missionId || event.id) : null;

  const filtered = list.filter(item => item.id !== targetId && item.originalId !== targetId && item.originalId !== originalId && item.id !== originalId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  if (targetId) removeParticipationRecord(targetId);
  if (originalId && originalId !== targetId) removeParticipationRecord(originalId);

  window.dispatchEvent(new CustomEvent('aquarise_participation_changed', { detail: { action: 'remove', id: targetId || originalId } }));

  return {
    success: true,
    message: 'Left cleanup mission.'
  };
}

/**
 * Categorizes saved participations dynamically into UPCOMING and PAST based on current date
 */
export function categorizeParticipations(list) {
  const participations = list || getParticipations();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = [];
  const past = [];

  participations.forEach(item => {
    let eventDate = null;
    if (item.date) {
      const parsed = new Date(item.date);
      if (!isNaN(parsed.getTime())) {
        eventDate = parsed;
      }
    }

    if (eventDate && eventDate < now) {
      past.push(item);
    } else {
      upcoming.push(item);
    }
  });

  return { upcoming, past };
}
