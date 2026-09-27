import React from 'react';
import { Product, Store } from '../types';
import { ProductCard } from './ProductCard';
import { ShieldCheck, Sparkles, CheckCircle2, RotateCcw, Truck, Store as StoreIcon, Star, ChevronRight } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface DarazMallProps {
  products: Product[];
  language: 'bn' | 'en';
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
  onSelectStore?: (storeId: string) => void;
}

export const DarazMallSection: React.FC<DarazMallProps> = ({
  products,
  language,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onSelectStore
}) => {
  const mallProducts = products.filter((p) => p.isDarazMall);
  const stores: Store[] = StorageService.getStores();

  return (
    <section id="smartmall-section" className="mb-6 sm:mb-8 space-y-4 scroll-mt-28">
      {/* DarazMall Brand Header */}
      <div className="bg-gradient-to-r from-[#0b1a30] via-[#132847] to-[#0b1a30] text-white rounded-2xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-950 flex items-center justify-center font-black text-base sm:text-lg shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#0b1a30]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
                  SmartMall
                </h2>
                <span className="bg-yellow-400 text-gray-950 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-1">
                {language === 'bn'
                  ? 'SmartShopX.bd-এ ১০০% অরিজিনাল ও অথেনটিক ব্র্যান্ডের অফিশিয়াল শোরুম'
                  : '100% Authentic Brands with Official Warranty on SmartShopX.bd'}
              </p>
            </div>
          </div>

          {/* Mall Guarantees */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-4 text-[10px] sm:text-xs text-gray-200">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 shrink-0" />
              <span>{language === 'bn' ? '১০০% আসল প্রোডাক্ট' : '100% Authentic'}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 shrink-0" />
              <span>{language === 'bn' ? '১৪ দিনের রিটার্ন' : '14 Days Return'}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
              <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 shrink-0" />
              <span>{language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Shipping'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Verified Stores Horizontal Carousel */}
      {onSelectStore && stores.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-[#f85606]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
                {language === 'bn' ? 'অফিসিয়াল ভেরিফাইড ব্র্যান্ড স্টোরসমূহ' : 'Official Verified Brand Stores'}
              </h3>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">
              {language === 'bn' ? 'নিজস্ব ল্যান্ডিং পেজসহ' : 'With Dedicated Landing Pages'}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {stores.map((st) => (
              <div
                key={st.id}
                onClick={() => onSelectStore(st.id)}
                className="min-w-[190px] sm:min-w-[220px] max-w-[220px] bg-gray-50 dark:bg-gray-850 hover:bg-orange-50/50 dark:hover:bg-gray-800 rounded-2xl p-3 border border-gray-200 dark:border-gray-750 hover:border-orange-300 dark:hover:border-orange-500/50 transition cursor-pointer flex flex-col justify-between group shrink-0"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={st.logo}
                      alt={st.name}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 bg-white shrink-0 group-hover:scale-105 transition"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#f85606] transition">
                        {language === 'bn' && st.nameBn ? st.nameBn : st.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {language === 'bn' && st.categoryBn ? st.categoryBn : st.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      {st.rating.toFixed(1)}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {st.responseRate}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-[11px] font-bold text-[#f85606] dark:text-orange-400 group-hover:translate-x-0.5 transition">
                  <span>{language === 'bn' ? 'দোকান দেখুন' : 'Visit Store'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mall Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
        {mallProducts.slice(0, 4).map((prod) => (
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
