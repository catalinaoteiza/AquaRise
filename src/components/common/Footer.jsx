import React from 'react';
import Logo from './Logo';
import { Heart, Globe, Github, Twitter, Instagram, Shield } from 'lucide-react';

export default function Footer({ onNavClick, onBecomeGuardian }) {
  return (
    <footer className="bg-ocean-950 border-t border-ocean-700/60 pt-16 pb-12 text-slate-400 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-ocean-800">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" />
            
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              AquaRise is a global environmental community empowering people to discover polluted waterbodies, organize community cleanup missions, track volunteer impact, and safeguard aquatic ecosystems.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a href="#github" className="p-2.5 rounded-full bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-aqua-400 transition-colors border border-ocean-700">
                <Github className="w-4 h-4" />
              </a>
              <a href="#twitter" className="p-2.5 rounded-full bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-aqua-400 transition-colors border border-ocean-700">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#instagram" className="p-2.5 rounded-full bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-aqua-400 transition-colors border border-ocean-700">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavClick('explore')} className="hover:text-aqua-400 transition-colors">
                  Explore Waterbodies
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('cleanups')} className="hover:text-aqua-400 transition-colors">
                  Cleanup Missions
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('report')} className="hover:text-aqua-400 transition-colors">
                  Report Pollution
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('community')} className="hover:text-aqua-400 transition-colors">
                  Guardian Community
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('verify')} className="hover:text-aqua-400 transition-colors">
                  Verify Certificate
                </button>
              </li>
            </ul>
          </div>

          {/* Environmental Mission Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Community Action</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavClick('cleanups')} className="hover:text-aqua-400 transition-colors">
                  Propose Cleanup Mission
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('cleanups')} className="hover:text-aqua-400 transition-colors">
                  Join Cleanup Missions
                </button>
              </li>
              <li>
                <button onClick={onBecomeGuardian} className="hover:text-aqua-400 transition-colors">
                  Guardian Registration
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('impact')} className="hover:text-aqua-400 transition-colors">
                  Guardian Impact Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Impact Statement */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Guardian Pledge</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every cleanup mission, pollution report, and supply contribution helps restore polluted lakes, rivers, and coastal ecosystems for future generations.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Community Driven Protection
              </span>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} AquaRise Community. Built for environmental waterbody protection.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Protecting aquatic ecosystems with</span>
            <Heart className="w-3.5 h-3.5 text-aqua-400 fill-aqua-400" />
            <span>worldwide</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
