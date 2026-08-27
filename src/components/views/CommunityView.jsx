import React, { useState, useMemo } from 'react';
import { Users, Globe2, Shield, AlertTriangle, MapPin, Info, Star, ArrowRight } from 'lucide-react';
import ReportCard from '../common/ReportCard';
import PublicGuardianCard from '../common/PublicGuardianCard';
import RegionalNetworkModal from '../modals/RegionalNetworkModal';
import { getDerivedRegionalNetworks } from '../../utils/regionalNetworks';

export default function CommunityView({
  profile,
  points,
  completedCount,
  volunteerHours,
  reports = [],
  missions = [],
  onViewReport,
  onViewMission,
  onProposeCleanup,
  onBecomeGuardian,
  onOpenReportForm,
  onReportPollution
}) {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const handleReportAction = onReportPollution || onOpenReportForm;

  // Derive genuine data-driven regional networks from stored profiles, missions, and reports
  const regionalNetworks = useMemo(() => {
    return getDerivedRegionalNetworks(profile, missions, reports);
  }, [profile, missions, reports]);

  return (
    <div className="bg-[#DAF6F6] min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#19887F] text-xs font-black uppercase tracking-wider shadow-sm border border-[#92F1EC]">
            <Users className="w-4 h-4 text-[#19887F]" />
            <span>Global Guardian Network & Community Reports</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#042F2E] font-normal tracking-tight">
            The <span className="text-[#0D9488] italic font-normal">AquaRise Community</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg font-medium">
            Explore community-submitted pollution reports or connect with regional AquaRise Guardian networks worldwide.
          </p>

          {/* View Switcher Tabs */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="bg-white p-1.5 rounded-full border border-[#92F1EC] inline-flex shadow-sm">
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-[#19887F] text-white shadow'
                    : 'text-slate-600 hover:text-ocean-950'
                }`}
              >
                Pollution Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
                  activeTab === 'chapters'
                    ? 'bg-[#076DDF] text-white shadow'
                    : 'text-slate-600 hover:text-ocean-950'
                }`}
              >
                Regional Networks ({regionalNetworks.length})
              </button>
            </div>
          </div>
        </div>

        {/* Featured Public Guardian Card Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider">
            <span>Active Community Guardian Spotlight</span>
            <span>Public Profile Preview</span>
          </div>
          <PublicGuardianCard
            profile={profile}
            points={points}
            completedCount={completedCount}
            volunteerHours={volunteerHours}
          />
        </div>

        {/* Community Reports Section */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#92F1EC] shadow-md">
              <div>
                <h2 className="text-xl font-bold text-ocean-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Community-Submitted Pollution Reports
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Geotagged environmental observations filed by Guardians. Community-submitted information may not yet be independently verified.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReportAction}
                className="px-5 py-2.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white text-xs font-bold shrink-0 shadow-md transition-all cursor-pointer"
              >
                + File a Pollution Report
              </button>
            </div>

            {reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onViewReport={onViewReport}
                    onViewDetails={onViewReport}
                    onProposeCleanup={onProposeCleanup}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#92F1EC] space-y-4 shadow-sm">
                <AlertTriangle className="w-12 h-12 text-[#19887F] mx-auto" />
                <h3 className="text-lg font-bold text-ocean-950">No community pollution reports yet</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Guardian-submitted pollution observations will appear here once members begin reporting affected waterbodies.
                </p>
                <button
                  type="button"
                  onClick={handleReportAction}
                  className="px-5 py-2.5 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  File a Pollution Report
                </button>
              </div>
            )}
          </div>
        )}

        {/* Real Data-Driven Regional Networks Section */}
        {activeTab === 'chapters' && (
          <div className="space-y-6">
            {regionalNetworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regionalNetworks.map((net) => (
                  <div key={net.id} className="bg-white p-6 rounded-3xl border border-[#92F1EC] space-y-4 shadow-md hover:border-[#35AEAC] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-teal-50 text-[#19887F] border border-teal-200">
                        <Globe2 className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#19887F] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        {net.location}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-ocean-950">{net.name}</h3>
                      <p className="text-xs text-slate-600 mt-1 font-semibold">{net.guardiansText}</p>
                    </div>

                    <button
                      onClick={() => setSelectedNetwork(net)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-ocean-950 font-bold text-xs border border-teal-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Connect with Regional Network</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#076DDF]" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* REQUIRED HONEST EMPTY STATE (REQUIREMENT #3) */
              <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#92F1EC] space-y-4 max-w-lg mx-auto shadow-md animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#19887F] border border-teal-200 mx-auto flex items-center justify-center">
                  <Globe2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-ocean-950">No regional Guardian networks yet.</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    As AquaRise Guardians join and organize local action, regional networks will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Regional Network Detail Modal */}
      <RegionalNetworkModal
        network={selectedNetwork}
        isOpen={Boolean(selectedNetwork)}
        onClose={() => setSelectedNetwork(null)}
        onViewMission={onViewMission}
        onViewReport={onViewReport}
      />
    </div>
  );
}
