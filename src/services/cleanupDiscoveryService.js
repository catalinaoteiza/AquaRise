/**
 * Cleanup Event Discovery Service
 * Responsible for discovering real external cleanup events.
 */

export class CleanupDiscoveryService {
  constructor(providerAdapter) {
    this.adapter = providerAdapter;
  }

  setAdapter(newAdapter) {
    this.adapter = newAdapter;
  }

  async discoverCleanupEvents(waterbodyId, query = '') {
    try {
      return await this.adapter.searchCleanupEvents(waterbodyId, query);
    } catch (err) {
      console.error('Cleanup event discovery failed:', err);
      throw err;
    }
  }
}
