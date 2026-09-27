import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Voucher } from '../types';
import {
  X,
  Tag,
  Coins,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Gift,
  Copy,
  Check
} from 'lucide-react';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onCollectVoucher: (code: string) => void;
  coins: number;
  onDailyCheckIn: () => void;
  hasCheckedInToday: boolean;
  language: 'bn' | 'en';
}

export const VoucherCenterModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  onCollectVoucher,
  coins,
  onDailyCheckIn,
  hasCheckedInToday,
  language
}) => {
  if (!isOpen) return null;

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCheckIn = () => {
    if (!hasCheckedInToday) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });
      onDailyCheckIn();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-[#f85606] to-[#ff7a00] text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {language === 'bn' ? 'SmartShopX.bd ভাউচার ও কয়েন রিওয়ার্ডস' : 'SmartShopX.bd Vouchers & Daily Coins'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? 'প্রতিদিন কয়েন জমিয়ে কেনাকাটায় ছাড় পান' : 'Collect coins & save on every checkout'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 pb-20 sm:pb-6">
          {/* Daily Coins Check-In Widget */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-yellow-200">
                  <Coins className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-yellow-300">{coins}</span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                      {language === 'bn' ? 'স্মার্ট কয়েন' : 'Smart Coins'}
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5">
                    {language === 'bn'
                      ? `মূল্যমান: ৳${Math.floor(coins / 10)} (চেকআউটে সরাসরি ক্যাশ ছাড়)`
                      : `Value: ৳${Math.floor(coins / 10)} discount at checkout`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={hasCheckedInToday}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  hasCheckedInToday
                    ? 'bg-white/30 text-white cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-300 text-gray-950'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>
                  {hasCheckedInToday
                    ? (language === 'bn' ? 'আজকের কয়েন সংগ্রহ করা হয়েছে' : 'Checked In Today')
                    : (language === 'bn' ? 'দৈনিক ৫০ কয়েন নিন (+৫০)' : 'Check In (+50 Coins)')}
                </span>
              </button>
            </div>
          </div>

          {/* Vouchers List */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#f85606] dark:text-orange-400" />
              <span>{language === 'bn' ? 'উপলব্ধ মেগা ভাউচারসমূহ' : 'Available Mega Vouchers'}</span>
            </h4>

            <div className="space-y-3">
              {vouchers.map((v) => (
                <div
                  key={v.code}
                  className="bg-white dark:bg-gray-850 rounded-2xl border-2 border-dashed border-orange-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#f85606] dark:hover:border-orange-500 transition shadow-2xs"
                >
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-gray-800 text-[#f85606] dark:text-orange-400 flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#f85606] text-white text-[10px] font-black px-2 py-0.5 rounded">
                          {language === 'bn' ? v.badgeBn : v.badge}
                        </span>
                        <span className="font-mono font-black text-gray-800 dark:text-gray-200 text-sm">{v.code}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm mt-1">
                        {language === 'bn' ? v.titleBn : v.titleEn}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {language === 'bn' ? `সর্বনিম্ন খরচ: ৳${v.minSpend}` : `Min. Spend: ৳${v.minSpend}`} | {language === 'bn' ? `মেয়াদ: ${v.expiresAt}` : `Expires: ${v.expiresAt}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleCopy(v.code)}
                      className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 text-xs flex items-center gap-1 transition cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedCode === v.code ? (
                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onCollectVoucher(v.code)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        v.isCollected
                          ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800'
                          : 'bg-[#f85606] hover:bg-[#d84a05] text-white shadow-xs'
                      }`}
                    >
                      {v.isCollected
                        ? (language === 'bn' ? 'সংগৃহীত ✓' : 'Collected ✓')
                        : (language === 'bn' ? 'সংগ্রহ করুন' : 'Collect')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
