import React, { useState, useEffect, useRef } from 'react';
import { Flag, MapPin, Calendar, Clock, Users, ArrowLeft, AlertCircle, CheckCircle2, Share2, ArrowRight, Upload, Image, X, Loader2 } from 'lucide-react';
import LocationMapPlaceholder from '../common/LocationMapPlaceholder';

export default function CreateCleanupView({ initialData, onSubmitSuccess, onCreateMission, user, profile = {}, onNavigateExplore, onViewMission }) {
  const fileInputRef = useRef(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const safeProfile = profile || {};

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
    organizerName: safeProfile.name || safeProfile.displayName || safeProfile.fullName || 'AquaRise Guardian',
    description: '',
    suppliesNeeded: 'Trash bags, gloves, grabbers'
  });

  const [bannerPhoto, setBannerPhoto] = useState(null);
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDateError('');

    if (!user || !user.id) {
      setDateError('You must be signed in to your AquaRise account to create a cleanup mission.');
      return;
    }

    if (!formData.date || !String(formData.date).trim()) {
      setDateError('Please select an event date.');
      return;
    }

    // Strict future/today date and time validation
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

    let formattedTime = formData.startTime || '10:00 AM';
    if (formData.startTime && formData.startTime.includes(':')) {
      const [h, m] = formData.startTime.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      const displayM = String(m).padStart(2, '0');
      formattedTime = `${displayH}:${displayM} ${ampm}`;
    }

    const currentOrganizerName = safeProfile.name || safeProfile.displayName || safeProfile.fullName || formData.organizerName.trim() || 'AquaRise Guardian';

    const cleanDateStr = String(formData.date).trim();

    const newMission = {
      title: formData.title.trim() || `${formData.waterbodyName} Cleanup`,
      name: formData.title.trim() || `${formData.waterbodyName} Cleanup`,
      waterbodyName: formData.waterbodyName.trim() || 'Local Waterbody',
      location: fullLocation,
      meetingLocation: formData.meetingLocation.trim() || 'Main Entrance / Public Access',
      country: formData.country.trim(),
      city: formData.city.trim(),
      date: cleanDateStr,
      eventDate: cleanDateStr,
      event_date: cleanDateStr,
      startTime: formattedTime,
      rawStartTime: formData.startTime,
      estimatedDuration: formData.estimatedDuration.trim() || 'Approx. 2 hours',
      status: 'Upcoming',
      verificationStatus: 'unverified',
      organizer: currentOrganizerName,
      maxCapacity: parseInt(formData.capacity, 10) || 25,
      bannerImage: bannerPhoto,
      image: bannerPhoto,
      description: formData.description.trim() || `Community-led cleanup mission dedicated to removing plastic waste and debris from ${formData.waterbodyName}.`,
      suppliesNeeded: formData.suppliesNeeded.split(',').map((s) => s.trim()).filter(Boolean)
    };

    setIsSubmitting(true);

    try {
      if (onCreateMission) {
        const res = await onCreateMission(newMission);
        if (res?.error) {
          setDateError(res.error);
          setIsSubmitting(false);
          return;
        }
        if (res?.mission) {
          setSubmittedMission(res.mission);
          if (onSubmitSuccess) onSubmitSuccess(res.mission);
        }
      } else if (onSubmitSuccess) {
        setSubmittedMission(newMission);
        onSubmitSuccess(newMission);
      }
    } catch (err) {
      setDateError("We couldn't create your community mission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-[#92F1EC] p-8 sm:p-10 shadow-2xl space-y-8 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-teal-100 border border-[#35AEAC] text-[#19887F] mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-teal-50 border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider">
              Mission Published
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#071325]">
              {submittedMission.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto">
              Your community cleanup mission is live! Community members across the AquaRise network can now discover and join your event.
            </p>
          </div>

          <div className="bg-[#F4FBFB] rounded-2xl p-5 border border-[#92F1EC] space-y-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-[#071325] font-bold">
              <MapPin className="w-4 h-4 text-[#19887F]" />
              <span>{submittedMission.waterbodyName} — {submittedMission.location}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#076DDF]" /> {submittedMission.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#076DDF]" /> {submittedMission.startTime}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#19887F]" /> Max {submittedMission.maxCapacity}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyShare}
              className="w-full sm:w-1/2 py-3.5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#19887F] font-bold text-xs border border-[#92F1EC] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? 'Link Copied!' : 'Share Event Link'}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateExplore}
              className="w-full sm:w-1/2 py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Cleanups</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">

        {/* Back Link */}
        <button
          type="button"
          onClick={onNavigateExplore}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#19887F] hover:text-[#071325] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Waterbodies</span>
        </button>

        {/* Title Block */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#92F1EC] shadow-md space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-[#92F1EC] text-[#19887F] text-xs font-black uppercase tracking-wider">
            <Flag className="w-3.5 h-3.5 text-[#076DDF]" />
            <span>Community Organizers</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl text-[#042F2E] font-normal tracking-tight">
            Organize a <span className="text-[#0D9488] italic font-normal">Cleanup Mission</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
            Lead action for your local lake, river, or coastline. Published missions appear instantly across the AquaRise network for nearby Guardians to join.
          </p>
        </div>

        {/* Error Banner */}
        {dateError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{dateError}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-[#92F1EC] shadow-xl space-y-8">
          
          {/* 1. Basic Info */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#071325] border-b border-teal-100 pb-3 flex items-center gap-2">
              <Flag className="w-5 h-5 text-[#19887F]" />
              <span>1. Event Overview</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mission Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Mapocho River Spring Action"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Waterbody <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="waterbodyName"
                    required
                    placeholder="e.g. Mapocho River"
                    value={formData.waterbodyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City / Locality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Santiago"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Meeting Point / Detailed Access Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="meetingLocation"
                  required
                  placeholder="e.g. Parque de las Esculturas Main Gate, Providencia"
                  value={formData.meetingLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 2. Date & Time */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#071325] border-b border-teal-100 pb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#076DDF]" />
              <span>2. Date & Schedule</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  min={todayStr}
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Max Participant Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="5"
                  max="500"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 3. Description & Supplies */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#071325] border-b border-teal-100 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#19887F]" />
              <span>3. Details & Logistics</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Event Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe the cleanup goals, safety guidelines, and what volunteers should bring..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Supplies Needed (Comma-separated)
                </label>
                <input
                  type="text"
                  name="suppliesNeeded"
                  placeholder="Heavy gloves, trash bags, boots, water bottles"
                  value={formData.suppliesNeeded}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:border-[#19887F] text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-end gap-4">
            <button
              type="button"
              onClick={onNavigateExplore}
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
                  <span>Publishing Mission...</span>
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  <span>Publish Community Mission</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
