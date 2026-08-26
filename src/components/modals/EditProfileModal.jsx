import React, { useState, useEffect, useRef } from 'react';
import { X, User, MapPin, GraduationCap, BookOpen, FileText, CheckCircle2, AlertCircle, Upload, Trash2, Camera, Loader2 } from 'lucide-react';
import { uploadProfileAvatar, deleteProfileAvatar } from '../../services/authService.js';

/**
 * Client-side canvas image resizing utility
 * Resizes source file to max 512x512 pixels and compresses to WebP/JPEG data URL for fast preview
 */
function compressProfileImage(file, maxDimension = 512, quality = 0.85) {
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

export default function EditProfileModal({ profile, isOpen, onClose, onSaveProfile }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    region: '',
    school: '',
    major: '',
    bio: '',
    avatarUrl: ''
  });

  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.fullName || profile.displayName || profile.name || '',
        country: profile.country || '',
        city: profile.city || '',
        region: profile.region || '',
        school: profile.schoolOrganization || profile.school || '',
        major: profile.major || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || profile.avatar || ''
      });
      setPendingImageFile(null);
      setIsPhotoRemoved(false);
      setIsUploading(false);
      setErrorMessage('');
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');

    // Format Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Please select a valid image file (.jpg, .jpeg, .png, .webp).');
      return;
    }

    // Size Validation (5 MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage('Please choose an image smaller than 5 MB.');
      return;
    }

    try {
      const compressedDataUrl = await compressProfileImage(file, 512, 0.85);
      setFormData((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
      setPendingImageFile(file);
      setIsPhotoRemoved(false);
    } catch (err) {
      setErrorMessage("Could not process the selected image. Please try another file.");
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    setPendingImageFile(null);
    setIsPhotoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!profile?.id) {
      setErrorMessage('You must be signed in to your AquaRise account to update your profile.');
      return;
    }

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    setIsUploading(true);

    try {
      let finalAvatarUrl = formData.avatarUrl;
      const oldAvatarUrl = profile.avatarUrl || profile.avatar;

      // 1. Upload new photo to Supabase Storage 'avatars' bucket if chosen
      if (pendingImageFile) {
        const uploadRes = await uploadProfileAvatar(profile.id, pendingImageFile);
        if (uploadRes.error) {
          setErrorMessage(`Profile photo upload failed: ${uploadRes.error}`);
          setIsUploading(false);
          return;
        }
        if (uploadRes.publicUrl) {
          finalAvatarUrl = uploadRes.publicUrl;
        }
      } else if (isPhotoRemoved) {
        finalAvatarUrl = null;
      }

      const updatedProfile = {
        ...profile,
        name: trimmedName,
        fullName: trimmedName,
        displayName: trimmedName,
        country: formData.country.trim(),
        city: formData.city.trim(),
        region: formData.region.trim(),
        location: [formData.city.trim(), formData.region.trim(), formData.country.trim()].filter(Boolean).join(', ') || profile?.location || '',
        school: formData.school.trim(),
        schoolOrganization: formData.school.trim(),
        major: formData.major.trim(),
        bio: formData.bio.trim(),
        avatarUrl: finalAvatarUrl,
        avatar: finalAvatarUrl
      };

      // 2. Persist profile changes to Supabase public.profiles
      const res = await onSaveProfile(updatedProfile);
      if (res?.error) {
        setErrorMessage(res.error);
        setIsUploading(false);
        return;
      }

      // 3. Clean up old owned avatar from Storage after successful profile save
      if ((pendingImageFile || isPhotoRemoved) && oldAvatarUrl && oldAvatarUrl !== finalAvatarUrl) {
        deleteProfileAvatar(oldAvatarUrl);
      }

      setIsUploading(false);
      onClose();
    } catch (err) {
      setIsUploading(false);
      setErrorMessage("We couldn't save your profile changes. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-[#92F1EC] p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-ocean-950 transition-colors"
          disabled={isUploading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-teal-200 pb-4">
          <div className="p-3 rounded-2xl bg-teal-50 text-[#19887F] border border-teal-200">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-ocean-950">Edit Guardian Profile</h3>
            <p className="text-xs text-slate-600 font-medium">Update your public profile details and avatar.</p>
          </div>
        </div>

        {/* Validation Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Profile Photo Upload Control */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 space-y-3">
            <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider">
              Profile Photo
            </label>

            <div className="flex items-center gap-4">
              {/* Circular Avatar Preview */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#19887F] shrink-0 bg-teal-50 flex items-center justify-center shadow-sm relative group">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Profile Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-white text-lg bg-[#076DDF]">
                    {formData.name?.slice(0, 2).toUpperCase() || 'AG'}
                  </div>
                )}
              </div>

              {/* Upload & Remove Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{formData.avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploading}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Supports JPG, PNG, WebP up to 5 MB. Automatically stored in Supabase Storage.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">
              Full Name / Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Country</label>
              <input
                type="text"
                placeholder="e.g. Indonesia"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Bandung"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">School / Org</label>
              <input
                type="text"
                placeholder="e.g. Eco-Guardians Network"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Major / Specialty</label>
              <input
                type="text"
                placeholder="e.g. Marine Biology"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full bg-slate-50 border border-teal-200 rounded-xl px-3 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF]"
                disabled={isUploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ocean-950 uppercase tracking-wider mb-1">Short Bio</label>
            <textarea
              rows="3"
              placeholder="Share your passion for waterbody conservation..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-50 border border-teal-200 rounded-xl px-4 py-2 text-sm text-ocean-950 focus:outline-none focus:border-[#076DDF] placeholder:text-slate-400"
              disabled={isUploading}
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
