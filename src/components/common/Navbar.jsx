import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Droplets, Compass, Flag, AlertTriangle, Users, Award, ShieldCheck, Bookmark } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ activeTab, setActiveTab, onBecomeGuardian, onReportPollution, profile, user, onOpenAuth, onSignOut }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isGuardian = Boolean(profile?.isGuardian);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Droplets },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'cleanups', label: 'Cleanups', icon: Flag },
    { id: 'my-cleanups', label: 'My Cleanups', icon: Bookmark },
    { id: 'report', label: 'Report Pollution', icon: AlertTriangle },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'impact', label: 'My Impact', icon: Award },
    { id: 'verify', label: 'Verify Cert', icon: ShieldCheck },
  ];

  const handleNavClick = (id) => {
    if (id === 'report') {
      onReportPollution();
      setActiveTab('report');
    } else {
      setActiveTab(id);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${
        isScrolled ? 'py-2.5 bg-[#19887F]/95 backdrop-blur-md shadow-md' : 'py-4 bg-[#19887F]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => handleNavClick('home')} className="cursor-pointer">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Container */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#19887F] p-1.5 rounded-full border border-[#35AEAC]/30 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#DAF6F6] text-[#071325] shadow-md scale-105'
                      : 'text-white hover:bg-[#DAF6F6] hover:text-[#071325]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? 'text-[#076DDF]' : 'text-[#92F1EC] group-hover:text-[#076DDF]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Guardian CTA & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBecomeGuardian}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DAF6F6] hover:bg-[#92F1EC] text-[#071325] font-black text-xs shadow-md transition-all duration-300 border border-[#92F1EC] cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#076DDF]" />
              <span>{isGuardian ? 'Guardian Profile' : 'Become a Guardian'}</span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                className="px-3.5 py-2 rounded-full bg-slate-900/30 hover:bg-slate-900/50 text-white font-bold text-xs border border-teal-300/30 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full bg-[#076DDF] hover:bg-[#3C92FF] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Sign In
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#19887F] border-b border-[#35AEAC]/40 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
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

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onBecomeGuardian();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#DAF6F6] text-[#071325] font-black text-xs border border-[#92F1EC] mt-4"
          >
            <Shield className="w-4 h-4 text-[#076DDF]" />
            <span>{isGuardian ? 'Guardian Profile' : 'Become a Guardian'}</span>
          </button>
        </div>
      )}
    </header>
  );
}
