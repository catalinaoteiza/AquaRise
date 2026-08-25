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

// Shared Supabase Community Missions Service (Stage 7B)
import {
  fetchCommunityMissions,
  createCommunityMission,
  fetchUserJoinedMissionIds,
  joinCommunityMission,
  leaveCommunityMission
} from './services/communityMissionService.js';

// Storage & Utilities
import {
  getStoredReports,
  saveStoredReport,
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
  const { user, profile, loading, signOut, updateProfile, updateGuardianStatus, leaveGuardianProgram, isPasswordRecovery } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [toastInfo, setToastInfo] = useState({ message: '', type: 'success' });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  const [participations, setParticipations] = useState(() => getStoredParticipations());
  const [certificates, setCertificates] = useState(() => getStoredCertificates());

  // Shared Supabase Community Missions & Joined IDs (Stage 7B)
  const [communityMissions, setCommunityMissions] = useState([]);
  const [joinedMissionIds, setJoinedMissionIds] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(true);

  const loadCommunityMissions = async () => {
    setLoadingMissions(true);
    try {
      const fetched = await fetchCommunityMissions();
      setCommunityMissions(fetched);
    } catch (err) {
      console.error('[AquaRise App] Error fetching community missions:', err);
    } finally {
      setLoadingMissions(false);
    }
  };

  const loadUserJoinedMissions = async () => {
    if (!user || !user.id) {
      setJoinedMissionIds([]);
      return;
    }
    try {
      const joined = await fetchUserJoinedMissionIds(user.id);
      setJoinedMissionIds(joined);
    } catch (err) {
      console.error('[AquaRise App] Error fetching joined mission IDs:', err);
    }
  };

  useEffect(() => {
    cleanDemoRecordsFromStorage();
    loadCommunityMissions();
  }, []);

  useEffect(() => {
    loadUserJoinedMissions();
  }, [user]);

  useEffect(() => {
    const syncParticipations = () => {
      setParticipations(getStoredParticipations());
      loadCommunityMissions();
      loadUserJoinedMissions();
    };
    window.addEventListener('aquarise_participation_changed', syncParticipations);
    window.addEventListener('storage', syncParticipations);
    return () => {
      window.removeEventListener('aquarise_participation_changed', syncParticipations);
      window.removeEventListener('storage', syncParticipations);
    };
  }, [user]);

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

  const handleStartCreateCleanup = (initialData = null) => {
    if (!user) {
      showToast('Please sign in to organize a cleanup mission.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    if (!profile?.isGuardian) {
      showToast('Only active AquaRise Guardians can organize cleanups. Become a Guardian first!', 'info');
      setIsGuardianModalOpen(true);
      return;
    }
    setCreateInitialData(initialData);
    setActiveTab('create-cleanup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateCommunityMission = async (missionData) => {
    if (!user) {
      showToast('You must be signed in to create a cleanup mission.', 'error');
      return { error: 'You must be signed in to create a cleanup mission.' };
    }
    const res = await createCommunityMission(missionData, user.id);
    if (res?.error) {
      return res;
    }
    if (res?.mission) {
      await loadCommunityMissions();
      await loadUserJoinedMissions();
      showToast('Community cleanup mission created and published!', 'success');
      return res;
    }
    return { error: 'Could not create mission.' };
  };

  const handleJoinMission = async (missionId, eventDate) => {
    if (!user) {
      showToast('Please sign in to join community cleanup missions.', 'info');
      setIsAuthModalOpen(true);
      return { error: 'Please sign in to join cleanups.' };
    }
    if (!profile?.isGuardian) {
      showToast('Become an AquaRise Guardian to join community cleanup missions.', 'info');
      setIsGuardianModalOpen(true);
      return { error: 'Become an AquaRise Guardian to join community cleanup missions.' };
    }
    const res = await joinCommunityMission(missionId, user.id, eventDate);
    if (res?.error) {
      showToast(res.error, 'error');
      return res;
    }
    await loadCommunityMissions();
    await loadUserJoinedMissions();
    showToast('You have joined this cleanup mission!', 'success');
    return { success: true };
  };

  const handleLeaveMission = async (missionId) => {
    if (!user) {
      return { error: 'Please sign in.' };
    }
    const res = await leaveCommunityMission(missionId, user.id);
    if (res?.error) {
      showToast(res.error, 'error');
      return res;
    }
    await loadCommunityMissions();
    await loadUserJoinedMissions();
    showToast('You have left the cleanup mission.', 'info');
    return { success: true };
  };

  const handleReportSubmitted = (newReport) => {
    saveStoredReport(newReport);
    setReports(getStoredReports());
    setIsReportModalOpen(false);
    showToast('Pollution report filed successfully.', 'success');
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const res = await updateProfile(updatedProfile);
      if (res?.error) {
        return res;
      }
      showToast('Profile changes saved.', 'success');
      return res;
    } catch (err) {
      showToast("We couldn't save your profile changes. Please try again.", 'error');
      return { error: "We couldn't save your profile changes." };
    }
  };

  const handleGuardianJoined = async (guardianData) => {
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

  const handleLeaveGuardianProgram = async () => {
    const res = await leaveGuardianProgram();
    if (res?.error) {
      return res;
    }
    showToast('You have left the Guardian Program. Your past impact history remains intact.', 'info');
    return res;
  };

  const handleEvidenceSubmitted = (evidenceData) => {
    saveParticipationRecord(evidenceData);
    setParticipations(getStoredParticipations());
    showToast('Evidence submitted for verification.', 'success');
  };

  const handleGenerateCertificate = (record) => {
    const isOfficial = isEvidenceOfficiallyVerified(record);

    const certData = {
      waterbodyName: record.waterbodyName || record.title || 'Waterbody Cleanup',
      guardianName: profile?.name || 'AquaRise Volunteer',
      organizerName: record.organizer || 'AquaRise Network',
      date: record.date || new Date().toLocaleDateString(),
      location: record.location || 'Local Waters',
      volunteerHours: record.volunteerHours || 3,
      debrisCollectedKg: record.debrisCollectedKg || 15,
      isVerified: isOfficial,
      issuerName: isOfficial ? 'AquaRise Environmental Verification Council' : 'AquaRise Self-Reported Log',
      verifiedAt: record.verifiedAt || new Date().toISOString()
    };

    const newCert = createCertificateRecord(certData);
    saveCertificateRecord(newCert);
    setCertificates(getStoredCertificates());
    setSelectedCertificate(newCert);
    setActiveTab('certificate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(isOfficial ? 'Official Certificate generated!' : 'Self-reported impact record saved.', 'success');
  };

  const handleViewCertificate = (cert) => {
    setSelectedCertificate(cert);
    setActiveTab('certificate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            user={user}
            profile={profile}
            onExploreCleanups={() => setActiveTab('cleanups')}
            onBecomeGuardian={handleOpenGuardian}
            onReportPollution={handleOpenReportModal}
            onProposeCleanup={(wb) => handleStartCreateCleanup(wb)}
          />
        );

      case 'explore':
        return (
          <ExploreView
            waterbodies={MOCK_WATERBODIES}
            communityMissions={communityMissions}
            joinedMissionIds={joinedMissionIds}
            user={user}
            profile={profile}
            onViewWaterbody={handleViewWaterbodyDetails}
            onProposeCleanup={(wb) => handleStartCreateCleanup(wb)}
            onViewMission={handleViewMissionDetails}
            onJoinMission={handleJoinMission}
            onLeaveMission={handleLeaveMission}
            onReportPollution={handleOpenReportModal}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onBecomeGuardian={handleOpenGuardian}
            onToast={showToast}
          />
        );

      case 'waterbody-detail':
        return (
          <WaterbodyDetailView
            waterbody={selectedWaterbody}
            onBackToExplore={() => setActiveTab('explore')}
            onProposeCleanup={(wb) => handleStartCreateCleanup(wb)}
            onReportPollution={(wb) => {
              setProposeWaterbody(wb);
              setIsReportModalOpen(true);
            }}
          />
        );

      case 'cleanups':
        return (
          <CleanupsView
            waterbodies={MOCK_WATERBODIES}
            missions={communityMissions}
            joinedMissionIds={joinedMissionIds}
            user={user}
            profile={profile}
            onViewMission={handleViewMissionDetails}
            onJoinMission={handleJoinMission}
            onLeaveMission={handleLeaveMission}
            onNavigateExplore={() => setActiveTab('explore')}
            onCreateCleanup={() => handleStartCreateCleanup()}
            onBecomeGuardian={handleOpenGuardian}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onToast={showToast}
          />
        );

      case 'my-cleanups':
        return (
          <MyCleanupsView
            user={user}
            profile={profile}
            communityMissions={communityMissions}
            joinedMissionIds={joinedMissionIds}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onBecomeGuardian={handleOpenGuardian}
            onNavigateCleanups={() => setActiveTab('cleanups')}
            onViewMission={handleViewMissionDetails}
            onJoinMission={handleJoinMission}
            onLeaveMission={handleLeaveMission}
            onOpenEvidenceModal={(m) => setEvidenceTargetMission(m)}
            onOpenLeaveModal={(m) => setLeaveTargetMission(m)}
            onToast={showToast}
          />
        );

      case 'report':
        return (
          <ReportPollutionView
            profile={profile}
            waterbodies={MOCK_WATERBODIES}
            onSubmitReportSuccess={(newReport) => handleReportSubmitted(newReport)}
            onNavigateExplore={() => setActiveTab('explore')}
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
            user={user}
            profile={profile}
            initialData={createInitialData}
            onCreateMission={handleCreateCommunityMission}
            onNavigateExplore={() => setActiveTab('explore')}
            onSubmitSuccess={(newMission) => {
              setActiveTab('cleanups');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'community':
        return (
          <CommunityView
            user={user}
            profile={profile}
            reports={reports}
            missions={communityMissions}
            onViewReport={handleViewReportDetails}
            onProposeCleanup={(rep) => handleStartCreateCleanup(rep)}
            onViewMission={handleViewMissionDetails}
            onOpenReportForm={() => {
              setActiveTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
            missions={communityMissions}
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
            user={user}
            profile={profile}
            onExploreCleanups={() => setActiveTab('cleanups')}
            onBecomeGuardian={handleOpenGuardian}
            onReportPollution={handleOpenReportModal}
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
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
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
        onLeaveGuardianProgram={handleLeaveGuardianProgram}
      />

      <MissionDetailModal
        mission={selectedMission}
        isOpen={Boolean(selectedMission)}
        onClose={() => setSelectedMission(null)}
        user={user}
        profile={profile}
        joinedMissionIds={joinedMissionIds}
        onJoinMission={handleJoinMission}
        onLeaveMission={handleLeaveMission}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onBecomeGuardian={handleOpenGuardian}
        onSponsorClick={() => setSelectedSupply(MOCK_SUPPLIES[0])}
        onToast={showToast}
      />

      <ReportPollutionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={(newReport) => handleReportSubmitted(newReport)}
        onNavigateReport={() => {
          setIsReportModalOpen(false);
          setActiveTab('report');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        profile={profile}
      />

      <RemoteSupportModal
        supplyItem={selectedSupply}
        isOpen={Boolean(selectedSupply)}
        onClose={() => setSelectedSupply(null)}
        onPledgeSuccess={(pledgeData) => {
          showToast(`Thank you for pledging support for ${pledgeData.itemName}!`, 'success');
        }}
      />

      <ProposeCleanupModal
        waterbody={proposeWaterbody}
        isOpen={Boolean(proposeWaterbody)}
        onClose={() => setProposeWaterbody(null)}
        onNavigateCreate={(prefill) => {
          setProposeWaterbody(null);
          handleStartCreateCleanup(prefill);
        }}
      />

      <SupplyPledgeModal
        mission={pledgeTargetMission}
        isOpen={Boolean(pledgeTargetMission)}
        onClose={() => setPledgeTargetMission(null)}
        onPledgeSubmitted={(data) => {
          showToast('Supply pledge recorded! Thank you for supporting this cleanup.', 'success');
          setPledgeTargetMission(null);
        }}
      />

      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaveProfile={(updatedProfile) => handleSaveProfile(updatedProfile)}
      />

      <SubmitCompletionEvidenceModal
        mission={evidenceTargetMission}
        isOpen={Boolean(evidenceTargetMission)}
        onClose={() => setEvidenceTargetMission(null)}
        onSubmitEvidence={(data) => handleEvidenceSubmitted(data)}
      />

      <LeaveMissionModal
        mission={leaveTargetMission}
        isOpen={Boolean(leaveTargetMission)}
        onClose={() => setLeaveTargetMission(null)}
        onLeaveConfirmed={(missionId) => {
          handleLeaveMission(missionId);
          setLeaveTargetMission(null);
        }}
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
