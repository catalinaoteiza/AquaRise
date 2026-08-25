import React, { useState } from 'react';
import { AlertTriangle, MapPin, Camera, CheckCircle2, ShieldAlert, X, Image as ImageIcon, ArrowRight, Flag, Compass, AlertCircle, Search, Loader2, ExternalLink } from 'lucide-react';
import InteractiveLeafletMap from '../common/InteractiveLeafletMap';
import { geocodeLocation, reverseGeocodeLocation } from '../../services/geocodingService';

export default function ReportPollutionView({
  user,
  profile,
  onSubmitReportSuccess,
  onNavigateExplore,
  onViewReport,
  onProposeCleanup,
  onOpenAuth
}) {
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [geocodeNotice, setGeocodeNotice] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [exactLocationLabel, setExactLocationLabel] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user || !user.id) {
      setErrorMessage('Please sign in to file a community pollution report.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

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

    const newReportData = {
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
      additionalNotes: formData.additionalNotes.trim()
    };

    setIsSubmitting(true);

    try {
      if (onSubmitReportSuccess) {
        const res = await onSubmitReportSuccess(newReportData);
        if (res?.error) {
          setErrorMessage(res.error);
          setIsSubmitting(false);
          return;
        }
        if (res?.report) {
          setSubmittedReport(res.report);
        } else {
          setSubmittedReport(newReportData);
        }
      }
    } catch (err) {
      setErrorMessage("We couldn't submit your pollution report right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DAF6F6] pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {!submittedReport ? (
          <div className="space-y-8">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#19887F] text-xs font-black uppercase tracking-wider shadow-sm border border-[#92F1EC]">
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
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                  >
                    {waterbodyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Input (City, Region, Country) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                  Location (City, State/Region, Country) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City / Town *"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    onBlur={handleTriggerGeocode}
                    className="bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                  />
                  <input
                    type="text"
                    placeholder="State / Region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    onBlur={handleTriggerGeocode}
                    className="bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Country *"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    onBlur={handleTriggerGeocode}
                    className="bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                  />
                </div>

                {/* Geocode Notice */}
                {isGeocoding ? (
                  <div className="flex items-center gap-2 text-xs text-[#076DDF] font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Locating on map...</span>
                  </div>
                ) : geocodeNotice ? (
                  <p className="text-xs text-[#19887F] font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#19887F]" />
                    <span>{geocodeNotice}</span>
                  </p>
                ) : null}
              </div>

              {/* Map Coordinates Pin */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                    Interactive Field Map (Click pin to adjust location)
                  </label>
                  {isReverseGeocoding && (
                    <span className="text-[11px] text-[#076DDF] font-semibold flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Updating exact point...
                    </span>
                  )}
                </div>

                <InteractiveLeafletMap
                  initialLat={formData.coordinates.lat}
                  initialLng={formData.coordinates.lng}
                  onLocationSelect={handleLocationSelect}
                  height="280px"
                />

                {exactLocationLabel && (
                  <p className="text-xs text-slate-600 font-medium">
                    <strong className="text-ocean-950">Geotagged Point:</strong> {exactLocationLabel}
                  </p>
                )}
              </div>

              {/* Severity & Pollution Types */}
              <div className="space-y-4 pt-2 border-t border-teal-100">
                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-2">
                    Observed Pollution Severity *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Low', 'Moderate', 'High', 'Critical'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, pollutionSeverity: level })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formData.pollutionSeverity === level
                            ? 'bg-[#076DDF] text-white border-[#076DDF] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-teal-200 hover:bg-teal-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-2">
                    Observed Contaminants & Pollution Types * (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availablePollutionTypes.map((type) => {
                      const isSelected = formData.pollutionTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handlePollutionTypeToggle(type)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#19887F] text-white border-[#19887F]'
                              : 'bg-slate-50 text-slate-700 border-teal-200 hover:bg-teal-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-teal-100">
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                  Detailed Description * (At least 10 characters)
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the pollution accumulation, sources, smell, or impact on water clarity..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl p-4 text-sm text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              {/* Photo Evidence Upload */}
              <div className="space-y-3 pt-2 border-t border-teal-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                    Photo Evidence (Optional, max 5MB per image)
                  </label>
                  <span className="text-xs text-slate-500 font-semibold">{images.length} / 5 photos</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((imgSrc, idx) => (
                    <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-teal-200 group">
                      <img src={imgSrc} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="h-28 rounded-2xl border-2 border-dashed border-teal-200 bg-slate-50 hover:bg-teal-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-[#19887F]">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[11px] font-bold">Add Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] disabled:opacity-50 text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>File Pollution Report</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Submission Success State */
          <div className="bg-white rounded-3xl border border-[#92F1EC] p-8 sm:p-12 text-center space-y-8 shadow-2xl animate-fadeIn max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-teal-100 border border-[#35AEAC] text-[#19887F] mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full bg-teal-50 border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider">
                Report Filed & Published
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-ocean-950">
                {submittedReport.waterbodyName}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
                Thank you for contributing to the AquaRise environmental database! Nearby Guardians can now discover this observation and organize cleanups.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-ocean-950 font-bold">
                <MapPin className="w-4 h-4 text-[#19887F]" />
                <span>{[submittedReport.city, submittedReport.region, submittedReport.country].filter(Boolean).join(', ')}</span>
              </div>
              <p className="text-slate-600 line-clamp-2">{submittedReport.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onViewReport && onViewReport(submittedReport)}
                className="w-full sm:w-1/2 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-extrabold text-xs transition-colors cursor-pointer"
              >
                View Report Details
              </button>
              <button
                type="button"
                onClick={onNavigateExplore}
                className="w-full sm:w-1/2 py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Return to Community</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
