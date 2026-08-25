import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';

// Context & Auth
import { AuthProvider, useAuth } from './context/AuthContext';

// Views
import HomeView from './components/views/HomeView';
import ExploreView from './components/views/ExploreView';
import WaterbodyDetailView from './components/views/WaterbodyDetailView';
import CleanupsView from './components/views/CleanupsView';
import MyCleanupsView from './components/views/MyCleanupsView';
import ReportPollutionView from './components/views/ReportPollutionView';
import ReportDetailView from './components/views/ReportDetailView';
import CreateCleanupView from './components/views/CreateCleanupView';
import MissionDetailView from './components/views/MissionDetailView';
import CommunityView from './components/views/CommunityView';
import MyImpactView from './components/views/MyImpactView';
import CertificateDetailView from './components/views/CertificateDetailView';
import VerifyCertificateView from './components/views/VerifyCertificateView';

// Modals
import AuthModal from './components/modals/AuthModal';
import GuardianModal from './components/modals/GuardianModal';
import MissionDetailModal from './components/modals/MissionDetailModal';
import ReportPollutionModal from './components/modals/ReportPollutionModal';
import RemoteSupportModal from './components/modals/RemoteSupportModal';
import ProposeCleanupModal from './components/modals/ProposeCleanupModal';
import SupplyPledgeModal from './components/modals/SupplyPledgeModal';
import EditProfileModal from './components/modals/EditProfileModal';
import SubmitCompletionEvidenceModal from './components/modals/SubmitCompletionEvidenceModal';
import LeaveMissionModal from './components/modals/LeaveMissionModal';

// Storage & Utilities
import {
  getStoredReports,
  saveStoredReport,
  getStoredMissions,
  saveStoredMission,
  updateStoredMission,
  getJoinedMissionIds,
  toggleJoinedMission,
  getStoredParticipations,
  saveParticipationRecord,
  removeParticipationRecord,
  getStoredCertificates,
  saveCertificateRecord,
  cleanDemoRecordsFromStorage
} from './utils/storage';

import { createCertificateRecord } from './utils/certificate';
import { isEvidenceOfficiallyVerified } from './utils/auth.js';

import { MOCK_WATERBODIES } from './data/mockWaterbodies';
import { MOCK_IMPACT_STATS } from './data/mockImpactData';
import { MOCK_SUPPLIES } from './data/mockSupplies';

