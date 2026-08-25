import React, { useState } from 'react';
import { AlertTriangle, MapPin, Camera, CheckCircle2, ShieldAlert, X, Image as ImageIcon, ArrowRight, Flag, Compass, AlertCircle, Search, Loader2, ExternalLink } from 'lucide-react';
import InteractiveLeafletMap from '../common/InteractiveLeafletMap';
import { geocodeLocation, reverseGeocodeLocation } from '../../services/geocodingService';

export default function ReportPollutionView({ onSubmitReportSuccess, onNavigateExplore, onViewReport, onProposeCleanup }) {
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [geocodeNotice, setGeocodeNotice] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [exactLocationLabel, setExactLocationLabel] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [formData, setFormData] = useState({
    waterbodyName: '',
    waterbodyType: 'River',
    country: '',
    city: '',
    region: '',
    locationDescription: '',
    pollutionSeverity: 'High',
    pollutionTypes: ['Plastic waste', 'Household trash'],
    description: '',
    affectedArea: '',
    wildlifeAffected: false,
    additionalNotes: '',
    coordinates: { lat: null, lng: null }
  });

  const [images, setImages] = useState([]);

  const waterbodyTypes = [
    'River',
    'Lake',
    'Beach',
    'Pond',
    'Wetland',
    'Coast',
    'Canal',
    'Other'
  ];

  const availablePollutionTypes = [
    'Plastic waste',
    'Household trash',
    'Fishing waste',
    'Industrial waste',
    'Oil/chemical pollution',
    'Illegal dumping',
    'Sewage',
    'Other'
  ];

  const handlePollutionTypeToggle = (type) => {
    setErrorMessage('');
    if (formData.pollutionTypes.includes(type)) {
      setFormData((prev) => ({
        ...prev,
        pollutionTypes: prev.pollutionTypes.filter((t) => t !== type)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        pollutionTypes: [...prev.pollutionTypes, type]
      }));
    }
  };

  // Image Upload Handling (Local FileReader previews)
  const handleImageChange = (e) => {
    setErrorMessage('');
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Each image must be smaller than 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Geocoding Handler (Section 2, 3, 4, 9)
  const handleTriggerGeocode = async () => {
    const { city, region, country } = formData;
    if (!city && !country) {
      setGeocodeNotice('');
      return;
    }

    setIsGeocoding(true);
    setGeocodeNotice('');

    const res = await geocodeLocation({ city, region, country });
    setIsGeocoding(false);

    if (res && res.lat && res.lng) {
      setFormData((prev) => ({
        ...prev,
        coordinates: { lat: res.lat, lng: res.lng }
      }));
      setGeocodeNotice(`Map located: ${res.displayName.split(',').slice(0, 3).join(',')}`);
      if (res.displayName) {
        setExactLocationLabel(res.displayName);
      }
    } else {
      setGeocodeNotice("We couldn't locate this place automatically. Please select the location manually on the map.");
    }
  };

  // Reverse Geocoding Handler when map marker pin moves (Section 3 & 4 - Does NOT overwrite broad location fields)
  const handleLocationSelect = async (coords) => {
    setFormData((prev) => ({ ...prev, coordinates: coords }));
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      setIsReverseGeocoding(true);
      const res = await reverseGeocodeLocation(coords);
      setIsReverseGeocoding(false);
      if (res && res.displayName) {
        setExactLocationLabel(res.displayName);
      }
    }
  };

  const isFormDirty = Boolean(
    formData.waterbodyName.trim() ||
    formData.country.trim() ||
    formData.city.trim() ||
    formData.description.trim() ||
    images.length > 0
  );

  const handleCancelClick = () => {
    if (isFormDirty) {
      setShowDiscardModal(true);
    } else {
      onNavigateExplore();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.waterbodyName.trim()) {
      setErrorMessage('Please enter the name of the waterbody.');
      return;
    }

    if (!formData.country.trim() || !formData.city.trim()) {
      setErrorMessage('Please provide the country and city location.');
      return;
    }

    if (!formData.pollutionTypes.length) {
      setErrorMessage('Please select at least one main pollution type.');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setErrorMessage('Please describe the observed pollution (at least 10 characters).');
      return;
    }

    const finalCoords = (formData.coordinates.lat && formData.coordinates.lng)
      ? formData.coordinates
      : { lat: 20.0, lng: 0.0 };

    const newReport = {
      id: `rep-${Date.now()}`,
      waterbodyName: formData.waterbodyName.trim(),
      waterbodyType: formData.waterbodyType,
      country: formData.country.trim(),
      city: formData.city.trim(),
      region: formData.region.trim(),
      locationDescription: formData.locationDescription.trim(),
      coordinates: finalCoords,
      exactLocationLabel: exactLocationLabel.trim() || [formData.city.trim(), formData.region.trim(), formData.country.trim()].filter(Boolean).join(', '),
      pollutionSeverity: formData.pollutionSeverity,
      pollutionTypes: formData.pollutionTypes,
      description: formData.description.trim(),
      affectedArea: formData.affectedArea.trim() || 'Localized shoreline area',
      wildlifeAffected: formData.wildlifeAffected,
      images: images.length > 0 ? images : [],
      additionalNotes: formData.additionalNotes.trim(),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Community Report',
      isCommunityReport: true,
      disclaimer: 'Community-submitted information may not yet be independently verified.'
    };

    onSubmitReportSuccess(newReport);
    setSubmittedReport(newReport);
  };

  return (
    <div className="min-h-screen bg-[#DAF6F6] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {!submittedReport ? (
          <div className="space-y-8">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#19887F]/10 border border-[#19887F]/30 text-[#19887F] text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-[#19887F]" />
                <span>Community Environmental Action</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-ocean-950">
                Report a <span className="text-[#076DDF]">Polluted Waterbody</span>
              </h1>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                Help the AquaRise community identify lakes, rivers, beaches, ponds, wetlands, and other waterbodies that need urgent environmental attention.
              </p>
            </div>

            {/* Validation Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Report Form Card */}
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-[#92F1EC] shadow-xl space-y-6">
              
              {/* Waterbody Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">
                    Waterbody Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rio Mapocho or Silver Lake Inlet"
                    value={formData.waterbodyName}
                    onChange={(e) => setFormData({ ...formData, waterbodyName: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">
                    Waterbody Type *
                  </label>
                  <select
                    value={formData.waterbodyType}
                    onChange={(e) => setFormData({ ...formData, waterbodyType: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3.5 py-3 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  >
                    {waterbodyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Fields & Geocode Action (Section 2, 4) */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">Country *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chile"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      onBlur={handleTriggerGeocode}
                      className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">City / Town *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Santiago"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      onBlur={handleTriggerGeocode}
                      className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">Region / Province</label>
                    <input
                      type="text"
                      placeholder="e.g. Metropolitana"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      onBlur={handleTriggerGeocode}
                      className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerGeocode();
                    }}
                    disabled={isGeocoding}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#076DDF] text-xs font-bold border border-teal-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {isGeocoding ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-[#076DDF]" />
                    )}
                    <span>Locate City on Map</span>
                  </button>

                  {geocodeNotice && (
                    <span className={`text-xs font-medium ${geocodeNotice.includes("couldn't") ? 'text-rose-600' : 'text-[#19887F]'}`}>
                      {geocodeNotice}
                    </span>
                  )}
                </div>
              </div>

              {/* Location Description */}
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">
                  Location Description / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Mapocho riverbank off Avenida Andres Bello pier"
                  value={formData.locationDescription}
                  onChange={(e) => setFormData({ ...formData, locationDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              {/* Real Interactive Leaflet Location Map (Section 1, 4, 5, 7, 8) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                  Interactive Geotagged Location Map *
                </label>
                <InteractiveLeafletMap
                  initialLat={formData.coordinates.lat}
                  initialLng={formData.coordinates.lng}
                  onLocationSelect={handleLocationSelect}
                  height="300px"
                />

                {/* Exact Location Breakdown (Section 2, 3, 4, 5) */}
                {formData.coordinates.lat && formData.coordinates.lng && (
                  <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs space-y-2.5 shadow-sm mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold uppercase text-[#19887F] tracking-wider flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-4 h-4 text-[#076DDF]" />
                        Exact Location
                      </span>

                      <a
                        href={`https://www.openstreetmap.org/?mlat=${formData.coordinates.lat}&mlon=${formData.coordinates.lng}#map=17/${formData.coordinates.lat}/${formData.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#076DDF] hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-teal-200 shadow-2xs cursor-pointer"
                      >
                        <span>Open in OpenStreetMap</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-1">
                      <p className="text-ocean-950 font-bold text-sm leading-snug">
                        {isReverseGeocoding ? (
                          <span className="text-slate-400 font-normal flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#19887F]" />
                            Resolving exact address...
                          </span>
                        ) : (
                          exactLocationLabel || [formData.city, formData.region, formData.country].filter(Boolean).join(', ') || 'Pin-selected location'
                        )}
                      </p>
                      <p className="text-slate-600 font-mono text-xs">
                        GPS Coordinates: <strong className="text-[#19887F]">{formData.coordinates.lat}</strong>, <strong className="text-[#19887F]">{formData.coordinates.lng}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Severity Level (Explicit type="button") */}
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-2">
                  Pollution Severity Level *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Moderate', label: 'Moderate', activeBg: 'bg-teal-600 text-white border-teal-600' },
                    { id: 'High', label: 'High Urgency', activeBg: 'bg-amber-600 text-white border-amber-600' },
                    { id: 'Critical', label: 'Critical', activeBg: 'bg-rose-600 text-white border-rose-600' }
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, pollutionSeverity: level.id }));
                      }}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        formData.pollutionSeverity === level.id
                          ? `${level.activeBg} shadow-md`
                          : 'bg-white border-teal-200 text-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Pollution Types Chips (Explicit type="button") */}
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-2">
                  Main Pollution Types (Select all that apply) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availablePollutionTypes.map((type) => {
                    const selected = formData.pollutionTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePollutionTypeToggle(type);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left cursor-pointer transition-all ${
                          selected
                            ? 'bg-[#19887F] border-[#19887F] text-white shadow-sm'
                            : 'bg-white border-teal-200 text-ocean-950 hover:border-[#19887F]'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '} {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">
                  Pollution Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe waste density, choking plastics, industrial runoff, chemical odors, or wildlife risks observed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                ></textarea>
              </div>

              {/* Affected Area & Wildlife Toggle (Explicit type="button") */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">
                    Estimated Affected Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ~1.2 km shoreline"
                    value={formData.affectedArea}
                    onChange={(e) => setFormData({ ...formData, affectedArea: e.target.value })}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">
                    Wildlife Visibly Affected?
                  </label>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, wildlifeAffected: true });
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                        formData.wildlifeAffected
                          ? 'bg-rose-100 border-rose-400 text-rose-800'
                          : 'bg-white border-teal-200 text-slate-600 hover:border-teal-300'
                      }`}
                    >
                      Yes (Fish, birds, fauna)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, wildlifeAffected: false });
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                        !formData.wildlifeAffected
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                          : 'bg-white border-teal-200 text-slate-600 hover:border-teal-300'
                      }`}
                    >
                      No obvious signs
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Upload with Previews (Explicit type="button") */}
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-2">
                  Photo Evidence Upload <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {images.map((imgSrc, index) => (
                      <div key={index} className="relative h-24 rounded-xl overflow-hidden border border-teal-200 group">
                        <img src={imgSrc} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="p-5 border-2 border-dashed border-teal-300 rounded-2xl text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer block">
                  <Camera className="w-6 h-6 text-[#19887F] mx-auto mb-1" />
                  <span className="text-xs text-ocean-950 font-bold block">Click to select photos from your device</span>
                  <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1.5">Additional Notes</label>
                <textarea
                  rows="2"
                  placeholder="Access notes, safety hazards, or equipment suggestions..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                ></textarea>
              </div>

              {/* Action Buttons: Cancel (type="button") & Submit (ONLY type="submit") (Section 8) */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-teal-200">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  Submit Pollution Report
                </button>
              </div>

            </form>

          </div>
        ) : (
          /* Success Screen */
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#92F1EC] shadow-xl text-center space-y-6 animate-fadeIn">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-600 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-xs font-bold tracking-widest text-[#19887F] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Community Report Registered
              </span>
              <h2 className="text-3xl font-black text-ocean-950">Thank you for helping protect our waters.</h2>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Your report for <strong>{submittedReport.waterbodyName}</strong> has been added to the AquaRise community system.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 max-w-md mx-auto text-xs text-slate-700 flex items-center justify-around">
              <div>
                <span className="text-slate-500 block">Report ID</span>
                <strong className="text-ocean-950 font-mono">{submittedReport.id}</strong>
              </div>
              <div className="w-px h-6 bg-teal-200"></div>
              <div>
                <span className="text-slate-500 block">Initial Status</span>
                <strong className="text-[#19887F]">{submittedReport.status}</strong>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onViewReport(submittedReport)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                View Details
              </button>

              <button
                type="button"
                onClick={onNavigateExplore}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs border border-teal-200 transition-all cursor-pointer"
              >
                Explore Waterbodies
              </button>

              <button
                type="button"
                onClick={() => onProposeCleanup(submittedReport)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#19887F] hover:bg-[#35AEAC] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Flag className="w-4 h-4 text-white" />
                <span>Propose Cleanup</span>
              </button>
            </div>

          </div>
        )}

        {/* Discard Confirmation Safety Modal */}
        {showDiscardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white max-w-md w-full rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-2xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-ocean-950">Discard this unfinished pollution report?</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Your entered report details will be discarded and will not be saved.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
                  className="flex-1 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardModal(false);
                    onNavigateExplore();
                  }}
                  className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
