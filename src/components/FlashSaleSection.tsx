import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Zap, Flame, Clock, ArrowRight } from 'lucide-react';

interface FlashSaleSectionProps {
  products: Product[];
  language: 'bn' | 'en';
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  language,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const flashProducts = products.filter((p) => p.isFlashSale);

  // Live countdown timer for the flash sale
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 }; // reset cycle
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2Digits = (num: number) => num.toString().padStart(2, '0');

  if (flashProducts.length === 0) return null;

  return (
    <section id="flash-sale-section" className="mb-6 sm:mb-8 scroll-mt-28">
      {/* Flash Sale Header Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-4 shadow-2xs border border-orange-100 dark:border-gray-800 mb-3 sm:mb-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Title & Countdown */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#f85606] text-white flex items-center justify-center shadow-xs">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-current animate-pulse" />
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                {language === 'bn' ? 'ফ্ল্যাশ সেল (Flash Sale)' : 'Flash Sale'}
              </h2>
            </div>

            {/* Countdown timer blocks */}
            <div className="flex items-center gap-1 sm:gap-1.5 ml-0 sm:ml-4 bg-orange-50 dark:bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-orange-200 dark:border-gray-700 text-[11px] sm:text-xs">
              <span className="text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {language === 'bn' ? 'বাকি:' : 'Ends:'}
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1 font-mono font-black text-white text-[10px] sm:text-xs">
                <span className="bg-[#f85606] px-1.5 sm:px-2 py-0.5 rounded-md min-w-[20px] sm:min-w-[24px] text-center">
                  {format2Digits(timeLeft.hours)}
                </span>
                <span className="text-[#f85606] font-bold">:</span>
                <span className="bg-[#f85606] px-1.5 sm:px-2 py-0.5 rounded-md min-w-[20px] sm:min-w-[24px] text-center">
                  {format2Digits(timeLeft.minutes)}
                </span>
                <span className="text-[#f85606] font-bold">:</span>
                <span className="bg-[#f85606] px-1.5 sm:px-2 py-0.5 rounded-md min-w-[20px] sm:min-w-[24px] text-center">
                  {format2Digits(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Value callout */}
          <div className="text-[11px] sm:text-xs text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-gray-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-orange-100 dark:border-gray-700 flex items-center gap-1 self-start sm:self-auto">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>
              {language === 'bn'
                ? 'সর্বোচ্চ ৭০% পর্যন্ত ছাড়'
                : 'Limited stock flash promotions'}
            </span>
          </div>
        </div>
      </div>

      {/* Flash Sale Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
        {flashProducts.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            language={language}
            isWishlisted={wishlist.includes(prod.id)}
            onToggleWishlist={onToggleWishlist}
            onAddToCart={onAddToCart}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </section>
  );
};
