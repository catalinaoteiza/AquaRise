import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Normalizes a raw Supabase pollution_reports row into the canonical frontend report structure.
 */
export function normalizePollutionReport(row) {
  if (!row) return null;

  const prof = row.profiles || {};
  const photos = Array.isArray(row.pollution_report_photos) ? row.pollution_report_photos : [];

  const photoUrls = photos
    .map((p) => p.public_url)
    .filter(Boolean);

  const finalImages = photoUrls.length > 0
    ? photoUrls
    : (Array.isArray(row.images) ? row.images : []);

  const lat = typeof row.latitude === 'number' ? row.latitude : null;
  const lng = typeof row.longitude === 'number' ? row.longitude : null;

  return {
    id: row.id,
    waterbodyName: row.waterbody_name || 'Waterbody Location',
    waterbodyType: row.waterbody_type || 'River',
    country: row.country || 'Global',
    city: row.city || 'Locality',
    region: row.region || '',
    locationDescription: row.location_description || row.exact_address || `${row.city || ''}, ${row.country || ''}`,
    exactLocationLabel: row.exact_address || `${row.city || ''}, ${row.country || ''}`,
    coordinates: { lat, lng },
    pollutionSeverity: row.pollution_level || 'High',
    pollutionTypes: Array.isArray(row.pollution_tags) ? row.pollution_tags : ['Plastic waste', 'Household trash'],
    description: row.description || '',
    affectedArea: row.affected_area || 'Localized shoreline area',
    wildlifeAffected: Boolean(row.wildlife_affected),
    additionalNotes: row.additional_notes || '',
    images: finalImages,
    submittedAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    verificationStatus: row.verification_status || 'unverified',
    status: row.verification_status === 'verified' ? 'Verified' : 'Community Report',
    isCommunityReport: true,
    reporterId: row.reporter_id,
    reporterName: prof.name || prof.displayName || prof.full_name || 'AquaRise Guardian',
    isGuardian: Boolean(prof.is_guardian),
    disclaimer: 'Community-submitted observation. Not yet independently verified.'
  };
}

/**
 * Fetches all published community pollution reports from Supabase.
 */
