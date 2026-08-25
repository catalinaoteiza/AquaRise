import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Compass, Navigation, ExternalLink } from 'lucide-react';

export default function InteractiveLeafletMap({
  initialLat,
  initialLng,
  onLocationSelect,
  height = '280px',
  readOnly = false
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  const hasCoords = Boolean(initialLat && initialLng && !isNaN(Number(initialLat)) && !isNaN(Number(initialLng)));
  const defaultLat = hasCoords ? Number(initialLat) : 20.0;
  const defaultLng = hasCoords ? Number(initialLng) : 0.0;
  const defaultZoom = hasCoords ? 13 : 2;

  const [coordinates, setCoordinates] = useState({
    lat: hasCoords ? Number(initialLat) : null,
    lng: hasCoords ? Number(initialLng) : null
  });
  const [isMapReady, setIsMapReady] = useState(false);

  // Load Leaflet CSS & JS dynamically if needed
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS script
      if (!window.L) {
        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        } else {
          await new Promise((resolve) => {
            const checkL = setInterval(() => {
              if (window.L) {
                clearInterval(checkL);
                resolve();
              }
            }, 50);
          });
        }
      }

      if (isMounted && window.L) {
        setIsMapReady(true);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map instance once Leaflet is ready
  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current || leafletMapRef.current || !window.L) return;

    const L = window.L;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      scrollWheelZoom: !readOnly,
      dragging: !readOnly,
      tap: true
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Marker Icon
    const customIcon = L.divIcon({
      className: 'aquarise-leaflet-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #076DDF;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 12px rgba(7,109,223,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Create Initial Marker if coordinates exist
    let marker = null;
    if (hasCoords) {
      marker = L.marker([defaultLat, defaultLng], {
        icon: customIcon,
        draggable: !readOnly
      }).addTo(map);
      markerRef.current = marker;
    }

    leafletMapRef.current = map;

    // Handle Map Click to place marker (Section 5)
    if (!readOnly) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const newLat = Number(lat.toFixed(6));
        const newLng = Number(lng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          markerRef.current = L.marker([newLat, newLng], {
            icon: customIcon,
            draggable: true
          }).addTo(map);

          markerRef.current.on('dragend', () => {
            const position = markerRef.current.getLatLng();
            const pLat = Number(position.lat.toFixed(6));
            const pLng = Number(position.lng.toFixed(6));
            setCoordinates({ lat: pLat, lng: pLng });
            if (onLocationSelect) onLocationSelect({ lat: pLat, lng: pLng });
          });
        }

        setCoordinates({ lat: newLat, lng: newLng });
        if (onLocationSelect) {
          onLocationSelect({ lat: newLat, lng: newLng });
        }
      });

      if (markerRef.current) {
        markerRef.current.on('dragend', () => {
          const position = markerRef.current.getLatLng();
          const pLat = Number(position.lat.toFixed(6));
          const pLng = Number(position.lng.toFixed(6));
          setCoordinates({ lat: pLat, lng: pLng });
          if (onLocationSelect) onLocationSelect({ lat: pLat, lng: pLng });
        });
      }
    }

    // Force map container resize recalculation
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isMapReady]);

  // Dynamic View & Marker updates when initialLat / initialLng prop changes (Section 4)
  useEffect(() => {
    if (leafletMapRef.current && initialLat && initialLng) {
      const lat = Number(initialLat);
      const lng = Number(initialLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const L = window.L;
        leafletMapRef.current.setView([lat, lng], 13);

        const customIcon = L.divIcon({
          className: 'aquarise-leaflet-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #076DDF;
              border: 3px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(7,109,223,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else if (L) {
          markerRef.current = L.marker([lat, lng], {
            icon: customIcon,
            draggable: !readOnly
          }).addTo(leafletMapRef.current);

          if (!readOnly) {
            markerRef.current.on('dragend', () => {
              const position = markerRef.current.getLatLng();
              const pLat = Number(position.lat.toFixed(6));
              const pLng = Number(position.lng.toFixed(6));
              setCoordinates({ lat: pLat, lng: pLng });
              if (onLocationSelect) onLocationSelect({ lat: pLat, lng: pLng });
            });
          }
        }

        setCoordinates({ lat, lng });
      }
    }
  }, [initialLat, initialLng, readOnly]);

  const osmUrl = coordinates.lat && coordinates.lng
    ? `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=15/${coordinates.lat}/${coordinates.lng}`
    : 'https://www.openstreetmap.org';

  return (
    <div className="bg-white rounded-2xl border border-[#92F1EC] overflow-hidden shadow-sm space-y-0">
      
      {/* Map Header Toolbar */}
      <div className="p-3 bg-teal-50/80 border-b border-teal-200 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-ocean-950 font-bold">
          <Navigation className="w-4 h-4 text-[#076DDF]" />
          <span>{readOnly ? 'Verified Geotagged Location' : 'Interactive Location Map Picker'}</span>
        </div>

        {/* Functional OpenStreetMap Link (Section 7) */}
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] font-bold text-[#076DDF] hover:underline bg-white px-2.5 py-1 rounded-full border border-teal-200 shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
          title="Open location on OpenStreetMap website"
        >
          <span>Open in OpenStreetMap</span>
          <ExternalLink className="w-3 h-3 text-[#076DDF]" />
        </a>
      </div>

      {/* Map Container */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0 bg-slate-100"
          onClick={(e) => e.stopPropagation()}
        />

        {!isMapReady && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-xs font-bold text-[#19887F] space-x-2">
            <div className="w-4 h-4 border-2 border-[#19887F] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading interactive map tiles...</span>
          </div>
        )}

        {/* Selected Coordinates Overlay Badge */}
        {coordinates.lat && coordinates.lng && (
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-teal-200 text-xs text-ocean-950 flex items-center gap-2 shadow-md font-mono">
            <Compass className="w-4 h-4 text-[#076DDF] shrink-0" />
            <span>Latitude: <strong className="text-[#19887F] font-bold">{coordinates.lat}</strong></span>
            <span>Longitude: <strong className="text-[#19887F] font-bold">{coordinates.lng}</strong></span>
          </div>
        )}
      </div>

      {/* Map Instruction Footer */}
      {!readOnly && (
        <div className="p-2.5 bg-slate-50 border-t border-teal-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
          <span>Click/tap anywhere on the map or drag the pin marker to set exact GPS coordinates.</span>
        </div>
      )}
    </div>
  );
}
