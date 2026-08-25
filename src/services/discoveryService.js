import { WaterbodyDiscoveryService } from './waterbodyDiscoveryService';
import { CleanupDiscoveryService } from './cleanupDiscoveryService';
import { ServerApiProxyAdapter } from './providerAdapters/serverApiProxyAdapter';
import { normalizeDiscoveryResult } from './resultNormalizer';
import { verifySourceMetadata } from './sourceVerificationLayer';

class DiscoveryService {
  constructor() {
    this.serverAdapter = new ServerApiProxyAdapter();

    // Default to live ServerApiProxyAdapter (Tavily backend proxy)
    this.useDemoData = import.meta.env.VITE_USE_DEMO_DISCOVERY_DATA === 'true';
    this.activeAdapter = this.serverAdapter;

    this.waterbodyService = new WaterbodyDiscoveryService(this.activeAdapter);
    this.cleanupService = new CleanupDiscoveryService(this.activeAdapter);
  }

  /**
   * Set custom search adapter
   */
  setProviderAdapter(adapter) {
    this.activeAdapter = adapter;
    this.waterbodyService.setAdapter(adapter);
    this.cleanupService.setAdapter(adapter);
  }

  /**
   * Enable Live Tavily Provider explicitly
   */
  useLiveProvider() {
    this.useDemoData = false;
    this.setProviderAdapter(this.serverAdapter);
  }

  /**
   * Unified Search Engine
   * Returns normalized, verified discovery results
   */
  async search(query = '', filters = {}) {
    try {
      const liveItems = await this.serverAdapter.searchWaterbodies(query, filters);
      if (liveItems && liveItems.length > 0) {
        const normalizedLive = liveItems
          .map((item) => normalizeDiscoveryResult(item, 'Live / Sourced'))
          .filter((item) => !item.isDemoEvent && item.verificationStatus !== 'Unverified Demo');

        return {
          results: normalizedLive,
          isLive: true,
          providerName: 'Tavily Search API',
          error: null
        };
      }
      
      // If live search ran but returned 0 results
      return {
        results: [],
        isLive: true,
        providerName: 'Tavily Search API',
        error: null
      };
    } catch (err) {
      console.warn('Discovery search encountered an error:', err);
      return {
        results: [],
        isLive: true,
        providerName: 'Tavily Search API',
        error: 'Live discovery is temporarily unavailable.'
      };
    }
  }

  /**
   * Single waterbody lookup with external cleanup events check
   */
  async getWaterbodyWithCleanups(waterbodyId) {
    try {
      const events = await this.cleanupService.discoverCleanupEvents(waterbodyId);
      return (events || []).filter((e) => !e.isDemoEvent);
    } catch (err) {
      return [];
    }
  }
}

export const discoveryService = new DiscoveryService();
