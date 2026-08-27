import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, Trash2, Clock, Calendar, FileText, CheckCircle2, ShieldCheck, AlertCircle, AlertTriangle, HelpCircle, Image as ImageIcon, ArrowRight, Shield, Loader2, Award } from 'lucide-react';
import {
  getMyCompletionSubmission,
  saveCompletionDraft,
  uploadCompletionEvidencePhoto,
  deleteCompletionEvidencePhoto,
  getCompletionEvidencePhotos,
  submitCompletionEvidence
} from '../../services/completionService.js';

export default function SubmitCompletionEvidenceModal({
  mission,
  isOpen,
  onClose,
  onSubmissionChanged,
  onViewCertificate,
  userProfile,
  onToast
}) {
  const fileInputRef = useRef(null);

  const [submission, setSubmission] = useState(null);
  const [contribution, setContribution] = useState('');
  const [hours, setHours] = useState('2');
  const [minutes, setMinutes] = useState('0');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchExistingData = async () => {
    if (!mission?.id) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const existing = await getMyCompletionSubmission(mission.id);
    setSubmission(existing);

    if (existing) {
      setContribution(existing.contribution || '');
      const totalMins = existing.volunteer_minutes || (mission.duration_minutes || 120);
      setHours(String(Math.floor(totalMins / 60)));
      setMinutes(String(totalMins % 60));
      setAdditionalNotes(existing.notes || '');

      // Fetch photo metadata + signed URLs
      const photoList = await getCompletionEvidencePhotos(existing.id);
      setPhotos(photoList);
    } else {
      setContribution('');
      const defaultDuration = mission.duration_minutes || 120;
      setHours(String(Math.floor(defaultDuration / 60)));
      setMinutes(String(defaultDuration % 60));
      setAdditionalNotes('');
      setPhotos([]);
    }

    setPendingFiles([]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && mission) {
      fetchExistingData();
    }
  }, [isOpen, mission?.id]);

  if (!isOpen || !mission) return null;

  const isReadOnly = submission?.status === 'pending' || submission?.status === 'approved';
  const isRejected = submission?.status === 'rejected';

  // Helper to ensure draft submission exists before uploading photos
  const ensureDraftSubmission = async () => {
    const totalMinutes = (parseInt(hours || '0', 10) * 60) + parseInt(minutes || '0', 10);
    if (!contribution.trim()) {
      setErrorMessage('Please describe what you contributed to the cleanup.');
      return null;
    }
    if (totalMinutes <= 0) {
      setErrorMessage('Please enter valid volunteer hours/minutes.');
      return null;
    }

    const res = await saveCompletionDraft({
      missionId: mission.id,
      contribution: contribution.trim(),
      volunteerMinutes: totalMinutes,
      notes: additionalNotes.trim() || null
    });

    if (res.error) {
      setErrorMessage(`Could not save completion draft: ${res.error}`);
      return null;
    }

    return res.submissionId;
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (photos.length + selectedFiles.length > 5) {
      setErrorMessage('You can attach a maximum of 5 evidence photos.');
      return;
    }

    // 1. Ensure draft submission exists in DB first (Storage RLS requires submission_id)
    setIsUploadingPhoto(true);
    const subId = submission?.id || (await ensureDraftSubmission());

    if (!subId) {
      setIsUploadingPhoto(false);
      return;
    }

    // Refresh submission state if newly created
    if (!submission) {
      const newSub = await getMyCompletionSubmission(mission.id);
      setSubmission(newSub);
    }

    // 2. Upload selected files to Storage and insert metadata
    for (const file of selectedFiles) {
      const uploadRes = await uploadCompletionEvidencePhoto({
        submissionId: subId,
        file
      });

      if (uploadRes.error) {
        setErrorMessage(`Photo upload failed: ${uploadRes.error}`);
        break;
      }
    }

    // 3. Refresh photos list with private signed URLs
    const updatedPhotos = await getCompletionEvidencePhotos(subId);
    setPhotos(updatedPhotos);
    setIsUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeletePhoto = async (photo) => {
    if (isReadOnly) return;
    setErrorMessage('');

    const res = await deleteCompletionEvidencePhoto(photo.id, photo.storage_path);
    if (res.error) {
      setErrorMessage(`Failed to delete photo: ${res.error}`);
      return;
    }

    const updated = photos.filter((p) => p.id !== photo.id);
    setPhotos(updated);
  };

  const handleSaveDraft = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSavingDraft(true);

    const subId = await ensureDraftSubmission();
    setIsSavingDraft(false);

    if (subId) {
      const updatedSub = await getMyCompletionSubmission(mission.id);
      setSubmission(updatedSub);
      setSuccessMessage('Completion draft saved successfully.');
      if (onSubmissionChanged) onSubmissionChanged();
    }
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Ensure draft submission exists and updates are saved
    const subId = await ensureDraftSubmission();
    if (!subId) return;

    // 2. Validate photo count (1 to 5 required)
    if (photos.length < 1) {
      setErrorMessage('You must attach at least 1 evidence photo before submitting.');
      return;
    }

    setIsSubmitting(true);

    // 3. Submit evidence to change status to pending
    const submitRes = await submitCompletionEvidence(subId);
    setIsSubmitting(false);

    if (submitRes.error) {
      setErrorMessage(`Submission failed: ${submitRes.error}`);
      return;
    }

    setSuccessMessage('Your evidence has been submitted to AquaRise for review.');
    if (onToast) onToast('Completion evidence submitted for verification!', 'success');
    if (onSubmissionChanged) onSubmissionChanged();

    setTimeout(() => {
      fetchExistingData();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-teal-200 pb-4">
          <div className="p-3 rounded-2xl bg-teal-50 text-[#19887F] border border-teal-200">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-ocean-950">Submit Completion Evidence</h3>
            <p className="text-xs text-slate-600 font-medium">Verify your participation in official AquaRise community cleanups.</p>
          </div>
        </div>

        {/* Mission Context Summary */}
        <div className="p-4 rounded-2xl bg-[#DAF6F6]/40 border border-[#92F1EC] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-ocean-950 text-sm">{mission.title}</span>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-[#19887F] border border-teal-200">
              Community Mission
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#076DDF]" />
              {mission.event_date || mission.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#19887F]" />
              Duration: {mission.duration_minutes || 120} min
            </span>
          </div>
        </div>

        {/* Rejected Reviewer Feedback Banner */}
        {isRejected && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Needs Changes — Reviewer Feedback</span>
            </div>
            <p className="text-rose-700 font-medium leading-relaxed">
              {submission.review_notes || 'Your evidence was reviewed and requires updates before approval.'}
            </p>
            <p className="text-[11px] text-rose-600 font-semibold pt-1">
              You can edit your contribution summary, update volunteer time, or replace evidence photos below and resubmit.
            </p>
          </div>
        )}

        {/* Pending Verification Banner */}
        {submission?.status === 'pending' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pending Verification</span>
            </div>
            <p className="text-amber-700 font-medium leading-relaxed">
              Your evidence has been submitted to AquaRise for review. An authorized reviewer will examine your evidence photo and contribution.
            </p>
          </div>
        )}

        {/* Verified Complete Banner */}
        {submission?.status === 'approved' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Complete — AquaRise Certificate Issued</span>
              </div>
              {onViewCertificate && (
                <button
                  type="button"
                  onClick={() => onViewCertificate && onViewCertificate(submission)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Certificate</span>
                </button>
              )}
            </div>
            <p className="text-emerald-700 font-medium leading-relaxed">
              Congratulations! Your cleanup evidence has been reviewed and approved. Official volunteer hours have been credited to your Guardian profile.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmitFinal} className="space-y-5">
          
          {/* Contribution Textarea */}
          <div>
            <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
              What did you contribute? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              required
              disabled={isReadOnly}
              placeholder="Tell us what you worked on during the cleanup (e.g. collected 15 kg of plastic waste along the shoreline)..."
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] disabled:opacity-75"
            ></textarea>
          </div>

          {/* Volunteer Time Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                Volunteer Hours <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="24"
                required
                disabled={isReadOnly}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] disabled:opacity-75"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
                Volunteer Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                step="15"
                disabled={isReadOnly}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] disabled:opacity-75"
              />
            </div>
          </div>

          {/* Evidence Photos Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                Evidence Photos (1 to 5 Required) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-bold">{photos.length} / 5 uploaded</span>
            </div>

            {!isReadOnly && photos.length < 5 && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="w-full py-3 rounded-xl bg-white border border-dashed border-[#19887F] hover:bg-teal-50/50 text-[#19887F] font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Private Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Attach Evidence Photos (JPEG, PNG, WebP up to 10 MB)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Photos Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-teal-200 bg-white group shadow-sm">
                    {photo.signedUrl ? (
                      <img
                        src={photo.signedUrl}
                        alt="Evidence photo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold p-1 text-center">
                        Photo Loaded
                      </div>
                    )}

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
              Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              placeholder="Any additional details for the reviewer..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] disabled:opacity-75"
            />
          </div>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting}
                className="flex-1 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Draft</span>
              </button>

              <button
                type="submit"
                disabled={isSavingDraft || isSubmitting}
                className="flex-1 py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Submit for Verification</span>
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
