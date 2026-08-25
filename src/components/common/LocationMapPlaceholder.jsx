import React, { useState } from 'react';
import { MapPin, Navigation, Layers, Compass, ExternalLink } from 'lucide-react';

export default function LocationMapPlaceholder({ locationName, coordinates, region, country }) {
  const [mapMode, setMapMode] = useState('satellite');

  return (
    <div className="glass-panel rounded-2xl border border-ocean-700/80 overflow-hidden space-y-0">
      
      {/* Map Header Toolbar */}
      <div className="p-4 bg-ocean-900/90 border-b border-ocean-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Navigation className="w-4 h-4 text-aqua-400" />
          <span>Interactive Location Coordinates</span>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-ocean-950 p-1 rounded-lg border border-ocean-700">
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              mapMode === 'satellite' ? 'bg-aqua-500 text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapMode('terrain')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              mapMode === 'terrain' ? 'bg-aqua-500 text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setMapMode('hydrology')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              mapMode === 'hydrology' ? 'bg-aqua-500 text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hydrology
          </button>
        </div>
      </div>

      {/* Map Graphic Canvas Container */}
      <div className="relative h-64 sm:h-72 w-full bg-ocean-950 overflow-hidden flex items-center justify-center">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
        
        {/* Animated Radial Water Ring */}
        <div className="absolute w-48 h-48 rounded-full bg-aqua-500/10 border border-aqua-500/30 animate-ping pointer-events-none"></div>
        <div className="absolute w-72 h-72 rounded-full bg-emerald/10 border border-emerald/20 pointer-events-none"></div>

        {/* Center Pin Marker */}
        <div className="relative z-10 flex flex-col items-center animate-float">
          <div className="p-3 rounded-full bg-gradient-to-tr from-ocean-600 to-aqua-500 text-white shadow-2xl shadow-aqua-500/50 border-2 border-white ring-4 ring-aqua-500/30">
            <MapPin className="w-7 h-7" />
          </div>

          <div className="mt-2 px-3 py-1 rounded-full bg-ocean-900/90 backdrop-blur-md text-white text-xs font-extrabold border border-aqua-500/40 shadow-lg text-center">
            {locationName}
          </div>
        </div>

        {/* Map Coordinates Overlay Badge */}
        <div className="absolute bottom-3 left-3 bg-ocean-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-ocean-700 text-[11px] text-slate-300 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-aqua-400" />
          <span>Lat: <strong className="text-white">{coordinates?.lat ?? '0.000'}</strong></span>
          <span>Lng: <strong className="text-white">{coordinates?.lng ?? '0.000'}</strong></span>
        </div>

        {/* Modular Map Notice */}
        <div className="absolute top-3 right-3 bg-ocean-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-ocean-700 text-[10px] text-slate-400">
          🗺️ GIS Map Placeholder • Ready for Leaflet / Mapbox API
        </div>

      </div>

      {/* Map Footer Info */}
      <div className="p-4 bg-ocean-900/60 border-t border-ocean-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Region: <strong className="text-white">{region}, {country}</strong></span>
        <span className="text-[11px] text-slate-400">Exact GPS coordinates stored for field Guardians check-in</span>
      </div>

    </div>
  );
}
