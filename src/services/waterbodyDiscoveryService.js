/**
 * Waterbody Discovery Service
 * Responsible for querying real waterbodies and environmental context.
 */

export class WaterbodyDiscoveryService {
  constructor(providerAdapter) {
    this.adapter = providerAdapter;
  }

  setAdapter(newAdapter) {
    this.adapter = newAdapter;
  }

  async discoverWaterbodies(query = '', filters = {}) {
    try {
      return await this.adapter.searchWaterbodies(query, filters);
    } catch (err) {
      console.error('Waterbody discovery failed:', err);
      throw err;
    }
  }
}
