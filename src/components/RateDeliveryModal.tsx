import React, { useState } from 'react';
import { Order } from '../types';
import {
  X,
  Star,
  Truck,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Coins,
  ShieldCheck,
  UserCheck,
  Package,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  language: 'bn' | 'en';
  onSubmitRating: (orderId: string, ratingData: { rating: number; comment: string; tags: string[] }) => void;
}

const DELIVERY_TAGS = [
  { id: 'fast_delivery', labelBn: '⚡ সুপার ফাস্ট ডেলিভারি', labelEn: '⚡ Super Fast Delivery' },
  { id: 'good_packaging', labelBn: '📦 নিখুঁত প্যাকেজিং', labelEn: '📦 Intact Packaging' },
  { id: 'polite_rider', labelBn: '🤝 রাইডারের অমায়িক ব্যবহার', labelEn: '🤝 Polite & Helpful Rider' },
  { id: 'ontime_call', labelBn: '📞 সময়মতো যোগাযোগ', labelEn: '📞 On-Time Pre-Call' },
  { id: 'accurate_location', labelBn: '📍 সঠিক ঠিকানায় পৌঁছানো', labelEn: '📍 Exact Location Delivery' },
  { id: 'safety_first', labelBn: '🛡️ নিরাপদ ও যত্নশীল হ্যান্ডলিং', labelEn: '🛡️ Safe Handling' }
];

export const RateDeliveryModal: React.FC<RateDeliveryModalProps> = ({
  isOpen,
  onClose,
  order,
  language,
  onSubmitRating
}) => {
  const [rating, setRating] = useState<number>(order?.deliveryRating?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(order?.deliveryRating?.comment || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(order?.deliveryRating?.tags || ['fast_delivery', 'good_packaging']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const getRatingFeedback = (val: number) => {
    switch (val) {
      case 5:
        return language === 'bn' ? '🌟 অসাধারণ ও সুপার ফাস্ট!' : '🌟 Outstanding & Super Fast!';
      case 4:
        return language === 'bn' ? '😊 বেশ ভালো ডেলিভারি অভিজ্ঞতা' : '😊 Very Good Delivery Experience';
      case 3:
        return language === 'bn' ? '🙂 মোটামুটি সন্তোষজনক' : '🙂 Average Delivery';
      case 2:
        return language === 'bn' ? '😐 প্রত্যাশার চেয়ে ধীরগতির' : '😐 Slower than expected';
      case 1:
        return language === 'bn' ? '😞 অসন্তোষজনক অভিজ্ঞতা' : '😞 Poor Experience';
      default:
        return language === 'bn' ? 'রেটিং সিলেক্ট করুন' : 'Select a rating';
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onSubmitRating(order.id, {
        rating,
        comment,
        tags: selectedTags
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const activeStarValue = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#f85606] via-[#d4380d] to-[#0a3871] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold shadow-inner">
              <Truck className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {language === 'bn' ? 'ডেলিভারি অভিজ্ঞতা রেট করুন' : 'Rate Your Delivery'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? `অর্ডার: ${order.id}` : `Order ID: ${order.id}`}
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 pb-20 sm:pb-6">
          {/* Rider / Courier Info Card */}
          <div className="bg-orange-50/60 dark:bg-gray-850 p-3.5 rounded-2xl border border-orange-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f85606] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <span>{language === 'bn' ? 'রেডএক্স / দারাজ এক্সপ্রেস রাইডার' : 'Express Delivery Rider'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {language === 'bn' ? `ডেলিভারি সম্পন্ন: ${order.orderDate}` : `Delivered on: ${order.orderDate}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-xl text-[11px] font-extrabold">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span>+10 Coins</span>
            </div>
          </div>

          {/* Star Rating Section */}
          <div className="text-center space-y-2 py-1">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {language === 'bn'
                ? 'রাইডারের আচরণ ও ডেলিভারি সেবা কেমন ছিল?'
                : 'How was the delivery speed and rider behavior?'}
            </p>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= activeStarValue;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-xl transition-all duration-150 transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-hidden"
                  >
                    <Star
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-extrabold text-[#f85606] dark:text-orange-400 animate-in fade-in">
              {getRatingFeedback(activeStarValue)}
            </p>
          </div>

          {/* Quick Feedback Tags */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-blue-500" />
              <span>{language === 'bn' ? 'কোন বিষয়গুলো ভালো লেগেছে?' : 'What did you like about the delivery?'}</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {DELIVERY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs sm:text-sm px-3.5 py-2 rounded-full border font-semibold transition cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-orange-950/60 border-[#f85606] text-[#f85606] dark:text-orange-400 shadow-2xs'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#f85606]" />}
                    <span>{language === 'bn' ? tag.labelBn : tag.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>{language === 'bn' ? 'অতিরিক্ত মন্তব্য বা পরামর্শ (ঐচ্ছিক)' : 'Detailed Comments (Optional)'}</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'ডেলিভারি সংক্রান্ত যেকোনো মন্তব্য লিখুন (যেমন: রাইডার খুব দ্রুত এসেছিলেন...)'
                  : 'Share your delivery thoughts (e.g., rider was courteous and on time...)'
              }
              className="w-full text-base sm:text-sm p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:border-[#f85606] outline-hidden transition resize-none min-h-[80px]"
            />
          </div>

          {/* Reward Info Note */}
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {language === 'bn'
                ? 'ডেলিভারি রেটিং সাবমিট করলেই আপনার একাউন্টে ১০টি কয়েন যোগ হবে।'
                : 'Submitting a delivery review awards +10 SmartCoins to your balance.'}
            </span>
          </div>

          {/* Actions Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              {language === 'bn' ? 'পরে দেব' : 'Maybe Later'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#f85606] to-[#e04d05] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-orange-500/25 transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>{language === 'bn' ? 'রেটিং সাবমিট করুন' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
