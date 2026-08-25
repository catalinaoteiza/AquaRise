import React, { useState } from 'react';
import { X, Package, HeartHandshake, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export default function SupplyPledgeModal({ mission, isOpen, onClose, onPledgeSubmitted }) {
  const [pledgeItem, setPledgeItem] = useState('20 Trash Bags');
  const [pledgerName, setPledgerName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !mission) return null;

  const presetOptions = [
    '20 Heavy-Duty Trash Bags',
    '10 Pairs Safety Gloves',
    '5 N95 Safety Masks',
    'Case of Clean Drinking Water',
    'Hand Sanitizer & First Aid Packets',
    'Volunteer Energy Snacks & Fruit',
    'Custom Debris Grabber Sorter Kit'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPledge = {
      supplyName: pledgeItem,
      quantity: 1,
      pledgerName: pledgerName || 'Anonymous Guardian',
      pledgedAt: new Date().toISOString().split('T')[0]
    };
    onPledgeSubmitted(mission.id, newPledge);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-emerald/30 p-6 sm:p-8 shadow-2xl relative">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-ocean-900 hover:bg-ocean-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald/20 text-emerald border border-emerald/30">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald bg-emerald/10 px-2 py-0.5 rounded-full border border-emerald/20">
                  Demo Support Pledge
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Support This Mission</h3>
                <p className="text-xs text-slate-300">Pledge essential field supplies for {mission.title}.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Chen (or leave blank for Anonymous)"
                  value={pledgerName}
                  onChange={(e) => setPledgerName(e.target.value)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Supply Pledge</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {presetOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPledgeItem(opt)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                        pledgeItem === opt
                          ? 'bg-emerald/20 border-emerald text-emerald-light shadow-sm'
                          : 'bg-ocean-900 border-ocean-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>{opt}</span>
                      {pledgeItem === opt && <ShieldCheck className="w-4 h-4 text-emerald shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800 text-[11px] text-slate-400 text-center">
                💡 <strong>Demo Pledge Notice:</strong> No payment card required. Your pledge is recorded locally in AquaRise.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald via-teal-400 to-ocean-600 text-ocean-950 font-bold text-sm shadow-lg shadow-emerald/20 hover:scale-[1.01] transition-all"
                >
                  Confirm Demo Support Pledge
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald/20 border border-emerald text-emerald mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-white">Pledge Confirmed!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Thank you! Your pledge for <strong>{pledgeItem}</strong> has been logged for this mission.
            </p>

            <div className="pt-4">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-white font-semibold text-sm border border-ocean-600"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
