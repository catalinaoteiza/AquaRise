import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, Trash2, Clock, Calendar, FileText, CheckCircle2, ShieldCheck, AlertCircle, AlertTriangle, HelpCircle, Image as ImageIcon, ArrowRight, Shield } from 'lucide-react';
import { canReviewCompletionEvidence } from '../../utils/auth.js';

/**
 * Client-side canvas photo compression utility.
 * Resizes evidence photo to max 800x800 box and compresses to JPEG data URL.
 */
function compressEvidencePhoto(file, maxDimension = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SubmitCompletionEvidenceModal({
  mission,
  existingRecord,
  isOpen,
  onClose,
  onSubmitEvidence,
  onVerifySubmission,
  userProfile
}) {
  const fileInputRef = useRef(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const [dateAttended, setDateAttended] = useState(todayStr);
  const [contribution, setContribution] = useState('');
  const [hours, setHours] = useState('3');
  const [minutes, setMinutes] = useState('0');
  const [photos, setPhotos] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmittedState, setIsSubmittedState] = useState(false);
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');

  const isAuthorizedReviewer = canReviewCompletionEvidence(userProfile);

  useEffect(() => {
    if (isOpen) {
      setIsSubmittedState(false);
      setErrorMessage('');
      setReviewerNotes('');

      const targetMission = mission || existingRecord;
      const initialDate = targetMission?.date || todayStr;
      
      // Constrain Date Attended to Mission Date (Section 13)
      setDateAttended(initialDate);

      if (existingRecord && (existingRecord.contribution || existingRecord.evidencePhotos?.length)) {
        setContribution(existingRecord.contribution || '');
        setHours(String(existingRecord.volunteerHours || 3));
        setMinutes(String(existingRecord.volunteerMinutes || 0));
        setPhotos(existingRecord.evidencePhotos || []);
        setAdditionalNotes(existingRecord.additionalNotes || '');
        setDateAttended(existingRecord.dateAttended || initialDate);
        setIsReadOnlyView(existingRecord.verificationStatus === 'pending' || existingRecord.verificationStatus === 'verified');
      } else {
        setContribution('');
        setHours('3');
        setMinutes('0');
        setPhotos([]);
        setAdditionalNotes('');
        setIsReadOnlyView(false);
      }
    }
  }, [isOpen, mission, existingRecord, todayStr]);

  if (!isOpen) return null;

  const targetMissionTitle = mission?.title || mission?.name || existingRecord?.title || existingRecord?.waterbodyName || 'AquaRise Field Cleanup';
  const targetMissionLocation = mission?.location || mission?.waterbodyName || existingRecord?.location || 'Cleanup Site';

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setErrorMessage('');

    if (photos.length + files.length > 5) {
      setErrorMessage('You can upload a maximum of 5 evidence photos.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage('Please select valid images (.jpg, .jpeg, .png, .webp).');
        return;
      }

      try {
        const compressedBase64 = await compressEvidencePhoto(file);
        setPhotos((prev) => [...prev, compressedBase64]);
      } catch (err) {
        setErrorMessage('Could not process selected image. Please try another photo.');
      }
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!contribution.trim() || contribution.trim().length < 10) {
      setErrorMessage('Please provide a meaningful description of your contribution (at least 10 characters).');
      return;
    }

    const parsedHours = parseInt(hours, 10) || 0;
    const parsedMinutes = parseInt(minutes, 10) || 0;

    if (parsedHours < 0 || parsedHours > 24) {
      setErrorMessage('Hours must be between 0 and 24.');
      return;
    }

    if (parsedMinutes < 0 || parsedMinutes > 59) {
      setErrorMessage('Minutes must be between 0 and 59.');
      return;
    }

    const totalMinutes = Math.round(parsedHours * 60) + parsedMinutes;

    if (totalMinutes <= 0) {
      setErrorMessage('Volunteer time must be greater than 0 minutes.');
      return;
    }

    if (photos.length === 0) {
      setErrorMessage('At least 1 evidence photo from the cleanup site is required.');
      return;
    }

    const evidenceData = {
      missionId: mission?.id || existingRecord?.cleanupMissionId || existingRecord?.id || `mission-${Date.now()}`,
      participationRecordId: existingRecord?.id || `part-${Date.now()}`,
      title: targetMissionTitle,
      waterbodyName: mission?.waterbodyName || existingRecord?.waterbodyName || targetMissionTitle,
      location: targetMissionLocation,
      dateAttended,
      contribution: contribution.trim(),
      volunteerHours: Math.floor(totalMinutes / 60),
      volunteerMinutes: totalMinutes % 60,
      totalMinutes: totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(2)),
      evidencePhotos: photos,
      additionalNotes: additionalNotes.trim(),
      submittedAt: new Date().toISOString(),
      status: 'Pending Verification',
      verificationStatus: 'pending' // 'pending' | 'verified' | 'needs_more_evidence' | 'rejected'
    };

    onSubmitEvidence(evidenceData);
    setIsSubmittedState(true);
  };

  const handleReviewerAction = (newStatus, reason = '') => {
    if (!isAuthorizedReviewer) {
      setErrorMessage('You are not authorized to perform reviewer actions.');
      return;
    }
    if (onVerifySubmission && existingRecord) {
      onVerifySubmission(existingRecord.id || existingRecord.participationRecordId, newStatus, reason);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative text-ocean-950 my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmittedState ? (
          <div className="space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 border-b border-teal-200 pb-5">
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-[#19887F] shrink-0">
                <FileText className="w-6 h-6 text-[#19887F]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#19887F]/10 text-[#19887F] px-2.5 py-0.5 rounded-full border border-[#19887F]/20">
                    AquaRise Impact Verification
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-ocean-950 mt-1">Submit Completion Evidence</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Share evidence of your participation so your cleanup contribution can be reviewed and verified.
                </p>
              </div>
            </div>

            {/* Target Cleanup Card Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Selected Mission</span>
              <h4 className="text-base font-extrabold text-ocean-950">{targetMissionTitle}</h4>
              <p className="text-xs text-slate-600">{targetMissionLocation}</p>
            </div>

            {/* Existing Status Banner if viewing */}
            {existingRecord?.verificationStatus === 'pending' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block font-bold">Evidence Pending Review</strong>
                  <span>Your submission has been logged and is awaiting review.</span>
                </div>
              </div>
            )}

            {/* Validation Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Read-Only Evidence Display for Pending/Verified Records */}
            {isReadOnlyView ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-teal-200">
                    <span className="text-slate-500 block font-bold text-[10px] uppercase">Date Attended</span>
                    <strong className="text-ocean-950 font-bold">{dateAttended}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-teal-200">
                    <span className="text-slate-500 block font-bold text-[10px] uppercase">Time Volunteered</span>
                    <strong className="text-[#19887F] font-bold">{hours} hrs {minutes} mins</strong>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-ocean-950 block mb-1">Contribution Description</span>
                  <p className="text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-teal-200 font-medium">
                    {contribution}
                  </p>
                </div>

                {photos.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-ocean-950 block mb-2">Uploaded Evidence Photos ({photos.length})</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {photos.map((src, i) => (
                        <div key={i} className="h-24 rounded-xl border border-teal-200 overflow-hidden">
                          <img src={src} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEVELOPMENT ONLY REVIEW PANEL (Sections 5, 6, 9, 10: Hidden from normal users) */}
                {isAuthorizedReviewer && (
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-300 space-y-3">
                    <span className="text-xs font-bold text-[#19887F] uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#19887F]" />
                      DEVELOPMENT REVIEW TOOLS
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleReviewerAction('verified')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                      >
                        Approve & Mark Verified Complete
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReviewerAction('needs_more_evidence')}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                      >
                        Request More Evidence
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReviewerAction('rejected')}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                      >
                        Reject Submission
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* Editable Evidence Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* 1. Time Volunteered (Hours & Minutes Numeric Inputs) */}
                <div className="p-4 rounded-2xl bg-[#DAF6F6]/30 border border-[#92F1EC] space-y-3">
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                    Time Volunteered <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>HOURS</span>
                        <span className="text-slate-400 font-normal">0 to 24</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="1"
                        required
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full bg-white border border-teal-200 rounded-xl px-4 py-2.5 text-base font-bold text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>MINS</span>
                        <span className="text-slate-400 font-normal">0 to 59</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="1"
                        required
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        className="w-full bg-white border border-teal-200 rounded-xl px-4 py-2.5 text-base font-bold text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Date Attended (Constrained to Mission Date - Section 13) */}
                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                    Date Attended <span className="text-slate-500 font-normal lowercase">(constrained to mission date)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      readOnly
                      value={dateAttended}
                      className="w-full bg-slate-100 border border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-ocean-950 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* 3. Contribution Description */}
                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                    What did you contribute? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe trash types collected, shoreline area covered, grabber or bag handling..."
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] font-medium"
                  ></textarea>
                </div>

                {/* 4. Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-2">
                    Evidence Photos (1 required, up to 5) <span className="text-rose-500">*</span>
                  </label>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      {photos.map((src, index) => (
                        <div key={index} className="relative h-24 rounded-xl border border-teal-200 overflow-hidden group">
                          <img src={src} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="p-5 border-2 border-dashed border-teal-300 rounded-2xl text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer block">
                    <Camera className="w-6 h-6 text-[#19887F] mx-auto mb-1" />
                    <span className="text-xs text-ocean-950 font-bold block">Click to upload photos from site</span>
                    <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-teal-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Submit Completion Evidence
                  </button>
                </div>

              </form>
            )}

          </div>
        ) : (
          /* Confirmation View */
          <div className="text-center py-8 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-amber-600 mx-auto flex items-center justify-center shadow-md">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-2xl font-black text-ocean-950">Evidence Submitted!</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Your cleanup evidence for <strong>{targetMissionTitle}</strong> has been received and is now:
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-300 mt-1">
                Pending Verification
              </span>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Return to My Impact
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
