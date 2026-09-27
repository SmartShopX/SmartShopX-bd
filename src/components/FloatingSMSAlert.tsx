import React, { useState, useEffect } from 'react';
import { SMSLog } from '../services/smsService';
import { MessageSquare, X, Smartphone, CheckCheck } from 'lucide-react';

export const FloatingSMSAlert: React.FC = () => {
  const [currentSMS, setCurrentSMS] = useState<SMSLog | null>(null);

  useEffect(() => {
    const handleSMSDispatched = (e: CustomEvent<SMSLog>) => {
      setCurrentSMS(e.detail);
      const timer = setTimeout(() => {
        setCurrentSMS(null);
      }, 7000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('smartshopx_sms_dispatched' as any, handleSMSDispatched as any);
    return () => {
      window.removeEventListener('smartshopx_sms_dispatched' as any, handleSMSDispatched as any);
    };
  }, []);

  if (!currentSMS) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100vw-32px)] bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                SMS সেন্ট ({currentSMS.gateway})
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                To: {currentSMS.recipientPhone}
              </span>
            </div>
            <button
              onClick={() => setCurrentSMS(null)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed font-sans line-clamp-3 bg-black/40 p-2 rounded-lg border border-white/5">
            "{currentSMS.message}"
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 px-0.5">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCheck className="w-3.5 h-3.5" /> ডেলিভার্ড সম্পন্ন
            </span>
            <span>{currentSMS.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
