// Centralized Certificate Utility for AquaRise

/**
 * Format: AR-2026-XXXXXX (e.g. AR-2026-8F3K21)
 */
export function generateCertificateId() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like O/0, I/1
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AR-${year}-${randomPart}`;
}

/**
 * Check if a participation record is eligible for a certificate
 */
export function isEligibleForCertificate(participationRecord) {
  if (!participationRecord) return false;
  return (
    participationRecord.status === 'Completed' &&
    Number(participationRecord.volunteerHours) > 0 &&
    Boolean(participationRecord.cleanupMissionId)
  );
}

/**
 * Build certificate object from participation record and profile
 */
export function createCertificateRecord(participationRecord, profile) {
  const issueDate = new Date().toISOString().split('T')[0];
  const certId = generateCertificateId();

  return {
    id: `cert-${Date.now()}`,
    certificateId: certId,
    guardianId: profile.id || 'guardian-001',
    guardianName: profile.name || 'AquaRise Guardian',
    participationRecordId: participationRecord.id,
    cleanupMissionId: participationRecord.cleanupMissionId,
    cleanupTitle: participationRecord.title,
    waterbodyName: participationRecord.waterbodyName,
    location: participationRecord.location,
    cleanupDate: participationRecord.date || participationRecord.completedAt || issueDate,
    volunteerHours: participationRecord.volunteerHours,
    wasteCollectedKg: participationRecord.wasteCollectedKg,
    pointsEarned: participationRecord.pointsEarned,
    issuedAt: issueDate
  };
}
