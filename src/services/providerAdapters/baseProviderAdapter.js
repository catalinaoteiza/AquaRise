/**
 * Base Provider Adapter Interface
 * All search providers (Tavily, Serper, Demo Adapter, Server API proxy) must implement this interface.
 */
export class BaseProviderAdapter {
  constructor(name = 'BaseProvider') {
    this.name = name;
  }

  /**
   * Search waterbodies with environmental context
   * @param {string} query
   * @param {object} filters
   * @returns {Promise<Array>}
   */
  async searchWaterbodies(query, filters = {}) {
    throw new Error(`searchWaterbodies method not implemented in ${this.name}`);
  }

  /**
   * Search external cleanup events for a specific waterbody
   * @param {string} waterbodyId
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async searchCleanupEvents(waterbodyId, query = '') {
    throw new Error(`searchCleanupEvents method not implemented in ${this.name}`);
  }
}
