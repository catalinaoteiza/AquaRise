import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle2, XCircle, Clock, Calendar, MapPin, FileText, Image as ImageIcon, AlertCircle, Loader2, Award, User, RefreshCw } from 'lucide-react';
import { getPendingCompletionSubmissions, getCompletionEvidencePhotos, reviewCompletionSubmission } from '../../services/completionService.js';

export default function ReviewerDashboardModal({ isOpen, onClose, userProfile, onToast }) {
  const [filterStatus, setFilterStatus] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const fetchSubmissions = async (status) => {
    setIsLoading(true);
    setErrorMessage('');
    const data = await getPendingCompletionSubmissions(status);
    setSubmissions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions(filterStatus);
      setSelectedSubmission(null);
      setEvidencePhotos([]);
      setReviewNotes('');
      setShowApproveConfirm(false);
    }
  }, [isOpen, filterStatus]);

  if (!isOpen) return null;

  const handleSelectSubmission = async (sub) => {
    setSelectedSubmission(sub);
    setReviewNotes(sub.review_notes || '');
    setErrorMessage('');
    setShowApproveConfirm(false);
    setIsLoadingPhotos(true);

    const photos = await getCompletionEvidencePhotos(sub.id);
    setEvidencePhotos(photos);
    setIsLoadingPhotos(false);
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    const trimmedNotes = reviewNotes.trim();
    if (!trimmedNotes) {
      setErrorMessage('Please provide reviewer feedback notes explaining why this submission needs changes.');
      return;
    }

    setIsSubmittingReview(true);
    setErrorMessage('');

    const res = await reviewCompletionSubmission({
      submissionId: selectedSubmission.id,
      decision: 'rejected',
      reviewNotes: trimmedNotes
    });

    setIsSubmittingReview(false);

    if (res.error) {
      setErrorMessage(`Review failed: ${res.error}`);
      return;
    }

    if (onToast) onToast('Submission rejected and returned to participant.', 'info');
    setSelectedSubmission(null);
    fetchSubmissions(filterStatus);
  };

  const handleApproveConfirm = async () => {
    if (!selectedSubmission) return;

    setIsSubmittingReview(true);
    setErrorMessage('');

    const res = await reviewCompletionSubmission({
      submissionId: selectedSubmission.id,
      decision: 'approved',
      reviewNotes: reviewNotes.trim() || null
    });

    setIsSubmittingReview(false);
    setShowApproveConfirm(false);

    if (res.error) {
      setErrorMessage(`Approval failed: ${res.error}`);
      return;
    }

    if (onToast) onToast('Completion approved! Official AquaRise Certificate issued.', 'success');
    setSelectedSubmission(null);
    fetchSubmissions(filterStatus);
  };

  const formatMinutes = (mins) => {
    if (!mins) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${h} hr ${m} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dashboard Header */}
        <div className="flex items-center gap-3 border-b border-teal-200 pb-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-300">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-ocean-950">Reviewer Verification Dashboard</h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Authorized Reviewer
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Verify AquaRise community cleanup evidence and issue official certificates.</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-teal-100 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'pending', label: 'Pending Review' },
              { id: 'approved', label: 'Approved & Issued' },
              { id: 'rejected', label: 'Rejected' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterStatus(tab.id);
                  setSelectedSubmission(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#19887F] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchSubmissions(filterStatus)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Submissions List Column */}
          <div className={`${selectedSubmission ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 font-medium flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#19887F]" />
                <span className="text-xs">Loading submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-teal-200 text-xs text-slate-500 font-medium space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No {filterStatus} completion submissions found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {submissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  const profile = sub.profiles || {};
                  const mission = sub.community_missions || {};

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-teal-50/80 border-[#19887F] shadow-sm'
                          : 'bg-white border-teal-100 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-ocean-950 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#19887F]" />
                          {profile.display_name || profile.full_name || 'AquaRise Guardian'}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {sub.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-ocean-950 truncate">{mission.title || 'Community Cleanup'}</h4>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#19887F]" />
                          {mission.waterbody_name || mission.city || 'Local Waters'}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[#076DDF]">
                          <Clock className="w-3 h-3" />
                          {formatMinutes(sub.volunteer_minutes)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submission Review Details Column */}
          {selectedSubmission && (
            <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-teal-200 space-y-5 animate-fadeIn">
              
              {/* Review Details Header */}
              <div className="flex items-center justify-between border-b border-teal-200 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-ocean-950">Review Submission</h4>
                  <span className="text-[11px] text-slate-500 font-mono">ID: {selectedSubmission.id}</span>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-xs text-slate-500 hover:text-ocean-950 font-bold"
                >
                  Close Detail
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Mission & Participant Summary */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-teal-100 text-xs space-y-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Participant</span>
                  <span className="font-extrabold text-ocean-950">
                    {selectedSubmission.profiles?.display_name || selectedSubmission.profiles?.full_name || 'AquaRise Guardian'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Submitted Time</span>
                  <span className="font-extrabold text-[#076DDF]">{formatMinutes(selectedSubmission.volunteer_minutes)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Mission Title</span>
                  <span className="font-bold text-slate-800">{selectedSubmission.community_missions?.title}</span>
                </div>
              </div>

              {/* Contribution Text */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                  Contribution Summary
                </label>
                <div className="p-3.5 rounded-xl bg-white border border-teal-100 text-xs text-slate-800 font-medium leading-relaxed max-h-32 overflow-y-auto">
                  {selectedSubmission.contribution}
                </div>
              </div>

              {/* Evidence Photos (Private Signed URLs) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                  Evidence Photos ({evidencePhotos.length})
                </label>

                {isLoadingPhotos ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#19887F]" />
                    <span>Loading private evidence photos via signed URLs...</span>
                  </div>
                ) : evidencePhotos.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white border border-rose-200 text-xs text-rose-600 font-medium text-center">
                    No evidence photos attached or photos could not be loaded.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {evidencePhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-teal-200 bg-white group shadow-sm">
                        {photo.signedUrl ? (
                          <a
                            href={photo.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-full"
                          >
                            <img
                              src={photo.signedUrl}
                              alt="Cleanup evidence photo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-all"
                            />
                          </a>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-rose-500 p-2 text-center font-bold">
                            Signed URL Expired/Failed
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviewer Notes Input */}
              {selectedSubmission.status === 'pending' && (
                <div className="space-y-1 pt-2">
                  <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
                    Reviewer Notes / Feedback <span className="text-slate-400 font-normal">(Required if rejecting)</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Provide feedback for the participant..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                    disabled={isSubmittingReview}
                  ></textarea>
                </div>
              )}

              {/* Action Buttons for Pending Submissions */}
              {selectedSubmission.status === 'pending' && (
                <div className="pt-3 border-t border-teal-200 space-y-3">
                  
                  {showApproveConfirm ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                        <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Approve this completion submission?</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                        Approval will mark participation completed, record verified volunteer time, and issue an official AquaRise certificate.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleApproveConfirm}
                          disabled={isSubmittingReview}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          <span>Confirm Approval</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowApproveConfirm(false)}
                          disabled={isSubmittingReview}
                          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isSubmittingReview}
                        className="py-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Submission</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowApproveConfirm(true)}
                        disabled={isSubmittingReview}
                        className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Award className="w-4 h-4" />
                        <span>Approve & Issue Certificate</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