function AquaRiseApp() {
  const { user, profile, loading, signOut, updateProfile, updateGuardianStatus, isPasswordRecovery } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [toastInfo, setToastInfo] = useState({ message: '', type: 'success' });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auto-open password recovery modal ONLY when isPasswordRecovery is true (after session is established)
  useEffect(() => {
    if (isPasswordRecovery) {
      setIsAuthModalOpen(true);
    }
  }, [isPasswordRecovery]);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Selected Entities
  const [selectedWaterbody, setSelectedWaterbody] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedMissionDetail, setSelectedMissionDetail] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [verifyTargetCertId, setVerifyTargetCertId] = useState('');
  const [createInitialData, setCreateInitialData] = useState(null);

  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [proposeWaterbody, setProposeWaterbody] = useState(null);
  const [pledgeTargetMission, setPledgeTargetMission] = useState(null);
  const [evidenceTargetMission, setEvidenceTargetMission] = useState(null);
  const [leaveTargetMission, setLeaveTargetMission] = useState(null);

  // Local Storage Synchronized State
  const [reports, setReports] = useState(() => getStoredReports());
  const [missions, setMissions] = useState(() => getStoredMissions());
  const [joinedMissionIds, setJoinedMissionIds] = useState(() => getJoinedMissionIds());
  const [participations, setParticipations] = useState(() => getStoredParticipations());
  const [certificates, setCertificates] = useState(() => getStoredCertificates());

  // Safe one-time cleanup migration of demo records
  useEffect(() => {
    cleanDemoRecordsFromStorage();
  }, []);

  // Synchronize state across window tabs
  useEffect(() => {
    const syncParticipations = () => {
      setParticipations(getStoredParticipations());
      setJoinedMissionIds(getJoinedMissionIds());
      setMissions(getStoredMissions());
    };
    window.addEventListener('aquarise_participation_changed', syncParticipations);
    window.addEventListener('storage', syncParticipations);
    return () => {
      window.removeEventListener('aquarise_participation_changed', syncParticipations);
      window.removeEventListener('storage', syncParticipations);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToastInfo({ message, type });
  };

  const handleOpenGuardian = () => setIsGuardianModalOpen(true);
  const handleOpenReportModal = () => setIsReportModalOpen(true);

  const handleViewWaterbodyDetails = (waterbody) => {
    setSelectedWaterbody(waterbody);
    setActiveTab('waterbody-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewReportDetails = (report) => {
    setSelectedReport(report);
    setActiveTab('report-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewMissionDetails = (mission) => {
    setSelectedMission(mission);
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setActiveTab('certificate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCreateCleanup = (initialData = null) => {
    setCreateInitialData(initialData);
    if (!profile?.isGuardian) {
      showToast('Guardian status required to organize a cleanup mission. Join as Guardian first!', 'info');
      setIsGuardianModalOpen(true);
    } else {
      setActiveTab('create-cleanup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLeaveMission = (targetItemOrId) => {
    if (!targetItemOrId) return;

    const targetId = typeof targetItemOrId === 'object'
      ? (targetItemOrId.id || targetItemOrId.missionId || targetItemOrId.cleanupMissionId)
      : targetItemOrId;

    const updatedRecords = removeParticipationRecord(targetId);
    setParticipations(updatedRecords);
    setJoinedMissionIds(getJoinedMissionIds());

    setMissions((currentMissions) => {
      return currentMissions.map((m) => {
        if (m.id === targetId || m.missionId === targetId) {
          const currentCount = m.participatingGuardians || m.participantCount || 1;
          const newCount = Math.max(0, currentCount - 1);
          const updatedM = {
            ...m,
            participatingGuardians: newCount,
            participantCount: newCount
          };
          updateStoredMission(updatedM);
          return updatedM;
        }
        return m;
      });
    });

    showToast('You left this cleanup mission.', 'info');
  };

  const handleToggleJoin = (missionId) => {
    const isCurrentlyJoined = joinedMissionIds.includes(missionId);

    if (isCurrentlyJoined) {
      handleLeaveMission(missionId);
    } else {
      const updatedJoinedIds = toggleJoinedMission(missionId);
      setJoinedMissionIds(updatedJoinedIds);

      const targetMission = missions.find((m) => m.id === missionId);
      if (targetMission) {
        const newParticipantCount = (targetMission.participatingGuardians || 0) + 1;
        const updatedMissionObj = {
          ...targetMission,
          participatingGuardians: newParticipantCount,
          participantCount: newParticipantCount
        };

        const allUpdatedMissions = updateStoredMission(updatedMissionObj);
        setMissions(allUpdatedMissions);

        saveParticipationRecord({
          id: targetMission.id,
          missionId: targetMission.id,
          title: targetMission.name || targetMission.title,
          waterbodyName: targetMission.waterbodyName,
          location: targetMission.location || targetMission.meetingLocation,
          date: targetMission.date || targetMission.status,
          hoursEstimate: 3,
          status: 'Joined',
          verificationStatus: 'joined',
          completedAt: null
        });
        setParticipations(getStoredParticipations());
        showToast(`Joined ${targetMission.name || targetMission.title}!`);
      }
    }
  };

  const handleReportSubmitted = (newReport) => {
    const updatedReports = saveStoredReport(newReport);
    setReports(updatedReports);
    updateProfile({
      reportsSubmitted: (profile.reportsSubmitted || 0) + 1,
      impactPoints: (profile.impactPoints || 0) + 50
    });
    showToast('Report submitted (+50 Impact Points)!');
  };

  const handleMissionSubmitted = (newMission) => {
    const updatedMissions = saveStoredMission(newMission);
    setMissions(updatedMissions);

    const updatedJoinedIds = toggleJoinedMission(newMission.id);
    setJoinedMissionIds(updatedJoinedIds);

    updateProfile({
      missionsCreated: (profile.missionsCreated || 0) + 1,
      impactPoints: (profile.impactPoints || 0) + 100
    });

    saveParticipationRecord({
      id: newMission.id,
      missionId: newMission.id,
      title: newMission.name || newMission.title,
      waterbodyName: newMission.waterbodyName,
      location: newMission.location || newMission.meetingLocation,
      date: newMission.date,
      hoursEstimate: 4,
      status: 'Joined',
      verificationStatus: 'joined',
      completedAt: null
    });
    setParticipations(getStoredParticipations());

    setSelectedMissionDetail(newMission);
    setActiveTab('cleanups');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Cleanup proposed successfully (+100 Impact Points)!');
  };

  // Connected Edit Profile via AuthContext (Requirement #7)
  const handleProfileUpdate = async (updatedData) => {
    try {
      const res = await updateProfile(updatedData);
      if (res?.error) {
        showToast(res.error, 'error');
        return res;
      }
      showToast('Profile changes saved.', 'success');
      return res;
    } catch (err) {
      showToast("We couldn't save your profile changes. Please try again.", 'error');
      return { error: "We couldn't save your profile changes." };
    }
  };

  // Connected Guardian Onboarding via AuthContext (Requirement #5 & #6)
  const handleGuardianJoined = async (guardianData) => {
    const role = typeof guardianData === 'object' ? guardianData.role : guardianData;
    const res = await updateGuardianStatus(guardianData);

    if (res?.error) {
      return res;
    }

    showToast('Welcome to the AquaRise Guardian Network.', 'success');

    if (createInitialData) {
      setActiveTab('create-cleanup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return res;
  };

  const handleEvidenceSubmitted = (evidenceData) => {
    saveParticipationRecord(evidenceData);
    setParticipations(getStoredParticipations());
    showToast('Evidence submitted for verification.', 'success');
  };

  const handleVerifySubmission = (recordId, newVerificationStatus, reviewerReason = '') => {
    const currentList = getStoredParticipations();
    const target = currentList.find((r) => r.id === recordId || r.participationRecordId === recordId);
    if (!target) return;

    const isApproved = newVerificationStatus === 'verified';
    const updatedRecord = {
      ...target,
      verificationStatus: newVerificationStatus,
      status: isApproved ? 'Verified Complete' : newVerificationStatus === 'needs_more_evidence' ? 'Needs More Evidence' : 'Not Verified',
      reviewerReason,
      verifiedAt: isApproved ? new Date().toISOString().split('T')[0] : null
    };

    saveParticipationRecord(updatedRecord);
    setParticipations(getStoredParticipations());

    if (isApproved) {
      const certRecord = createCertificateRecord({
        participationRecord: updatedRecord,
        recipientProfile: profile
      });
      saveCertificateRecord(certRecord);
      setCertificates(getStoredCertificates());
      showToast('Evidence approved and certificate issued!', 'success');
    } else {
      showToast(`Verification status updated to ${updatedRecord.status}.`, 'info');
    }
  };

  const handleGenerateCertificate = (participationRecord) => {
    if (!isEvidenceOfficiallyVerified(participationRecord)) {
      showToast('Evidence must be officially verified before issuing a certificate.', 'error');
      return;
    }

    const certRecord = createCertificateRecord({
      participationRecord,
      recipientProfile: profile
    });
    saveCertificateRecord(certRecord);
    setCertificates(getStoredCertificates());
    setSelectedCertificate(certRecord);
    setActiveTab('certificate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Loading Screen during Auth Session Startup (Section 15)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#DAF6F6] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#19887F]/30 border-t-[#19887F] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-[#19887F] tracking-wider uppercase">Loading AquaRise Session...</p>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            stats={MOCK_IMPACT_STATS}
            impactStats={MOCK_IMPACT_STATS}
            waterbodies={MOCK_WATERBODIES}
            supplies={MOCK_SUPPLIES}
            onExploreCleanups={() => setActiveTab('explore')}
            onBecomeGuardian={handleOpenGuardian}
            onViewMission={handleViewWaterbodyDetails}
            onSponsorSupply={(sup) => setSelectedSupply(sup)}
            onReportPollution={() => setActiveTab('report')}
            onProposeCleanup={(wb) => handleStartCreateCleanup(wb)}
          />
        );

      case 'explore':
        return (
          <ExploreView
            waterbodies={MOCK_WATERBODIES}
            reports={reports}
            missions={missions}
            onViewDetails={handleViewWaterbodyDetails}
            onViewMission={handleViewMissionDetails}
            onViewReport={handleViewReportDetails}
            onProposeCleanup={(reportOrWb) => handleStartCreateCleanup(reportOrWb)}
            onReportPollution={() => {
              setActiveTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'waterbody-detail':
        return (
          <WaterbodyDetailView
            waterbody={selectedWaterbody}
            missions={missions}
            onBack={() => setActiveTab('explore')}
            onProposeCleanup={(wb) => handleStartCreateCleanup(wb)}
            onViewMission={(m) => handleViewMissionDetails(m)}
          />
        );

      case 'cleanups':
        return (
          <CleanupsView
            waterbodies={MOCK_WATERBODIES}
            missions={missions}
            joinedMissionIds={joinedMissionIds}
            onViewMission={handleViewMissionDetails}
            onNavigateExplore={() => setActiveTab('explore')}
            onCreateCleanup={() => handleStartCreateCleanup()}
            onBecomeGuardian={handleOpenGuardian}
          />
        );

      case 'my-cleanups':
        return (
          <MyCleanupsView
            missions={missions}
            participations={participations}
            onViewMission={handleViewMissionDetails}
            onNavigateCleanups={() => setActiveTab('cleanups')}
            onOpenSubmitEvidence={(m) => setEvidenceTargetMission(m)}
            onOpenLeaveMission={(m) => setLeaveTargetMission(m)}
          />
        );

      case 'report':
        return (
          <ReportPollutionView
            onSubmitReportSuccess={handleReportSubmitted}
            onNavigateExplore={() => setActiveTab('explore')}
            onViewReport={(rep) => handleViewReportDetails(rep)}
            onProposeCleanup={(rep) => handleStartCreateCleanup(rep)}
          />
        );

      case 'report-detail':
        return (
          <ReportDetailView
            report={selectedReport}
            onBackToReports={() => setActiveTab('community')}
            onProposeCleanup={(rep) => handleStartCreateCleanup(rep)}
          />
        );

      case 'create-cleanup':
        return (
          <CreateCleanupView
            waterbodies={MOCK_WATERBODIES}
            initialData={createInitialData}
            onCancel={() => setActiveTab('cleanups')}
            onSubmitSuccess={(newMission) => handleMissionSubmitted(newMission)}
          />
        );

      case 'community':
        return (
          <CommunityView
            reports={reports}
            missions={missions}
            onViewReport={handleViewReportDetails}
            onProposeCleanup={(rep) => handleStartCreateCleanup(rep)}
            onViewMission={handleViewMissionDetails}
            onReportPollution={() => {
              setActiveTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'impact':
        return (
          <MyImpactView
            user={user}
            profile={profile}
            joinedMissionIds={joinedMissionIds}
            missions={missions}
            participations={participations}
            certificates={certificates}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onBecomeGuardian={handleOpenGuardian}
            onOpenSubmitEvidence={(m) => setEvidenceTargetMission(m)}
            onOpenLeaveMission={(m) => setLeaveTargetMission(m)}
            onGenerateCertificate={(record) => handleGenerateCertificate(record)}
            onViewCertificate={(cert) => handleViewCertificate(cert)}
            onVerifyPage={() => setActiveTab('verify')}
            onNavigateCleanups={() => setActiveTab('cleanups')}
          />
        );

      case 'certificate':
        return (
          <CertificateDetailView
            certificate={selectedCertificate}
            onBackToImpact={() => setActiveTab('impact')}
            onVerifyPage={() => setActiveTab('verify')}
          />
        );

      case 'verify':
        return (
          <VerifyCertificateView
            initialCertId={verifyTargetCertId}
            onBackToImpact={() => setActiveTab('impact')}
          />
        );

      default:
        return (
          <HomeView
            stats={MOCK_IMPACT_STATS}
            impactStats={MOCK_IMPACT_STATS}
            waterbodies={MOCK_WATERBODIES}
            supplies={MOCK_SUPPLIES}
            onExploreCleanups={() => setActiveTab('explore')}
            onBecomeGuardian={handleOpenGuardian}
            onViewMission={handleViewWaterbodyDetails}
            onSponsorSupply={(sup) => setSelectedSupply(sup)}
            onReportPollution={() => setActiveTab('report')}
            onProposeCleanup={(wb) => handleStartCreateCleanup(wb)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#DAF6F6] flex flex-col justify-between font-sans text-ocean-950 selection:bg-[#92F1EC] selection:text-ocean-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBecomeGuardian={handleOpenGuardian}
        onReportPollution={handleOpenReportModal}
        profile={profile}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={() => signOut()}
      />

      <main className="flex-grow">
        {renderActiveView()}
      </main>

      <Footer
        setActiveTab={setActiveTab}
        onBecomeGuardian={handleOpenGuardian}
      />

      <Toast
        message={toastInfo.message}
        type={toastInfo.type}
        onClose={() => setToastInfo({ message: '', type: 'success' })}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={isPasswordRecovery ? 'reset_password' : 'signin'}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          showToast('Welcome to AquaRise!', 'success');
        }}
      />

      <GuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}
        profile={profile}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onGuardianJoined={(data) => handleGuardianJoined(data)}
      />

      <MissionDetailModal
        mission={selectedMission}
        isOpen={Boolean(selectedMission)}
        onClose={() => setSelectedMission(null)}
        onSponsorClick={() => setSelectedSupply(MOCK_SUPPLIES[0])}
        onToast={showToast}
      />

      <ReportPollutionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleReportSubmitted}
      />

      <RemoteSupportModal
        supply={selectedSupply}
        isOpen={Boolean(selectedSupply)}
        onClose={() => setSelectedSupply(null)}
        onSponsorSuccess={(sup) => {
          updateProfile({ impactPoints: (profile.impactPoints || 0) + 30 });
          showToast(`Sponsored ${sup.name} (+30 Impact Points)!`);
        }}
      />

      <ProposeCleanupModal
        waterbody={proposeWaterbody}
        isOpen={Boolean(proposeWaterbody)}
        onClose={() => setProposeWaterbody(null)}
        onSubmitSuccess={(m) => handleMissionSubmitted(m)}
      />

      <SupplyPledgeModal
        mission={pledgeTargetMission}
        isOpen={Boolean(pledgeTargetMission)}
        onClose={() => setPledgeTargetMission(null)}
        onPledgeSuccess={(m, items) => {
          updateProfile({ impactPoints: (profile.impactPoints || 0) + 40 });
          showToast(`Pledged supplies for ${m.name} (+40 Impact Points)!`);
        }}
      />

      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaveProfile={handleProfileUpdate}
      />

      <SubmitCompletionEvidenceModal
        mission={evidenceTargetMission}
        existingRecord={evidenceTargetMission}
        isOpen={Boolean(evidenceTargetMission)}
        onClose={() => setEvidenceTargetMission(null)}
        onSubmitEvidence={(evidenceData) => handleEvidenceSubmitted(evidenceData)}
        onVerifySubmission={(recordId, newStatus, reason) => handleVerifySubmission(recordId, newStatus, reason)}
        userProfile={profile}
      />

      <LeaveMissionModal
        mission={leaveTargetMission}
        isOpen={Boolean(leaveTargetMission)}
        onClose={() => setLeaveTargetMission(null)}
        onConfirmLeave={(targetMissionOrId) => handleLeaveMission(targetMissionOrId)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AquaRiseApp />
    </AuthProvider>
  );
}
