import { BaseProviderAdapter } from './baseProviderAdapter';
import { MOCK_WATERBODIES } from '../../data/mockWaterbodies';
import { normalizeDiscoveryResult } from '../resultNormalizer';

export class DemoProviderAdapter extends BaseProviderAdapter {
  constructor() {
    super('DemoProviderAdapter');
  }

  async searchWaterbodies(query = '', filters = {}) {
    // Simulate slight network delay for realistic discovery loading state
    await new Promise((resolve) => setTimeout(resolve, 300));

    const q = query.toLowerCase().trim();

    const filtered = MOCK_WATERBODIES.filter((wb) => {
      const matchesQuery =
        !q ||
        wb.name?.toLowerCase().includes(q) ||
        wb.city?.toLowerCase().includes(q) ||
        wb.region?.toLowerCase().includes(q) ||
        wb.country?.toLowerCase().includes(q) ||
        wb.type?.toLowerCase().includes(q) ||
        wb.mainIssue?.toLowerCase().includes(q);

      const matchesCountry = !filters.country || filters.country === 'All' || wb.country === filters.country;
      const matchesType = !filters.type || filters.type === 'All' || wb.type?.toLowerCase().includes(filters.type.toLowerCase());
      const matchesAttention = !filters.attentionLevel || filters.attentionLevel === 'All' || wb.attentionLevel === filters.attentionLevel;

      return matchesQuery && matchesCountry && matchesType && matchesAttention;
    });

    return filtered.map((wb) =>
      normalizeDiscoveryResult(
        {
          ...wb,
          waterbodyName: wb.name,
          waterbodyType: wb.type,
          environmentalConcern: wb.mainIssue,
          environmentalSummary: wb.description,
          sourceName: wb.sourceName || 'Global Environmental Database (Demo)',
          sourceUrl: wb.sourceUrl || 'https://www.unep.org/resources/water-pollution-reports',
          lastChecked: wb.lastChecked || 'Aug 24, 2026',
          contentType: 'Demo'
        },
        'Demo'
      )
    );
  }

  async searchCleanupEvents(waterbodyId, query = '') {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const target = MOCK_WATERBODIES.find((w) => w.id === waterbodyId);
    if (!target || !target.cleanupEvent) return [];

    return [
      {
        id: target.cleanupEvent.id || `evt-${target.id}`,
        title: target.cleanupEvent.title,
        organizer: target.cleanupEvent.organizer,
        organizerType: target.cleanupEvent.organizerType || 'External Organization',
        date: target.cleanupEvent.date,
        location: target.cleanupEvent.meetingLocation || target.location,
        eventUrl: 'https://www.oceanconservancy.org/trash-free-seas/international-coastal-cleanup/',
        statusText: target.cleanupEvent.statusText
      }
    ];
  }
}
