/**
 * AquaRise Regional Network Aggregator
 * Dynamically derives regional networks from genuine AquaRise data (stored profiles, user community missions, user reports).
 * Does NOT fabricate membership counts or use external search results.
 */

export function getDerivedRegionalNetworks(profile, missions = [], reports = []) {
  const networksMap = new Map();

  const addRecord = (country, city, region, type, item) => {
    if (!country && !city && !region) return;
    
    // Normalize region identifier
    const locationName = (country || city || region || 'Global').trim();
    if (!locationName) return;

    const key = locationName.toLowerCase();
    const networkName = `${locationName} Guardian Network`;

    if (!networksMap.has(key)) {
      networksMap.set(key, {
        id: key,
        name: networkName,
        location: [city, region, country].filter(Boolean).join(', ') || locationName,
        guardians: new Set(),
        missions: [],
        reports: []
      });
    }

    const net = networksMap.get(key);

    if (type === 'profile' && item.name) {
      net.guardians.add(item.name);
    } else if (type === 'mission') {
      if (!net.missions.some((m) => m.id === item.id)) {
        net.missions.push(item);
      }
      if (item.organizer && item.organizer !== 'Organizer not provided') {
        net.guardians.add(item.organizer);
      }
    } else if (type === 'report') {
      if (!net.reports.some((r) => r.id === item.id)) {
        net.reports.push(item);
      }
      if (item.reporterName) {
        net.guardians.add(item.reporterName);
      }
    }
  };

  // 1. Process active user profile if location is set
  if (profile && (profile.country || profile.city || profile.region)) {
    addRecord(profile.country, profile.city, profile.region, 'profile', profile);
  }

  // 2. Process genuine user-created community missions
  (Array.isArray(missions) ? missions : []).forEach((m) => {
    if (m && !m.isDemoEvent && m.isUserCreated) {
      addRecord(m.country, m.city, m.region, 'mission', m);
    }
  });

  // 3. Process genuine user-submitted pollution reports
  (Array.isArray(reports) ? reports : []).forEach((r) => {
    if (r && !r.isDemo) {
      addRecord(r.country, r.city, r.region, 'report', r);
    }
  });

  // Convert map to array and format guardian counts
  const result = [];
  networksMap.forEach((net) => {
    const count = net.guardians.size || (net.missions.length > 0 || net.reports.length > 0 ? 1 : 0);
    if (count > 0 || net.missions.length > 0 || net.reports.length > 0) {
      result.push({
        id: net.id,
        name: net.name,
        location: net.location,
        guardianCount: count,
        guardiansText: `${count} Guardian${count === 1 ? '' : 's'} active in region`,
        missions: net.missions,
        reports: net.reports,
        guardianList: Array.from(net.guardians)
      });
    }
  });

  return result;
}
