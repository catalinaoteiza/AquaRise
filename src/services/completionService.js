import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Stage 7D Completion & Verification Service
 * Source of truth: Supabase public.mission_completion_submissions, completion_evidence_photos, certificates
 */

/**
 * Fetch the current user's completion submission for a given community mission.
 */
export async function getMyCompletionSubmission(missionId) {
  if (!isSupabaseConfigured || !missionId) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('mission_completion_submissions')
      .select('*')
      .eq('mission_id', missionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('[AquaRise Completion] Error fetching my submission:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[AquaRise Completion] Exception fetching my submission:', err);
    return null;
  }
}

/**
 * Save or update a completion draft submission via RPC.
 */
export async function saveCompletionDraft({ missionId, contribution, volunteerMinutes, notes = null }) {
  if (!isSupabaseConfigured) {
    return { submissionId: null, error: 'Supabase environment is not configured.' };
  }

  try {
    const { data, error } = await supabase.rpc('save_completion_draft', {
      p_mission_id: missionId,
      p_contribution: contribution,
      p_volunteer_minutes: parseInt(volunteerMinutes, 10),
      p_notes: notes ? String(notes).trim() : null
    });

    if (error) {
      console.error('[AquaRise Completion] save_completion_draft RPC error:', error.message);
      return { submissionId: null, error: error.message };
    }

    return { submissionId: data, error: null };
  } catch (err) {
    console.error('[AquaRise Completion] Exception saving draft:', err);
    return { submissionId: null, error: err?.message || 'Failed to save completion draft.' };
  }
}

/**
 * Upload an evidence photo to the private 'completion-evidence' bucket and insert metadata.
 * Path: <user-id>/<submission-id>/<timestamp>_<uuid>.<ext>
 */
export async function uploadCompletionEvidencePhoto({ submissionId, file }) {
  if (!isSupabaseConfigured || !submissionId || !file) {
    return { photo: null, error: 'Invalid file or submission ID.' };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      return { photo: null, error: 'You must be signed in to upload completion evidence.' };
    }

    // Format Validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      return { photo: null, error: 'Please select a valid JPEG, PNG, or WebP image.' };
    }

    // Size Validation (10 MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { photo: null, error: 'Evidence photo exceeds the 10 MB maximum size limit.' };
    }

    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';

    const fileUuid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const storagePath = `${user.id}/${submissionId}/${Date.now()}_${fileUuid}.${ext}`;

    // 1. Upload to private Storage bucket with upsert = false
    const { error: storageErr } = await supabase
      .storage
      .from('completion-evidence')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageErr) {
      console.error('[AquaRise Completion] Storage upload failed:', storageErr.message);
      return { photo: null, error: storageErr.message };
    }

    // 2. Insert metadata row into completion_evidence_photos
    const { data: photoData, error: dbErr } = await supabase
      .from('completion_evidence_photos')
      .insert({
        submission_id: submissionId,
        uploader_id: user.id,
        storage_path: storagePath
      })
      .select()
      .single();

    if (dbErr) {
      console.error('[AquaRise Completion] Photo metadata DB insert failed:', dbErr.message);
      // Clean up orphaned storage object
      await supabase.storage.from('completion-evidence').remove([storagePath]);
      return { photo: null, error: dbErr.message };
    }

    return { photo: photoData, error: null };
  } catch (err) {
    console.error('[AquaRise Completion] Exception uploading photo:', err);
    return { photo: null, error: err?.message || 'Failed to upload evidence photo.' };
  }
}

/**
 * Delete a photo metadata row and remove its private Storage object.
 */
export async function deleteCompletionEvidencePhoto(photoId, storagePath) {
  if (!isSupabaseConfigured || !photoId) return { error: 'Invalid photo ID' };

  try {
    // 1. Delete DB metadata row
    const { error: dbErr } = await supabase
      .from('completion_evidence_photos')
      .delete()
      .eq('id', photoId);

    if (dbErr) {
      return { error: dbErr.message };
    }

    // 2. Delete Storage object
    if (storagePath) {
      await supabase.storage.from('completion-evidence').remove([storagePath]);
    }

    return { error: null };
  } catch (err) {
    return { error: err?.message || 'Failed to delete photo' };
  }
}

