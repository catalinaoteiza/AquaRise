import { BaseProviderAdapter } from './baseProviderAdapter';
import { normalizeDiscoveryResult } from '../resultNormalizer';

export class ServerApiProxyAdapter extends BaseProviderAdapter {
  constructor() {
    super('ServerApiProxyAdapter');
    this.cache = new Map();
  }

  async searchWaterbodies(query = '', filters = {}) {
    const cacheKey = `wb_${query.toLowerCase().trim()}_${filters.country || 'All'}_${filters.type || 'All'}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `/api/discovery/search?q=${encodeURIComponent(query)}&country=${encodeURIComponent(filters.country || '')}&type=${encodeURIComponent(filters.type || '')}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server discovery proxy returned status ${response.status}`);
      }

      const data = await response.json();

      if (!data.success && data.error) {
        console.warn('Server discovery proxy warning:', data.error);
        return [];
      }

      const rawResults = data.results || [];
      const normalized = rawResults.map((item) =>
        normalizeDiscoveryResult(
          {
            ...item,
            contentType: 'Live / Sourced',
            isDemoEvent: false,
            isLiveSourced: true
          },
          'Live / Sourced'
        )
      );

      this.cache.set(cacheKey, normalized);
      return normalized;
    } catch (err) {
      console.warn('ServerApiProxyAdapter fetch failed:', err);
      return [];
    }
  }

  async searchCleanupEvents(waterbodyId, query = '') {
    const searchQuery = query || 'beach river cleanup volunteer';
    const cacheKey = `evt_${searchQuery.toLowerCase().trim()}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `/api/discovery/search?q=${encodeURIComponent(searchQuery)}&type=cleanup`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = await response.json();
      if (!data.success || !data.results) return [];

      // Extract items containing verified cleanup events
      const events = data.results
        .filter((item) => item.cleanupEvent && item.cleanupStatus === 'External Organization Event')
        .map((item) => item.cleanupEvent);

      this.cache.set(cacheKey, events);
      return events;
    } catch (err) {
      console.warn('ServerApiProxyAdapter searchCleanupEvents failed:', err);
      return [];
    }
  }
}
