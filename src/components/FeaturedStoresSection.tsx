import React from 'react';
import { Store as StoreType } from '../types';
import { Store, Star, ChevronRight, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedStoresSectionProps {
  stores: StoreType[];
  language: 'bn' | 'en';
  onSelectStore: (store: StoreType) => void;
}

export const FeaturedStoresSection: React.FC<FeaturedStoresSectionProps> = ({
  stores,
  language,
  onSelectStore
}) => {
  if (!stores || stores.length === 0) return null;

  return (
    <section className="bg-white dark:bg-gray-900 rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs transition-colors">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f85606] to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <span>{language === 'bn' ? 'স্মার্ট বিজনেস ভেরিফাইড দোকানসমূহ' : 'Featured Verified Stores'}</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {language === 'bn'
                ? 'আসল পণ্য ও দ্রুততম ডেলিভারির বিশ্বস্ত মার্চেন্ট'
                : 'Authentic products from verified Smart Business merchants'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectStore(stores[0])}
          className="text-xs font-bold text-[#f85606] hover:text-[#d84a05] dark:text-orange-400 flex items-center gap-0.5 cursor-pointer transition"
        >
          <span>{language === 'bn' ? 'সব দোকান' : 'All Stores'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stores Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stores.map((store) => {
          const name = language === 'bn' && store.nameBn ? store.nameBn : store.name;
          const category = language === 'bn' && store.categoryBn ? store.categoryBn : store.category;

          return (
            <div
              key={store.id}
              onClick={() => onSelectStore(store)}
              className="bg-gray-50/80 dark:bg-gray-850 rounded-2xl p-3 border border-gray-200/80 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Store Logo & Verified badge */}
                <div className="relative mb-2.5">
                  <img
                    src={store.logo}
                    alt={name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-xs bg-white mx-auto group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white dark:border-gray-900 shadow-2xs">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>

                {/* Store Name & Category */}
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 text-center truncate group-hover:text-[#f85606] transition-colors">
                  {name}
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center truncate mt-0.5">
                  {category}
                </p>

                {/* Separate Store Rating (Section 13) */}
                <div className="flex items-center justify-center gap-1 mt-2 text-[11px] font-black text-amber-500 dark:text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{store.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-gray-400 font-normal">({store.reviewCount})</span>
                </div>
              </div>

              {/* View Store Trigger */}
              <div className="mt-3 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f85606] dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{language === 'bn' ? 'দোকান দেখুন' : 'Visit Store'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
