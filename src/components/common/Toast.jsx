import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className="bg-white border border-[#92F1EC] rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-md">
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-[#19887F] shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        )}
        <p className="text-xs font-bold text-[#071325] flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-[#475569] hover:text-[#071325] p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
