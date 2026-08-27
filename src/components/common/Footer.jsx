import React from 'react';
import Logo from './Logo';
import { Heart, Globe, Github, Instagram, Shield } from 'lucide-react';

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
              <a
                href="https://www.instagram.com/aqua_riseapp/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AquaRise on Instagram"
                className="p-2.5 rounded-full bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-aqua-400 transition-colors border border-ocean-700"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@aquariseriseforpeople"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AquaRise on TikTok"
                className="p-2.5 rounded-full bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-aqua-400 transition-colors border border-ocean-700"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.19 6.338 6.338 0 0 0 10.857 4.407V8.822a8.232 8.232 0 0 0 4.77 1.526V6.903a4.78 4.78 0 0 1-1.001-.217z"/>
                </svg>
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
