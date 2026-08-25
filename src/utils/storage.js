// LocalStorage Persistence Utilities for AquaRise MVP

const REPORTS_KEY = 'aquarise_reports';
const MISSIONS_KEY = 'aquarise_missions';
const JOINED_KEY = 'aquarise_joined_missions';
const PROFILE_KEY = 'aquarise_profile';
const PARTICIPATIONS_KEY = 'aquarise_participations';
const CERTIFICATES_KEY = 'aquarise_certificates';

import { MOCK_REPORTS } from '../data/mockReports.js';
import { MOCK_WATERBODIES } from '../data/mockWaterbodies.js';
import { INITIAL_PROFILE } from '../data/mockProfile.js';

const INITIAL_CERTIFICATES = [];
const INITIAL_PARTICIPATIONS = [];

/**
 * Safe LocalStorage migration: removes ONLY known demo fixture records from persistence.
 * Preserves legitimate user-created missions and user actions.
 */
export function cleanDemoRecordsFromStorage() {
  try {
    const isDemoRecord = (item) => {
      if (!item || typeof item !== 'object') return false;
      const title = String(item.title || item.name || item.cleanupTitle || '').toLowerCase();
      const desc = String(item.description || '').toLowerCase();
      const org = String(item.organizer || item.organization || item.guardianName || '').toLowerCase();
      const source = String(item.eventSource || item.sourceName || '').toLowerCase();
      const id = String(item.id || item.cleanupMissionId || item.certificateId || '');
      const location = String(item.location || '').toLowerCase();

      return (
        item.isDemoEvent === true ||
        item.isDemo === true ||
        id.startsWith('evt-') ||
        id.startsWith('wb-evt-') ||
        id === 'part-001' ||
        id === 'part-002' ||
        id === 'cert-001' ||
        id === 'cert-002' ||
        title.includes('(demo)') ||
        title.includes('demonstration') ||
        title.includes('puget sound') ||
        title.includes('lake erie shoreline') ||
        title.includes('marine debris clearance') ||
        desc.includes('demonstration mission') ||
        desc.includes('demonstration external') ||
        org === 'demo environmental organization' ||
        org === 'aquarise community' ||
        org === 'elena rostova' ||
        location.includes('tacoma') ||
        source.includes('demonstration')
      );
    };

    // Clean missions
    const missionsRaw = localStorage.getItem(MISSIONS_KEY);
    if (missionsRaw) {
      const parsed = JSON.parse(missionsRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((m) => !isDemoRecord(m));
        localStorage.setItem(MISSIONS_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean participations
    const participationsRaw = localStorage.getItem(PARTICIPATIONS_KEY);
    if (participationsRaw) {
      const parsed = JSON.parse(participationsRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((p) => !isDemoRecord(p));
        localStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean reports
    const reportsRaw = localStorage.getItem(REPORTS_KEY);
    if (reportsRaw) {
      const parsed = JSON.parse(reportsRaw);
      if (Array.isArray(parsed)) {
        const isDemoReport = (rep) => {
          if (!rep || typeof rep !== 'object') return false;
          const id = String(rep.id || '').toLowerCase();
          const title = String(rep.title || rep.waterbodyName || '').toLowerCase();
          const loc = String(rep.locationDescription || rep.city || rep.region || '').toLowerCase();

          return (
            id === 'rep-101' ||
            id === 'rep-102' ||
            id === 'rep-103' ||
            title.includes('puget sound estuary cove') ||
            title.includes('victoria lake wetlands') ||
            title.includes('upper mississippi river bend') ||
            loc.includes('tacoma') ||
            loc.includes('kisumu') ||
            loc.includes('davenport') ||
            rep.isDemoReport === true ||
            rep.isDemo === true
          );
        };
        const cleaned = parsed.filter((r) => !isDemoReport(r));
        localStorage.setItem(REPORTS_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean certificates
    const certsRaw = localStorage.getItem(CERTIFICATES_KEY);
    if (certsRaw) {
      const parsed = JSON.parse(certsRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((c) => !isDemoRecord(c));
        localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean stale Elena Rostova demo profile
    const profileRaw = localStorage.getItem(PROFILE_KEY);
    if (profileRaw) {
      const parsed = JSON.parse(profileRaw);
      if (parsed && (parsed.name === 'Elena Rostova' || parsed.id === 'guardian-001')) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_PROFILE));
      }
    }
  } catch (err) {
    // Non-blocking storage error catch
  }
}

// Execute migration once on module import
cleanDemoRecordsFromStorage();

// Helper to extract initial community missions (Returns empty array - zero fake missions)
const getInitialMissions = () => {
  return [];
};

export function getStoredReports() {
  cleanDemoRecordsFromStorage();
  try {
    const data = localStorage.getItem(REPORTS_KEY);
    if (!data) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r) => {
      if (!r || typeof r !== 'object') return false;
      const title = String(r.title || r.waterbodyName || '').toLowerCase();
      const loc = String(r.locationDescription || r.city || r.region || '').toLowerCase();
      const id = String(r.id || '').toLowerCase();
      return (
        id !== 'rep-101' &&
        id !== 'rep-102' &&
        id !== 'rep-103' &&
        !title.includes('puget sound estuary cove') &&
        !title.includes('victoria lake wetlands') &&
        !title.includes('upper mississippi river bend') &&
        !loc.includes('tacoma') &&
        !loc.includes('kisumu') &&
        !loc.includes('davenport') &&
        !r.isDemoReport &&
        !r.isDemo
      );
    });
  } catch (err) {
    return [];
  }
}

export function saveStoredReport(newReport) {
  const currentReports = getStoredReports();
  const updatedReports = [newReport, ...currentReports];
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
  return updatedReports;
}

// Missions Storage
export function getStoredMissions() {
  cleanDemoRecordsFromStorage();
  try {
    const data = localStorage.getItem(MISSIONS_KEY);
    if (!data) {
      const initial = getInitialMissions();
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    const cleaned = Array.isArray(parsed)
      ? parsed.filter((item) => !item.isDemoEvent && !String(item.title || item.name || '').includes('(Demo)'))
      : getInitialMissions();
    return cleaned;
  } catch (err) {
    return getInitialMissions();
  }
}

export function saveStoredMission(newMission) {
  const currentMissions = getStoredMissions();
  // Ensure user-created missions default to unverified
  const missionWithStatus = {
    ...newMission,
    verificationStatus: newMission.verificationStatus || 'unverified'
  };
  const updatedMissions = [missionWithStatus, ...currentMissions];
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(updatedMissions));
  return updatedMissions;
}

export function updateStoredMission(updatedMission) {
  const currentMissions = getStoredMissions();
  const updatedList = currentMissions.map((m) =>
    m.id === updatedMission.id ? { ...m, ...updatedMission } : m
  );
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(updatedList));
  return updatedList;
}

// Joined Missions Storage
export function getJoinedMissionIds() {
  try {
    const data = localStorage.getItem(JOINED_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export function toggleJoinedMission(missionId) {
  const current = getJoinedMissionIds();
  let updated;
  if (current.includes(missionId)) {
    updated = current.filter((id) => id !== missionId);
  } else {
    updated = [...current, missionId];
  }
  localStorage.setItem(JOINED_KEY, JSON.stringify(updated));
  return updated;
}

// Profile management
export function getStoredProfile() {
  cleanDemoRecordsFromStorage();
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    const parsed = JSON.parse(data);
    if (parsed && (parsed.name === 'Elena Rostova' || parsed.id === 'guardian-001')) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    return parsed;
  } catch (err) {
    return INITIAL_PROFILE;
  }
}

export function saveStoredProfile(updatedProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
  return updatedProfile;
}

// Participation records
export function getStoredParticipations() {
  cleanDemoRecordsFromStorage();
  try {
    const data = localStorage.getItem(PARTICIPATIONS_KEY);
    if (!data) {
      localStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(INITIAL_PARTICIPATIONS));
      return INITIAL_PARTICIPATIONS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed)
      ? parsed.filter((item) => !item.isDemoEvent && !String(item.title || '').includes('(Demo)') && !String(item.title || '').includes('Puget Sound'))
      : INITIAL_PARTICIPATIONS;
  } catch (err) {
    return INITIAL_PARTICIPATIONS;
  }
}

export function saveParticipationRecord(record) {
  const records = getStoredParticipations();
  const existingIndex = records.findIndex(
    (r) => (r.id === record.id || r.missionId === record.missionId)
  );
  let updated;
  if (existingIndex >= 0) {
    updated = [...records];
    updated[existingIndex] = { ...updated[existingIndex], ...record };
  } else {
    updated = [record, ...records];
  }
  localStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(updated));
  return updated;
}

export function removeParticipationRecord(targetId) {
  if (!targetId) return getStoredParticipations();

  console.log('[AquaRise Participation] removeParticipationRecord called for:', targetId);

  // 1. Clear PARTICIPATIONS_KEY ('aquarise_participations')
  const records = getStoredParticipations();
  const updatedParticipations = records.filter((r) => {
    if (!r) return false;
    const rId = r.id || r.participationRecordId;
    const rMissionId = r.missionId || r.cleanupMissionId;
    return rId !== targetId && rMissionId !== targetId;
  });
  localStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(updatedParticipations));

  // 2. Clear JOINED_KEY ('aquarise_joined_missions')
  const joined = getJoinedMissionIds();
  const updatedJoined = joined.filter((id) => id !== targetId);
  localStorage.setItem(JOINED_KEY, JSON.stringify(updatedJoined));

  // 3. Clear legacy key ('aquarise_user_participation')
  try {
    const userPartData = localStorage.getItem('aquarise_user_participation');
    if (userPartData) {
      const parsed = JSON.parse(userPartData);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item) => {
          if (!item) return false;
          const itemId = item.id || item.originalId || item.missionId;
          return itemId !== targetId;
        });
        localStorage.setItem('aquarise_user_participation', JSON.stringify(cleaned));
      }
    }
  } catch (err) {}

  // 4. Dispatch custom event for live window synchronization
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aquarise_participation_changed', {
      detail: { action: 'remove', id: targetId }
    }));
  }

  return updatedParticipations;
}

// Certificate management
export function getStoredCertificates() {
  cleanDemoRecordsFromStorage();
  try {
    const data = localStorage.getItem(CERTIFICATES_KEY);
    if (!data) {
      localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed)
      ? parsed.filter((item) => !item.isDemoEvent && !String(item.waterbodyName || '').includes('Puget Sound') && !String(item.waterbodyName || '').includes('Lake Erie'))
      : INITIAL_CERTIFICATES;
  } catch (err) {
    return INITIAL_CERTIFICATES;
  }
}

export function saveCertificateRecord(newCert) {
  const current = getStoredCertificates();
  const updated = [newCert, ...current.filter((c) => c.id !== newCert.id)];
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(updated));
  return updated;
}

export function findCertificateById(certId) {
  const certs = getStoredCertificates();
  return certs.find((c) => c.id === certId || c.certificateId === certId) || null;
}
