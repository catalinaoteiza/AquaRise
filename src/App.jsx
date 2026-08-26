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
import ReviewerDashboardModal from './components/modals/ReviewerDashboardModal';

// Shared Supabase Completion & Reviewer Service (Stage 7D)
import {
  isCompletionReviewer,
  getMyCertificates
} from './services/completionService.js';

// Shared Supabase Community Missions Service (Stage 7B)
import {
  fetchCommunityMissions,
  createCommunityMission,
  fetchUserJoinedMissionIds,
  joinCommunityMission,
  leaveCommunityMission
} from './services/communityMissionService.js';

// Shared Supabase Pollution Reports Service (Stage 7C)
import {
  fetchPollutionReports,
  createPollutionReport
} from './services/pollutionReportService.js';

// Storage & Utilities
import {
  getStoredParticipations,
  saveParticipationRecord,
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

  // Stage 7D Reviewer & Real Certificates State
  const [isReviewer, setIsReviewer] = useState(false);
  const [isReviewerDashboardOpen, setIsReviewerDashboardOpen] = useState(false);
  const [realCertificates, setRealCertificates] = useState([]);

  // Shared Supabase Pollution Reports (Stage 7C)
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Local Storage Synchronized State
  const [participations, setParticipations] = useState(() => getStoredParticipations());
  const [certificates, setCertificates] = useState(() => getStoredCertificates());

  // Shared Supabase Community Missions & Joined IDs (Stage 7B)
  const [communityMissions, setCommunityMissions] = useState([]);
  const [joinedMissionIds, setJoinedMissionIds] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(true);

  const loadPollutionReports = async () => {
    setLoadingReports(true);
    try {
      const fetched = await fetchPollutionReports();
      setReports(fetched);
    } catch (err) {
      console.error('[AquaRise App] Error fetching pollution reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

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

  const loadReviewerStatusAndCertificates = async () => {
    if (!user || !user.id) {
      setIsReviewer(false);
      setRealCertificates([]);
      return;
    }

    try {
      const reviewerRes = await isCompletionReviewer();
      setIsReviewer(reviewerRes);

      const certs = await getMyCertificates();
      setRealCertificates(certs);
    } catch (err) {
      console.error('[AquaRise App] Error checking reviewer status or certificates:', err);
    }
  };

  useEffect(() => {
    cleanDemoRecordsFromStorage();
    loadCommunityMissions();
    loadPollutionReports();
  }, []);

  useEffect(() => {
    loadUserJoinedMissions();
    loadReviewerStatusAndCertificates();
  }, [user]);

  useEffect(() => {
    const syncParticipations = () => {
      setParticipations(getStoredParticipations());
      loadCommunityMissions();
      loadUserJoinedMissions();
      loadPollutionReports();
      loadReviewerStatusAndCertificates();
    };
    window.addEventListener('aquarise_participation_changed', syncParticipations);
    window.addEventListener('aquarise_report_created', syncParticipations);
    window.addEventListener('storage', syncParticipations);
    return () => {
      window.removeEventListener('aquarise_participation_changed', syncParticipations);
      window.removeEventListener('aquarise_report_created', syncParticipations);
      window.removeEventListener('storage', syncParticipations);
    };
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToastInfo({ message, type });
  };

  const handleOpenGuardian = () => setIsGuardianModalOpen(true);
  const handleOpenReportModal = () => {
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setSelectedMissionDetail(mission);
    setActiveTab('mission-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCreateCleanup = (prefillData = null) => {
    setCreateInitialData(prefillData);
    setActiveTab('create-cleanup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoinMission = async (missionId) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await joinCommunityMission(user.id, missionId);
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      showToast(res.message || 'Successfully joined community mission!', 'success');
      loadUserJoinedMissions();
      loadCommunityMissions();
    } catch (err) {
      showToast('Could not join mission. Please try again.', 'error');
    }
  };

  const handleLeaveMission = async (missionId) => {
    if (!user) return;
    try {
      const res = await leaveCommunityMission(user.id, missionId);
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      showToast(res.message || 'You have left the community mission.', 'info');
      loadUserJoinedMissions();
      loadCommunityMissions();
    } catch (err) {
      showToast('Could not leave mission. Please try again.', 'error');
    }
  };

  const handleCreateCommunityMission = async (missionPayload) => {
    if (!user || !profile?.isGuardian) {
      showToast('You must be a verified AquaRise Guardian to publish community missions.', 'error');
      return { mission: null, error: 'Guardian status required.' };
    }

    try {
      const res = await createCommunityMission(missionPayload, user.id);
      if (res.error) {
        showToast(res.error, 'error');
        return res;
      }

      showToast('Community mission published successfully!', 'success');
      loadCommunityMissions();
      loadUserJoinedMissions();
      return res;
    } catch (err) {
      showToast('Failed to publish community mission.', 'error');
      return { mission: null, error: 'Publish failed' };
    }
  };

  const handleReportSubmitted = async (reportPayload) => {
    showToast('Pollution report submitted successfully to shared community map!', 'success');
    loadPollutionReports();
    setActiveTab('community');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const res = await updateProfile(updatedProfile);
      if (res?.error) {
        showToast(res.error, 'error');
        return res;
      }
      showToast('Profile updated successfully!', 'success');
      return res;
    } catch (err) {
      showToast('Could not save profile changes.', 'error');
      return { profile: null, error: 'Save failed' };
    }
  };

  const handleGuardianJoined = async (guardianData) => {
    try {
      const res = await updateGuardianStatus(guardianData);
      if (res?.error) {
        showToast(res.error, 'error');
        return res;
      }
      showToast('Welcome to the AquaRise Guardian Program!', 'success');
      setIsGuardianModalOpen(false);
      return res;
    } catch (err) {
      showToast('Could not update Guardian status.', 'error');
      return { profile: null, error: 'Update failed' };
    }
  };

  const handleLeaveGuardianProgram = async () => {
    try {
      const res = await leaveGuardianProgram();
      if (res?.error) {
        showToast(res.error, 'error');
        return res;
      }
      showToast('You have left the Guardian Program.', 'info');
      setIsGuardianModalOpen(false);
      return res;
    } catch (err) {
      showToast('Could not update Guardian status.', 'error');
      return { profile: null, error: 'Update failed' };
    }
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
              setActiveTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
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
            user={user}
            profile={profile}
            waterbodies={MOCK_WATERBODIES}
            onSubmitReportSuccess={(newReport) => handleReportSubmitted(newReport)}
            onNavigateExplore={() => setActiveTab('community')}
            onViewReport={(rep) => handleViewReportDetails(rep)}
            onProposeCleanup={(rep) => handleStartCreateCleanup(rep)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
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

      case 'mission-detail':
        return (
          <MissionDetailView
            mission={selectedMissionDetail}
            user={user}
            profile={profile}
            joinedMissionIds={joinedMissionIds}
            onBack={() => setActiveTab('cleanups')}
            onJoinMission={handleJoinMission}
            onLeaveMission={handleLeaveMission}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onBecomeGuardian={handleOpenGuardian}
            onSponsorClick={() => setSelectedSupply(MOCK_SUPPLIES[0])}
            onToast={showToast}
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
            certificates={realCertificates.length > 0 ? realCertificates : certificates}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onBecomeGuardian={handleOpenGuardian}
            onOpenSubmitEvidence={(m) => setEvidenceTargetMission(m)}
            onOpenLeaveMission={(m) => setLeaveTargetMission(m)}
            onViewCertificate={(cert) => handleViewCertificate(cert)}
            onVerifyPage={() => setActiveTab('verify')}
            onNavigateCleanups={() => setActiveTab('cleanups')}
          />
        );

      case 'certificate':
        return (
          <CertificateDetailView
            certificate={selectedCertificate}
            onBack={() => setActiveTab('impact')}
            onVerifyLinkClick={(code) => {
              setVerifyTargetCertId(code);
              setActiveTab('verify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'verify':
        return (
          <VerifyCertificateView
            initialCertId={verifyTargetCertId}
            onNavigateHome={() => setActiveTab('home')}
            onViewCertificate={(cert) => handleViewCertificate(cert)}
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
        isReviewer={isReviewer}
        onOpenReviewerDashboard={() => setIsReviewerDashboardOpen(true)}
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
        onNavigateReport={() => {
          setIsReportModalOpen(false);
          setActiveTab('report');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
        onSubmissionChanged={() => {
          loadUserJoinedMissions();
          loadReviewerStatusAndCertificates();
        }}
        onViewCertificate={(cert) => {
          setSelectedCertificate(cert);
          setActiveTab('certificate');
          setEvidenceTargetMission(null);
        }}
        userProfile={profile}
        onToast={showToast}
      />

      <ReviewerDashboardModal
        isOpen={isReviewerDashboardOpen}
        onClose={() => setIsReviewerDashboardOpen(false)}
        userProfile={profile}
        onToast={(msg, type) => {
          showToast(msg, type);
          loadUserJoinedMissions();
          loadReviewerStatusAndCertificates();
        }}
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