/**
 * Fetch photo metadata and generate 1-hour private signed URLs for authorized viewing.
 */
export async function getCompletionEvidencePhotos(submissionId) {
  if (!isSupabaseConfigured || !submissionId) return [];

  try {
    const { data, error } = await supabase
      .from('completion_evidence_photos')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    // Generate signed URLs for private objects
    const photosWithUrls = await Promise.all(
      data.map(async (photo) => {
        try {
          const { data: signedData, error: urlErr } = await supabase
            .storage
            .from('completion-evidence')
            .createSignedUrl(photo.storage_path, 3600); // 1 hour validity

          return {
            ...photo,
            signedUrl: signedData?.signedUrl || null,
            urlError: urlErr?.message || null
          };
        } catch (e) {
          return { ...photo, signedUrl: null };
        }
      })
    );

    return photosWithUrls;
  } catch (err) {
    console.error('[AquaRise Completion] Error fetching evidence photos:', err);
    return [];
  }
}

/**
 * Finalize and submit completion evidence for reviewer verification via RPC.
 */
export async function submitCompletionEvidence(submissionId) {
  if (!isSupabaseConfigured || !submissionId) {
    return { success: false, error: 'Invalid submission ID.' };
  }

  try {
    const { data, error } = await supabase.rpc('submit_completion_evidence', {
      p_submission_id: submissionId
    });

    if (error) {
      console.error('[AquaRise Completion] submit_completion_evidence RPC error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, result: data, error: null };
  } catch (err) {
    console.error('[AquaRise Completion] Exception submitting evidence:', err);
    return { success: false, error: err?.message || 'Failed to submit completion evidence.' };
  }
}

/**
 * Check if the current authenticated user is an authorized AquaRise completion reviewer.
 */
export async function isCompletionReviewer() {
  if (!isSupabaseConfigured) return false;

  try {
    const { data, error } = await supabase.rpc('is_completion_reviewer');
    if (error) {
      console.warn('[AquaRise Reviewer] is_completion_reviewer check error:', error.message);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    return false;
  }
}

/**
 * Fetch submissions for the Reviewer Dashboard.
 * Filters: 'pending' (default), 'approved', 'rejected'
 */
export async function getPendingCompletionSubmissions(filterStatus = 'pending') {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from('mission_completion_submissions')
      .select(`
        *,
        community_missions (*),
        profiles!user_id (*)
      `)
      .order('submitted_at', { ascending: false });

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AquaRise Reviewer] Error fetching pending submissions:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[AquaRise Reviewer] Exception fetching submissions:', err);
    return [];
  }
}

/**
 * Review a completion submission (approve or reject) via RPC.
 */
export async function reviewCompletionSubmission({ submissionId, decision, reviewNotes = null }) {
  if (!isSupabaseConfigured || !submissionId || !decision) {
    return { success: false, error: 'Invalid parameters for review.' };
  }

  try {
    const { data, error } = await supabase.rpc('review_completion_submission', {
      p_submission_id: submissionId,
      p_decision: decision,
      p_review_notes: reviewNotes ? String(reviewNotes).trim() : null
    });

    if (error) {
      console.error('[AquaRise Reviewer] review_completion_submission RPC error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, result: data, error: null };
  } catch (err) {
    console.error('[AquaRise Reviewer] Exception reviewing submission:', err);
    return { success: false, error: err?.message || 'Failed to record review decision.' };
  }
}

/**
 * Fetch official certificates issued to the current user.
 */
export async function getMyCertificates() {
  if (!isSupabaseConfigured) return [];

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('issued_to_user_id', user.id)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('[AquaRise Certificates] Error fetching my certificates:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    return [];
  }
}

/**
 * Public certificate lookup via RPC (callable by anon & authenticated).
 */
export async function getPublicCertificate(code) {
  if (!isSupabaseConfigured || !code) {
    return { found: false, error: 'Please enter a certificate code.' };
  }

  try {
    const { data, error } = await supabase.rpc('get_public_certificate', {
      p_certificate_code: String(code).trim()
    });

    if (error) {
      console.error('[AquaRise Certificates] Public certificate lookup error:', error.message);
      return { found: false, error: error.message };
    }

    return data;
  } catch (err) {
    return { found: false, error: err?.message || 'Failed to verify certificate.' };
  }
}
