/**
 * Security & Role Authorization Helper for AquaRise Pre-Supabase Stage 6 MVP
 * 
 * Pre-Supabase Production Rule:
 * Ordinary authenticated users can join missions, submit completion evidence, and view status ('Pending Verification').
 * Normal users CANNOT self-approve evidence, assign 'Verified Complete', or generate official certificates.
 * 
 * In Stage 7, this module will integrate with Supabase Auth & RLS custom JWT claims:
 * user_metadata.role ('admin', 'reviewer', 'organizer', 'guardian')
 */

export function canReviewCompletionEvidence(profile) {
  // Production security: default to false for pre-Supabase client-side MVP
  if (!profile) return false;

  // Optional local development review tools behind explicit dev environment check
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    if (profile.isDevReviewer === true) {
      return true;
    }
  }

  // Future Supabase Role Integration Point (Stage 7):
  // return profile.role === 'admin' || profile.role === 'reviewer';

  return false;
}

/**
 * Checks whether a participation record has been officially verified by an authorized reviewer.
 */
export function isEvidenceOfficiallyVerified(record) {
  if (!record) return false;
  return record.verificationStatus === 'verified' || record.status === 'Verified Complete';
}
