import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, CheckCircle2, ShieldAlert, Loader2, Compass, AlertCircle } from 'lucide-react';
import { geocodeLocation } from '../../services/geocodingService';
import { saveStoredReport } from '../../utils/storage';

export default function ReportPollutionModal({ isOpen, onClose, onSubmitSuccess, onNavigateReport, profile }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'River',
    urgency: 'High',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const waterbodyName = formData.name.trim();
    const locationInput = formData.location.trim();
    const description = formData.description.trim();

    if (!waterbodyName) {
      setErrorMessage('Please enter the name of the waterbody.');
      return;
    }

    if (!locationInput) {
      setErrorMessage('Please enter the location (City, Region, or Country).');
      return;
    }

    if (!description || description.length < 10) {
      setErrorMessage('Please provide a pollution description of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Geocode location string to Lat/Lng coordinates using Nominatim API
      let coords = { lat: 20.0, lng: 0.0 };
      let exactLabel = locationInput;

      const geoResult = await geocodeLocation({ query: locationInput });
      if (geoResult && typeof geoResult.lat === 'number' && typeof geoResult.lng === 'number') {
        coords = { lat: geoResult.lat, lng: geoResult.lng };
        if (geoResult.displayName) {
          exactLabel = geoResult.displayName;
        }
      }

      // 2. Parse location string into city, region, country
      const parts = locationInput.split(',').map((s) => s.trim()).filter(Boolean);
      const city = parts[0] || 'Unknown City';
      const country = parts[parts.length - 1] || 'Unknown Country';
      const region = parts.length > 2 ? parts[1] : '';

      // 3. Map to CANONICAL REPORT SCHEMA expected by ReportPollutionView & CommunityView
      const newReport = {
        id: `rep-${Date.now()}`,
        waterbodyName: waterbodyName,
        waterbodyType: formData.type || 'River',
        country: country,
        city: city,
        region: region,
        locationDescription: locationInput,
        coordinates: coords,
        exactLocationLabel: exactLabel,
        pollutionSeverity: formData.urgency === 'High Urgency' ? 'High' : (formData.urgency || 'High'),
        pollutionTypes: ['Plastic waste', 'Household trash'],
        description: description,
        affectedArea: 'Localized shoreline/waterway area',
        wildlifeAffected: false,
        additionalNotes: '',
        images: [],
        reporterName: profile?.name || profile?.fullName || 'AquaRise Guardian',
        submittedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        status: 'Pending Verification'
      };

      // 4. Save using canonical submission callback passed from App.jsx
      if (onSubmitSuccess) {
        await onSubmitSuccess(newReport);
      } else {
        saveStoredReport(newReport);
      }

      // 5. Dispatch storage event for atomic view state update across all open components
      window.dispatchEvent(new CustomEvent('aquarise_report_created', { detail: newReport }));

      setIsSubmitting(false);
      setFormData({
        name: '',
        location: '',
        type: 'River',
        urgency: 'High',
        description: '',
      });
      onClose();
    } catch (err) {
      console.error('[AquaRise Modal Report] Persistence error:', err);
      setErrorMessage("We couldn't submit your pollution report right now. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleOpenFullMapForm = () => {
    onClose();
    if (onNavigateReport) {
      onNavigateReport();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative text-ocean-950">
        
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-ocean-950 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-[#19887F]">
              <AlertTriangle className="w-6 h-6 text-[#19887F]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-ocean-950">Report a Polluted Waterbody</h3>
              <p className="text-xs text-slate-600 font-medium">Alert the AquaRise community to waterbodies needing attention.</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Waterbody Name *</label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. Muddy Creek or Silver Lake West"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Waterbody Type *</label>
                <select
                  value={formData.type}
                  disabled={isSubmitting}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                >
                  <option value="River">River / Stream</option>
                  <option value="Lake">Lake / Pond</option>
                  <option value="Beach">Beach / Coast</option>
                  <option value="Wetland">Wetland / Mangrove</option>
                  <option value="Estuary">Estuary / Bay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Pollution Level *</label>
                <select
                  value={formData.urgency}
                  disabled={isSubmitting}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High Urgency</option>
                  <option value="Moderate">Moderate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Location (City, Country) *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. Valparaíso, Chile or Seattle, WA, USA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Pollution Description *</label>
              <textarea
                rows="3"
                required
                disabled={isSubmitting}
                placeholder="Describe visible waste, oil slicks, foam, or environmental hazards..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
              ></textarea>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">Community reports are saved to your profile, logged in local storage, and visible in the AquaRise Community map & directory.</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Geocoding & Saving Report...</span>
                  </>
                ) : (
                  <span>Submit Pollution Report</span>
                )}
              </button>

              {onNavigateReport && (
                <button
                  type="button"
                  onClick={handleOpenFullMapForm}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-full bg-white hover:bg-teal-50 text-[#19887F] font-bold text-xs border border-[#92F1EC] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#19887F]" />
                  <span>Open Full Interactive Map Page</span>
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
