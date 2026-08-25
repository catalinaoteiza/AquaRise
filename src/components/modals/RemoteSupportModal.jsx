import React, { useState } from 'react';
import { X, Package, HeartHandshake, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RemoteSupportModal({ supply, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !supply) return null;

  const totalCost = supply.unitCost * quantity;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setQuantity(1);
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
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Sponsor Field Supplies</h3>
                <p className="text-xs text-slate-300">Equip on-the-ground volunteer Guardians remotely.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-white">{supply.name}</span>
                <span className="text-emerald font-extrabold">${supply.unitCost} / pack</span>
              </div>
              <p className="text-xs text-slate-400">{supply.unitDescription}</p>
              <div className="pt-2 border-t border-ocean-800 text-xs text-emerald-light flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{supply.impactMsg}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Quantity</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        quantity === num
                          ? 'bg-emerald text-ocean-950 border-emerald shadow-md'
                          : 'bg-ocean-900 text-slate-300 border-ocean-700 hover:border-slate-500'
                      }`}
                    >
                      {num} {num === 1 ? 'Pack' : 'Packs'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-ocean-950 border border-ocean-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-300">Simulated Total Sponsorship:</span>
                <span className="text-2xl font-black text-white">${totalCost} USD</span>
              </div>

              <div className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-center">
                Simulated Hackathon Action: No payment card or money will be charged.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald via-teal-400 to-ocean-600 text-ocean-950 font-bold text-sm shadow-lg shadow-emerald/20 hover:scale-[1.01] transition-all"
                >
                  Confirm Simulated Sponsorship
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald/20 border border-emerald text-emerald mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-white">Thank You, Remote Guardian!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your simulated donation of <strong>{quantity}x {supply.name}</strong> will equip frontline Guardians on upcoming cleanup missions.
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
