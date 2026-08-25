import React, { useState, useEffect, useRef } from 'react';
import { Flag, MapPin, Calendar, Clock, Users, ArrowLeft, AlertCircle, CheckCircle2, Share2, ArrowRight, Upload, Image, X } from 'lucide-react';
import LocationMapPlaceholder from '../common/LocationMapPlaceholder';

export default function CreateCleanupView({ initialData, onSubmitSuccess, onNavigateExplore, onViewMission }) {
  const fileInputRef = useRef(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    waterbodyName: '',
    country: '',
    city: '',
    location: '',
    meetingLocation: '',
    date: todayStr,
    startTime: '10:00',
    estimatedDuration: '2 hours',
    capacity: '25',
    organizerName: 'AquaRise Guardian',
    description: '',
    suppliesNeeded: 'Trash bags, gloves, grabbers'
  });

  const [bannerPhoto, setBannerPhoto] = useState(null);
  const [dateError, setDateError] = useState('');
  const [submittedMission, setSubmittedMission] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        waterbodyName: initialData.waterbodyName || initialData.title || prev.waterbodyName,
        country: initialData.country || prev.country,
        city: initialData.city || prev.city,
        location: initialData.location || prev.location,
        title: initialData.title ? `${initialData.title} Cleanup Mission` : prev.title
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'date' || name === 'startTime') {
      setDateError('');
    }
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setDateError('Please select a valid image file (.jpg, .jpeg, .png, .webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDateError('Maximum banner photo size is 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setBannerPhoto(compressedDataUrl);
        setDateError('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDateError('');

    // Strict future/today date and time validation (Section 7 & Test E)
    if (formData.date < todayStr) {
      setDateError('Cleanup date and time must be now or in the future.');
      return;
    }

    if (formData.date === todayStr && formData.startTime) {
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);
        if (eventTime < new Date()) {
          setDateError('Cleanup date and time must be now or in the future.');
          return;
        }
      }
    }

    const fullLocation = [formData.city, formData.country].filter(Boolean).join(', ') || formData.location || 'Global Waters';

    // Formatted start time string
    let formattedTime = formData.startTime || '10:00 AM';
    if (formData.startTime && formData.startTime.includes(':')) {
      const [h, m] = formData.startTime.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      const displayM = String(m).padStart(2, '0');
      formattedTime = `${displayH}:${displayM} ${ampm}`;
    }

    // New Mission created with default UNVERIFIED status (Section 3 & Test C)
    const newMission = {
      id: `mission-${Date.now()}`,
      title: formData.title.trim() || `${formData.waterbodyName} Cleanup`,
      name: formData.title.trim() || `${formData.waterbodyName} Cleanup`,
      waterbodyName: formData.waterbodyName.trim() || 'Local Waterbody',
      location: fullLocation,
      meetingLocation: formData.meetingLocation.trim() || 'Main Entrance / Public Access',
      country: formData.country.trim(),
      city: formData.city.trim(),
      date: formData.date,
      startTime: formattedTime,
      rawStartTime: formData.startTime,
      estimatedDuration: formData.estimatedDuration.trim() || 'Approx. 2 hours',
      status: 'Upcoming',
      verificationStatus: 'unverified', // CRITICAL: Default to unverified (Section 3)
      organizer: formData.organizerName.trim() || 'AquaRise Guardian',
      organizerType: 'AquaRise Guardian',
      isCommunityOrganized: true,
      isUserCreated: true,
      participantCount: 1,
      participatingGuardians: 1,
      maxCapacity: parseInt(formData.capacity, 10) || 25,
      bannerImage: bannerPhoto,
      image: bannerPhoto,
      description: formData.description.trim() || `Community-led cleanup mission dedicated to removing plastic waste and debris from ${formData.waterbodyName}.`,
      suppliesNeeded: formData.suppliesNeeded.split(',').map((s) => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };

    setSubmittedMission(newMission);
    onSubmitSuccess(newMission);
  };

  const handleCopyShare = () => {
    if (!submittedMission) return;
    const shareUrl = `${window.location.origin}/cleanups`;
    navigator.clipboard?.writeText?.(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  if (submittedMission) {
    return (
      <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
          
          <div className="bg-white p-8 rounded-3xl border border-[#92F1EC] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#19887F] mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200 inline-block">
                AquaRise Mission Created • Unverified
              </span>
              <h1 className="text-3xl font-black text-ocean-950">{submittedMission.title}</h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto font-medium">
                Your cleanup mission is scheduled for <strong>{submittedMission.date}</strong> at <strong>{submittedMission.startTime}</strong> ({submittedMission.estimatedDuration}).
              </p>
            </div>

            {/* Banner Preview if uploaded */}
            {submittedMission.bannerImage && (
              <div className="rounded-2xl overflow-hidden border border-teal-200 max-h-48 bg-slate-100">
                <img src={submittedMission.bannerImage} alt="Cleanup Banner" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#DAF6F6]/50 border border-[#92F1EC] text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-center gap-2 font-bold text-[#19887F]">
                <MapPin className="w-4 h-4" />
                <span>{submittedMission.location}</span>
              </div>
              <p className="font-medium text-slate-600">
                Meeting Point: <strong>{submittedMission.meetingLocation}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onViewMission && onViewMission(submittedMission)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#19887F] hover:bg-[#35AEAC] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>View Mission Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyShare}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-[#076DDF]" />
                <span>{copiedShare ? 'Link Copied!' : 'Share Mission'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        
        {/* Standardized Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onNavigateExplore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-ocean-950 font-bold text-xs border border-[#92F1EC] hover:bg-[#92F1EC]/30 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#19887F]" />
            <span>Back to Cleanups</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#92F1EC] shadow-xl space-y-8">
          
          <div className="border-b border-[#35AEAC]/20 pb-6 space-y-2">
            <span className="text-xs font-black tracking-widest text-[#19887F] uppercase bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200 inline-block shadow-sm">
              Community Action Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-ocean-950">
              Propose a <span className="text-[#19887F]">Cleanup Mission</span>
            </h1>
            <p className="text-slate-700 text-sm font-medium">
              Mobilize local volunteers and organize a river, lake, or coastal cleanup action.
            </p>
          </div>

          {dateError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dateError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title & Waterbody */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Mission Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Citarum Riverbank Community Sweep"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Target Waterbody <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="waterbodyName"
                  required
                  placeholder="e.g. Citarum River Basin"
                  value={formData.waterbodyName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] font-medium"
                />
              </div>
            </div>

            {/* Location & Meeting Point */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">City / Region</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. West Java"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g. Indonesia"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Meeting Point</label>
                <input
                  type="text"
                  name="meetingLocation"
                  placeholder="e.g. Bridge Park Entrance"
                  value={formData.meetingLocation}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>
            </div>

            {/* Date, Start Time & Estimated Duration (Section 8) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC]">
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Cleanup Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#076DDF] absolute left-3 top-3" />
                  <input
                    type="date"
                    name="date"
                    min={todayStr}
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-white border border-teal-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-ocean-950 font-bold focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#19887F] absolute left-3 top-3" />
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full bg-white border border-teal-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-ocean-950 font-bold focus:outline-none focus:border-[#076DDF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                  Estimated Duration
                </label>
                <select
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleChange}
                  className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2.5 text-xs text-ocean-950 font-bold focus:outline-none focus:border-[#076DDF]"
                >
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="4 hours">4 hours</option>
                  <option value="Half Day (5+ hours)">Half Day (5+ hours)</option>
                </select>
              </div>
            </div>

            {/* Banner Photo Upload (Section 10) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                  Cleanup Banner Photo (Optional)
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Max size: 5 MB</span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Add a photo of the cleanup location or waterbody.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleBannerSelect}
                className="hidden"
              />

              {bannerPhoto ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#19887F] max-h-56 bg-slate-100 shadow-sm">
                    <img src={bannerPhoto} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs transition-colors"
                    >
                      Change Photo
                    </button>

                    <button
                      type="button"
                      onClick={() => setBannerPhoto(null)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-colors"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 rounded-2xl border-2 border-dashed border-teal-300 hover:border-[#19887F] bg-white text-center space-y-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-[#19887F] mx-auto" />
                  <span className="text-xs font-bold text-[#19887F] block">Click to upload banner photo</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Supports JPG, JPEG, PNG, WEBP</span>
                </button>
              )}
            </div>

            {/* Description & Capacity */}
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                Description & Impact Objectives
              </label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe the cleanup goals, specific target areas, safety instructions, and what volunteers should expect."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Volunteer Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="5"
                  max="500"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Organizer / Leader Name</label>
                <input
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-[#92F1EC] flex justify-end gap-3">
              <button
                type="button"
                onClick={onNavigateExplore}
                className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all"
              >
                Create Cleanup Mission
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
