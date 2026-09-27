import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Gift, Coins, Trophy, RotateCw } from 'lucide-react';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onWinReward: (rewardType: 'coins' | 'voucher', value: number, text: string) => void;
  language: 'bn' | 'en';
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  coins,
  onWinReward,
  language
}) => {
  if (!isOpen) return null;

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  const segments = [
    { label: '50 Coins', labelBn: '৫০ কয়েন', color: '#f85606', type: 'coins', val: 50 },
    { label: '৳100 OFF', labelBn: '৳১০০ ছাড়', color: '#0a3871', type: 'voucher', val: 100 },
    { label: '25 Coins', labelBn: '২৫ কয়েন', color: '#ff9800', type: 'coins', val: 25 },
    { label: 'Free Ship', labelBn: 'ফ্রি শিপিং', color: '#00c853', type: 'voucher', val: 60 },
    { label: '100 Coins', labelBn: '১০০ কয়েন', color: '#e91e63', type: 'coins', val: 100 },
    { label: '10 Coins', labelBn: '১০ কয়েন', color: '#7c4dff', type: 'coins', val: 10 }
  ];

  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setWinMessage(null);

    const randomIndex = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    const extraRounds = 5 * 360; // 5 full rotations
    const targetRotation = rotation + extraRounds + (360 - randomIndex * segmentAngle - segmentAngle / 2);

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpunToday(true);
      const won = segments[randomIndex];

      const rewardText = language === 'bn'
        ? `অভিনন্দন! আপনি জিতেছেন ${won.labelBn}!`
        : `Congratulations! You won ${won.label}!`;

      setWinMessage(rewardText);
      onWinReward(won.type as any, won.val, rewardText);

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#f85606] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {language === 'bn' ? 'দৈনিক লাকি স্পিন ও রিওয়ার্ডস' : 'Daily Spin & Win Rewards'}
              </h3>
              <p className="text-[11px] text-white/90">
                {language === 'bn' ? 'প্রতিদিন ফ্রি স্পিন করে জিতুন কয়েন ও মেগা ভাউচার' : 'Spin daily to win coins & discount coupons'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 flex flex-col items-center justify-center space-y-5 pb-20 sm:pb-6">
          {/* Wheel Graphic */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Top Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-md" />

            {/* Rotating Wheel Container */}
            <div
              className="w-full h-full rounded-full border-4 border-yellow-400 shadow-xl overflow-hidden relative transition-all duration-[3500ms] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {segments.map((seg, i) => {
                const angle = (360 / segments.length) * i;
                return (
                  <div
                    key={i}
                    className="absolute w-full h-full top-0 left-0 flex items-start justify-center pt-3 text-white font-extrabold text-[11px] shadow-2xs"
                    style={{
                      transformOrigin: '50% 50%',
                      transform: `rotate(${angle}deg)`,
                      backgroundColor: seg.color,
                      clipPath: 'polygon(50% 50%, 20% 0, 80% 0)'
                    }}
                  >
                    <span className="mt-2 text-center drop-shadow-sm transform -rotate-90">
                      {language === 'bn' ? seg.labelBn : seg.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center Pin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || hasSpunToday}
              className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 border-4 border-white dark:border-gray-800 shadow-lg flex flex-col items-center justify-center text-gray-950 font-black text-xs hover:scale-105 active:scale-95 transition disabled:opacity-80 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin text-orange-600' : ''}`} />
              <span className="text-[10px] uppercase tracking-tighter">
                {isSpinning ? 'SPIN...' : (hasSpunToday ? 'DONE' : 'SPIN')}
              </span>
            </button>
          </div>

          {/* Win Message */}
          {winMessage && (
            <div className="w-full p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-center text-xs font-bold animate-bounce">
              {winMessage}
            </div>
          )}

          {/* Spin Action */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || hasSpunToday}
            className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
              hasSpunToday
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#f85606] to-[#ff7a00] text-white hover:opacity-95'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>
              {hasSpunToday
                ? (language === 'bn' ? 'আজকের স্পিন সম্পন্ন হয়েছে (আগামীকাল আবার আসুন)' : 'Spun Today! Come back tomorrow')
                : (language === 'bn' ? 'এখনই ফ্রি স্পিন করুন' : 'Spin Now for Free Rewards')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