export async function fetchPollutionReports() {
  try {
    if (!isSupabaseConfigured) {
      return [];
    }

    let { data, error } = await supabase
      .from('pollution_reports')
      .select(`
        *,
        pollution_report_photos (*),
        profiles:reporter_id (
          id,
          full_name,
          is_guardian,
          city,
          country
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[AquaRise Reports Service] Relational select note, trying direct select fallback:', error?.message);
      const { data: directData, error: directErr } = await supabase
        .from('pollution_reports')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (directErr || !directData) {
        console.error('[AquaRise Reports Service] Direct select fallback error:', directErr?.message);
        return [];
      }

      const enriched = await Promise.all(
        directData.map(async (rep) => {
          const { data: photos } = await supabase
            .from('pollution_report_photos')
            .select('*')
            .eq('report_id', rep.id);

          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, is_guardian, city, country')
            .eq('id', rep.reporter_id)
            .maybeSingle();

          return {
            ...rep,
            pollution_report_photos: photos || [],
            profiles: profile || null
          };
        })
      );

      data = enriched;
    }

    return (data || []).map(normalizePollutionReport).filter(Boolean);
  } catch (err) {
    console.error('[AquaRise Reports Service] Exception fetching pollution reports:', err);
    return [];
  }
}

/**
 * Helper to convert base64 Data URL to a Blob object for Supabase Storage upload.
 */
function dataUrlToBlob(dataUrl) {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    return null;
  }
}

/**
 * Creates and persists a new community pollution report in Supabase with optional evidence photos.
 */
export async function createPollutionReport(reportData) {
  try {
    if (!isSupabaseConfigured) {
      return { report: null, error: 'Supabase integration is not active.' };
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      return { report: null, error: 'You must be signed in to submit a pollution report.' };
    }

    const authUserId = session.user.id;

    // Validate inputs
    const waterbodyName = String(reportData.waterbodyName || '').trim();
    const city = String(reportData.city || '').trim();
    const country = String(reportData.country || '').trim();
    const description = String(reportData.description || '').trim();

    if (!waterbodyName) return { report: null, error: 'Please enter the name of the waterbody.' };
    if (!city || !country) return { report: null, error: 'Please provide the city and country location.' };
    if (!description || description.length < 10) return { report: null, error: 'Please provide a description of at least 10 characters.' };

    const lat = reportData.coordinates && typeof reportData.coordinates.lat === 'number' ? reportData.coordinates.lat : null;
    const lng = reportData.coordinates && typeof reportData.coordinates.lng === 'number' ? reportData.coordinates.lng : null;

    const dbInsertData = {
      reporter_id: authUserId,
      waterbody_name: waterbodyName,
      waterbody_type: reportData.waterbodyType || 'River',
      pollution_level: reportData.pollutionSeverity || 'High',
      description,
      city,
      region: String(reportData.region || '').trim(),
      country,
      location_description: String(reportData.locationDescription || '').trim(),
      exact_address: String(reportData.exactLocationLabel || reportData.exactAddress || '').trim(),
      latitude: lat,
      longitude: lng,
      pollution_tags: Array.isArray(reportData.pollutionTypes) ? reportData.pollutionTypes : ['Plastic waste'],
      affected_area: String(reportData.affectedArea || 'Localized area').trim(),
      wildlife_affected: Boolean(reportData.wildlifeAffected),
      additional_notes: String(reportData.additionalNotes || '').trim(),
      verification_status: 'unverified',
      published: true
    };

    // 1. Insert report row into public.pollution_reports
    const { data: insertedReport, error: insertErr } = await supabase
      .from('pollution_reports')
      .insert(dbInsertData)
      .select(`
        *,
        profiles:reporter_id (
          id,
          full_name,
          is_guardian,
          city,
          country
        )
      `)
      .single();

    if (insertErr || !insertedReport) {
      console.error('[AquaRise Reports Service] DB Insert Failed:', {
        message: insertErr?.message,
        code: insertErr?.code,
        details: insertErr?.details,
        hint: insertErr?.hint
      });
      return { report: null, error: insertErr?.message || 'Failed to submit pollution report.' };
    }

    const reportId = insertedReport.id;
    const uploadedPhotos = [];

    // 2. Upload photos to Supabase Storage if present
    const rawImages = Array.isArray(reportData.images) ? reportData.images : [];
    
    if (rawImages.length > 0) {
      for (let i = 0; i < Math.min(rawImages.length, 5); i++) {
        const item = rawImages[i];
        let blob = null;
        let ext = 'jpg';

        if (typeof item === 'string' && item.startsWith('data:image/')) {
          blob = dataUrlToBlob(item);
          if (item.includes('data:image/png')) ext = 'png';
          else if (item.includes('data:image/webp')) ext = 'webp';
        } else if (item instanceof File || item instanceof Blob) {
          blob = item;
          if (item.type === 'image/png') ext = 'png';
          else if (item.type === 'image/webp') ext = 'webp';
        }

        if (blob) {
          const fileUuid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${i}`;
          const storagePath = `${authUserId}/${reportId}/${fileUuid}.${ext}`;

          const { error: uploadErr } = await supabase
            .storage
            .from('pollution-report-evidence')
            .upload(storagePath, blob, {
              cacheControl: '3600',
              upsert: true
            });

          if (!uploadErr) {
            const { data: urlData } = supabase
              .storage
              .from('pollution-report-evidence')
              .getPublicUrl(storagePath);

            if (urlData && urlData.publicUrl) {
              const { data: photoRow, error: photoDbErr } = await supabase
                .from('pollution_report_photos')
                .insert({
                  report_id: reportId,
                  uploader_id: authUserId,
                  storage_path: storagePath,
                  public_url: urlData.publicUrl
                })
                .select()
                .single();

              if (!photoDbErr && photoRow) {
                uploadedPhotos.push(photoRow);
              }
            }
          } else {
            console.warn(`[AquaRise Reports Service] Photo ${i + 1} upload failed:`, uploadErr?.message);
          }
        }
      }
    }

    insertedReport.pollution_report_photos = uploadedPhotos;
    const finalNormalized = normalizePollutionReport(insertedReport);

    return { report: finalNormalized, error: null };
  } catch (err) {
    console.error('[AquaRise Reports Service] Exception creating pollution report:', err);
    return { report: null, error: err?.message || 'An unexpected error occurred creating your pollution report.' };
  }
}
