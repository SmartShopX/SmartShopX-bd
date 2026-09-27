import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Product, Review } from '../types';
import { X, Star, Upload, Image, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { AuthService } from '../services/marketplaceService';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddReview: (productId: string, review: Review) => void;
  language: 'bn' | 'en';
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddReview,
  language
}) => {
  const session = AuthService.getSession();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(session.fullName || '');
  const [location, setLocation] = useState('ঢাকা');
  const [comment, setComment] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check Purchase Authorization (Section 10)
  const purchaseStatus = product ? AuthService.verifyCustomerProductPurchase(product.id, session.customerId) : { canReview: true, verifiedPurchase: false };

  useEffect(() => {
    if (session.fullName) {
      setName(session.fullName);
    }
  }, [session.fullName]);

  if (!isOpen || !product) return null;

  const sampleReviewPhotos = [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: name.trim() || (language === 'bn' ? 'ভেরিফায়েড ক্রেতা' : 'Verified Buyer'),
      rating,
      date: language === 'bn' ? 'আজকে' : 'Just now',
      comment: comment.trim(),
      commentBn: comment.trim(),
      helpfulCount: 1,
      verifiedPurchase: purchaseStatus.verifiedPurchase,
      photos: selectedPhoto ? [selectedPhoto] : undefined,
      userLocation: location
    };

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      onAddReview(product.id, newReview);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="bg-[#f85606] text-white p-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              {language === 'bn' ? 'পণ্যের রিভিউ ও রেটিং লিখুন' : 'Write a Product Review'}
            </h3>
            <p className="text-[11px] text-white/80 line-clamp-1">
              {language === 'bn' ? product.titleBn : product.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 text-xs sm:text-sm pb-20 sm:pb-5">
          {/* Star Selector */}
          <div className="text-center space-y-2 py-3 bg-orange-50/50 dark:bg-orange-950/30 rounded-2xl border border-orange-100 dark:border-orange-800">
            <label className="block text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm">
              {language === 'bn' ? 'আপনার রেটিং নির্বাচন করুন' : 'Your Overall Rating'}
            </label>
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {rating === 5 && '🌟 চমৎকার (Excellent)'}
              {rating === 4 && '👍 ভালো (Very Good)'}
              {rating === 3 && '👌 সন্তোষজনক (Average)'}
              {rating <= 2 && '👎 আশানুরূপ নয় (Below Expectation)'}
            </p>
          </div>

          {/* Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
                {language === 'bn' ? 'আপনার নাম' : 'Your Name'}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'যেমন: হাসিব রহমান' : 'e.g. Hasib'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
                {language === 'bn' ? 'জেলা / শহর' : 'Location'}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'যেমন: ঢাকা / চট্টগ্রাম' : 'e.g. Dhaka'}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
              />
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
              {language === 'bn' ? 'আপনার মতামত লিখুন *' : 'Your Detailed Experience *'}
            </label>
            <textarea
              required
              rows={3}
              placeholder={language === 'bn' ? 'পণ্যের কোয়ালিটি, ডেলিভারি ও ব্যবহার কেমন লেগেছে লিখুন...' : 'Share product quality, delivery speed, and durability...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#f85606] font-normal text-base sm:text-sm min-h-[80px]"
            />
          </div>

          {/* Attach Real Photo Mock */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
              {language === 'bn' ? 'পণ্যের ছবি যোগ করুন (ঐচ্ছিক)' : 'Attach Product Photo (Optional)'}
            </label>
            <div className="flex items-center gap-2.5">
              {sampleReviewPhotos.map((imgUrl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedPhoto(selectedPhoto === imgUrl ? null : imgUrl)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 relative cursor-pointer min-w-[48px] min-h-[48px] ${
                    selectedPhoto === imgUrl ? 'border-[#f85606] ring-2 ring-orange-400' : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Sample preview" className="w-full h-full object-cover" />
                  {selectedPhoto === imgUrl && (
                    <div className="absolute inset-0 bg-[#f85606]/30 flex items-center justify-center text-white">
                      <CheckCircle className="w-4 h-4 fill-[#f85606]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 min-h-[46px] bg-[#f85606] hover:bg-[#e04d05] text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
          >
            {isSubmitting ? (language === 'bn' ? 'সাবমিট হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review')}
          </button>
        </form>
      </div>
    </div>
  );
};
