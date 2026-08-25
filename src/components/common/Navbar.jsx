import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Shield,
  Droplets,
  Compass,
  Flag,
  AlertTriangle,
  Users,
  Award,
  ShieldCheck,
  Bookmark,
  User,
  LogOut,
  ChevronDown,
  Settings
} from 'lucide-react';
import Logo from './Logo';

export default function Navbar({
  activeTab,
  setActiveTab,
  onBecomeGuardian,
  onReportPollution,
  profile,
  user,
  onOpenAuth,
  onSignOut,
  onOpenEditProfile
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const isGuardian = Boolean(profile?.isGuardian);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary navigation (public)
  const primaryNavItems = [
    { id: 'home', label: 'Home', icon: Droplets },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'cleanups', label: 'Cleanups', icon: Flag },
    { id: 'report', label: 'Report Pollution', icon: AlertTriangle },
    { id: 'community', label: 'Community', icon: Users },
  ];

  const handleNavClick = (id) => {
    if (id === 'report') {
      onReportPollution();
      setActiveTab('report');
    } else {
      setActiveTab(id);
    }
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDropdownSelect = (action) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    if (typeof action === 'function') {
      action();
    } else if (typeof action === 'string') {
      handleNavClick(action);
    }
  };

  const userDisplayName = profile?.displayName || profile?.fullName || profile?.name || 'Member';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${
        isScrolled ? 'py-2.5 bg-[#19887F]/95 backdrop-blur-md shadow-md' : 'py-3.5 bg-[#19887F]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <div onClick={() => handleNavClick('home')} className="cursor-pointer">
            <Logo size="md" />
          </div>

          {/* Primary Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#19887F] p-1.5 rounded-full border border-[#35AEAC]/30 shadow-inner">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#DAF6F6] text-[#071325] shadow-md scale-105'
                      : 'text-white hover:bg-[#DAF6F6] hover:text-[#071325]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? 'text-[#076DDF]' : 'text-[#92F1EC]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action / Auth & Profile Dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              /* Authenticated User Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-teal-300/30 transition-all cursor-pointer shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#DAF6F6] text-[#076DDF] flex items-center justify-center font-extrabold text-[11px] shrink-0 border border-[#92F1EC]">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      userDisplayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[120px] truncate font-extrabold">{userDisplayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#92F1EC] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#92F1EC] shadow-2xl py-2 z-50 animate-fadeIn text-ocean-950 text-xs">
                    
                    {/* User Info Header */}
                    <div className="px-4 py-2.5 border-b border-teal-100 bg-teal-50/50 rounded-t-2xl">
                      <p className="font-black text-ocean-950 truncate">{userDisplayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {isGuardian && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          <span>Guardian</span>
                        </span>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleDropdownSelect('my-cleanups')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 text-slate-700 hover:text-ocean-950 font-bold transition-colors cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-[#076DDF]" />
                        <span>My Cleanups</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDropdownSelect('impact')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 text-slate-700 hover:text-ocean-950 font-bold transition-colors cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-[#35AEAC]" />
                        <span>My Impact</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDropdownSelect(onBecomeGuardian)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 text-slate-700 hover:text-ocean-950 font-bold transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-[#19887F]" />
                        <span>{isGuardian ? 'Guardian Profile' : 'Become a Guardian'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDropdownSelect('verify')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 text-slate-700 hover:text-ocean-950 font-bold transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#076DDF]" />
                        <span>Verify Certificate</span>
                      </button>

                      {onOpenEditProfile && (
                        <button
                          type="button"
                          onClick={() => handleDropdownSelect(onOpenEditProfile)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 text-slate-700 hover:text-ocean-950 font-bold transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Edit Account Profile</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-teal-100 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDropdownSelect(onSignOut)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-700 font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* Signed-Out Visitors */
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-5 py-2 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#19887F] border border-[#35AEAC]/40 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#19887F] border-b border-[#35AEAC]/40 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-fadeIn text-xs font-bold text-white">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-[#DAF6F6] text-[#071325]'
                    : 'text-white hover:bg-[#DAF6F6] hover:text-[#071325]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#076DDF]" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {user ? (
            <div className="pt-3 border-t border-[#35AEAC]/40 space-y-2">
              <button
                onClick={() => handleNavClick('my-cleanups')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
              >
                <Bookmark className="w-4 h-4 text-[#92F1EC]" />
                <span>My Cleanups</span>
              </button>

              <button
                onClick={() => handleNavClick('impact')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
              >
                <Award className="w-4 h-4 text-[#92F1EC]" />
                <span>My Impact</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBecomeGuardian();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
              >
                <Shield className="w-4 h-4 text-[#92F1EC]" />
                <span>{isGuardian ? 'Guardian Profile' : 'Become a Guardian'}</span>
              </button>

              <button
                onClick={() => handleNavClick('verify')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
              >
                <ShieldCheck className="w-4 h-4 text-[#92F1EC]" />
                <span>Verify Certificate</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/20 text-rose-200 font-extrabold border border-rose-400/30 mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#35AEAC]/40">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#076DDF] text-white font-extrabold shadow-md mt-2"
              >
                <User className="w-4 h-4 text-white" />
                <span>Sign In to AquaRise</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
