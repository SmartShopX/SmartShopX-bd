import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Truck, Tag, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSliderProps {
  language: 'bn' | 'en';
  onCategorySelect: (catId: string) => void;
  onOpenVouchers: () => void;
}

export const HeroBannerSlider: React.FC<HeroSliderProps> = ({
  language,
  onCategorySelect,
  onOpenVouchers
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badgeBn: 'মেগা ডিল উৎসব ২০২৬',
      badgeEn: 'MEGA DEALS FESTIVAL',
      titleBn: 'SmartShopX.bd মেগা ক্যাম্পেইনে সর্বোচ্চ ৭০% পর্যন্ত ছাড়!',
      titleEn: 'Up to 70% OFF on SmartShopX.bd Top Brand Electronics & Fashion!',
      subBn: 'বিকাশ ও নগদে অতিরিক্ত ১৫% ক্যাশব্যাক ভাউচার সহ ফ্রি ডেলিভারি',
      subEn: 'Free Home Delivery + Extra 15% bKash / Nagad Instant Cashback',
      ctaBn: 'অফার দেখুন',
      ctaEn: 'Shop Flash Deals',
      category: 'electronics',
      bgGrad: 'from-[#f85606] via-[#d4380d] to-[#7f1d1d]',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      badgeBn: '১০০% ক্যাশলেস ও অনলাইন শপিং',
      badgeEn: 'FAST ONLINE SHOPPING',
      titleBn: 'SmartShopX.bd-এ সেরা দামে দ্রুততম হোম ডেলিভারি',
      titleEn: 'Shop seamlessly with the fastest home delivery across Bangladesh',
      subBn: 'বিকাশ, নগদ, কার্ড ও ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)',
      subEn: 'Cash on delivery, bKash & Card payments available across all 64 districts.',
      ctaBn: 'কুপন সংগ্রহ করুন',
      ctaEn: 'Claim Vouchers',
      category: 'all',
      bgGrad: 'from-[#0b1a30] via-[#1e3a8a] to-[#1e1b4b]',
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      badgeBn: 'SmartMall অথেনটিক গ্যারান্টি',
      badgeEn: 'SMARTMALL OFFICIAL',
      titleBn: 'অরিজিনাল ব্র্যান্ডের অফিশিয়াল শোরুম এখন SmartShopX.bd-এ',
      titleEn: '100% Genuine Official Products with 14-Day Easy Return',
      subBn: 'শাওমি, অ্যাঙ্কার, বেসিউস, দি অর্ডিনারি এবং খাস ফুডের বিশ্বস্ত পণ্য',
      subEn: 'Authentic Xiaomi, Anker, Baseus, The Ordinary & Khaas Food essentials',
      ctaBn: 'মল এক্সপ্লোর করুন',
      ctaEn: 'Explore Mall',
      category: 'beauty',
      bgGrad: 'from-[#831843] via-[#9d174d] to-[#4c0519]',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full">
      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-900 min-h-[220px] sm:min-h-[300px] md:min-h-[340px]">
        {/* Slide Content */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-r ${
              slide.bgGrad
            } transition-opacity duration-700 ease-in-out flex items-center ${
              idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="w-full h-full px-4 sm:px-10 py-5 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              {/* Text content */}
              <div className="w-full md:w-3/5 text-white z-10">
                <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold text-yellow-300 border border-white/20 mb-2 sm:mb-3">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>{language === 'bn' ? slide.badgeBn : slide.badgeEn}</span>
                </div>
                <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold leading-snug sm:leading-tight tracking-tight mb-1.5 sm:mb-2 line-clamp-2">
                  {language === 'bn' ? slide.titleBn : slide.titleEn}
                </h1>
                <p className="text-[11px] sm:text-sm text-white/85 mb-3.5 sm:mb-6 max-w-xl line-clamp-2">
                  {language === 'bn' ? slide.subBn : slide.subEn}
                </p>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (slide.category === 'all') {
                        onOpenVouchers();
                      } else {
                        onCategorySelect(slide.category);
                      }
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer min-h-[38px] sm:min-h-[42px]"
                  >
                    <span>{language === 'bn' ? slide.ctaBn : slide.ctaEn}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenVouchers}
                    className="bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer min-h-[38px] sm:min-h-[42px]"
                  >
                    <Tag className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{language === 'bn' ? 'ভাউচার নিন' : 'Collect Vouchers'}</span>
                  </button>
                </div>
              </div>

              {/* Image presentation */}
              <div className="hidden md:flex md:w-2/5 justify-center items-center">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-yellow-400/30 rounded-3xl blur-xl group-hover:opacity-100 transition duration-500"></div>
                  <img
                    src={slide.image}
                    alt="Featured Promotion"
                    className="relative w-56 h-56 lg:w-64 lg:h-64 object-cover rounded-2xl border-2 border-white/40 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Feature Value Badges below banner (Daraz Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-3">
        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-2.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-orange-100/80 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {language === 'bn' ? 'অফলাইন ও অনলাইন শপিং' : 'Offline Shopping'}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
              {language === 'bn' ? 'ইন্টারনেট ছাড়াই সুরক্ষিত' : 'Zero network required'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-2.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {language === 'bn' ? '১০০% অরিজিনাল ব্র্যান্ড' : '100% Authentic'}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
              {language === 'bn' ? '৭ দিনের সহজ রিটার্ন' : 'Easy 7-day returns'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-2.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {language === 'bn' ? 'সারা দেশে দ্রুত ডেলিভারি' : 'Fast Delivery (64 Dist)'}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
              {language === 'bn' ? 'ক্যাশ অন ডেলিভারি সুবিধা' : 'Cash on delivery'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-2.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-purple-100/80 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {language === 'bn' ? 'মেগা ভাউচার ও ছাড়' : 'Mega Vouchers'}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
              {language === 'bn' ? 'দৈনিক কয়েন রিওয়ার্ডস' : 'Daily coin rewards'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
