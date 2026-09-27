import React from 'react';
import { WifiOff, RefreshCw, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  simulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  pendingSyncCount: number;
  triggerSync: () => void;
  justSyncedToast: { show: boolean; count: number };
  dismissSyncedToast: () => void;
  language: 'bn' | 'en';
  onOpenOrders: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  simulatedOffline,
  toggleSimulatedOffline,
  pendingSyncCount,
  triggerSync,
  justSyncedToast,
  dismissSyncedToast,
  language,
  onOpenOrders
}) => {
  return (
    <>
      {/* Toast notification when orders sync */}
      {justSyncedToast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-[#0b1a30] text-white p-4 rounded-xl shadow-2xl border border-green-500/50 flex items-start gap-3 max-w-md">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="min-w-0">
              <p className="font-bold text-sm text-green-400">
                {language === 'bn' ? 'অফলাইন অর্ডার সফলভাবে সিঙ্ক হয়েছে!' : 'Offline Orders Synced!'}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                {language === 'bn'
                  ? `${justSyncedToast.count}টি অর্ডার সার্ভারে জমা নেওয়া হয়েছে এবং প্রসেসিং শুরু হয়েছে।`
                  : `${justSyncedToast.count} orders pushed to server and are now being processed.`}
              </p>
              <button
                onClick={onOpenOrders}
                className="mt-2 text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <span>{language === 'bn' ? 'অর্ডার ট্র্যাকিং দেখুন' : 'View Tracking'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={dismissSyncedToast}
              className="text-gray-400 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Offline Sticky Strip if offline */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-3 py-2 text-xs shadow-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300"></span>
              </span>
              <WifiOff className="w-4 h-4 shrink-0" />
              <div className="font-medium">
                <span className="font-bold">
                  {language === 'bn' ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active'}:
                </span>{' '}
                {language === 'bn'
                  ? 'আপনি নিরাপদে পণ্য দেখতে ও অর্ডার করতে পারেন। সব তথ্য ক্যাশে সংরক্ষিত হচ্ছে।'
                  : 'You can browse products and checkout seamlessly. Everything is locally cached.'}
                {simulatedOffline && (
                  <span className="ml-1.5 bg-white/25 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {language === 'bn' ? 'সিমুলেশন' : 'Simulated'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {pendingSyncCount > 0 && (
                <button
                  onClick={onOpenOrders}
                  className="bg-yellow-400 text-black px-2.5 py-1 rounded-md text-[11px] font-bold hover:bg-yellow-300 flex items-center gap-1 shadow-xs"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>
                    {language === 'bn'
                      ? `${pendingSyncCount}টি অর্ডার পেন্ডিং`
                      : `${pendingSyncCount} Pending Sync`}
                  </span>
                </button>
              )}

              {simulatedOffline && (
                <button
                  onClick={toggleSimulatedOffline}
                  className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold transition"
                >
                  {language === 'bn' ? 'অনলাইনে ফিরুন' : 'Go Online'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
