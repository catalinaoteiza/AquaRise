/**
 * Free OpenStreetMap Nominatim Geocoding Service for AquaRise MVP
 * Converts Country, City, Region or Location queries into Latitude & Longitude coordinates.
 */
export async function geocodeLocation({ city, region, country, query }) {
  const parts = [city, region, country].filter(Boolean).map((s) => String(s).trim());
  const searchQuery = query || parts.join(', ');

  if (!searchQuery || searchQuery.length < 2) {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'AquaRise-Web/1.0 (Environmental Platform)'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const match = data[0];
      const lat = Number(Number(match.lat).toFixed(6));
      const lng = Number(Number(match.lon).toFixed(6));

      return {
        lat,
        lng,
        displayName: match.display_name
      };
    }

    return null;
  } catch (err) {
    console.warn('[AquaRise Geocoding] Nominatim query failed:', err);
    return null;
  }
}

/**
 * Free OpenStreetMap Nominatim Reverse Geocoding Service for AquaRise MVP
 * Converts Latitude & Longitude coordinates into a human-readable exact address label.
 */
export async function reverseGeocodeLocation({ lat, lng }) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'AquaRise-Web/1.0 (Environmental Platform)'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.display_name) {
      return {
        displayName: data.display_name,
        address: data.address || {}
      };
    }
    return null;
  } catch (err) {
    console.warn('[AquaRise Reverse Geocoding] Query failed:', err);
    return null;
  }
}
