import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import {
  Sparkles,
  Heart,
  History,
  Trash2,
  TrendingUp,
  Compass,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface RecommendedForYouProps {
  products: Product[];
  wishlist: string[];
  viewedHistory: string[];
  language: 'bn' | 'en';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantityOrEvent?: number | React.MouseEvent) => void;
  onQuickBuy: (product: Product, e?: React.MouseEvent) => void;
  onToggleWishlist: (productId: string) => void;
  onToggleCompare: (product: Product, e?: React.MouseEvent) => void;
  comparedProductIds: string[];
  onClearHistory: () => void;
}

export const RecommendedForYou: React.FC<RecommendedForYouProps> = ({
  products,
  wishlist,
  viewedHistory,
  language,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  onToggleWishlist,
  onToggleCompare,
  comparedProductIds,
  onClearHistory
}) => {
  const [filterTab, setFilterTab] = useState<'smart' | 'wishlist' | 'viewed'>('smart');

  // Map of products by ID for fast lookup
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => {
      if (p && p.id) map.set(p.id, p);
    });
    return map;
  }, [products]);

  // Wishlisted products
  const wishlistedProducts = useMemo(() => {
    return wishlist.map((id) => productMap.get(id)).filter((p): p is Product => !!p);
  }, [wishlist, productMap]);

  // Viewed products in chronological order
  const viewedProducts = useMemo(() => {
    return viewedHistory.map((id) => productMap.get(id)).filter((p): p is Product => !!p);
  }, [viewedHistory, productMap]);

  // Recommendation Engine: Compute scores based on wishlist and viewed history
  const recommendations = useMemo(() => {
    if (products.length === 0) return [];

    // 1. Gather affinity profiles: preferred categories, brands, tags, and average price
    const categoryWeights: Record<string, number> = {};
    const brandWeights: Record<string, number> = {};
    const tagWeights: Record<string, number> = {};
    let totalPrice = 0;
    let priceCount = 0;

    // Weight from wishlist (High Intent: weight 3)
    wishlistedProducts.forEach((p) => {
      categoryWeights[p.category] = (categoryWeights[p.category] || 0) + 3;
      brandWeights[p.brand] = (brandWeights[p.brand] || 0) + 3;
      (p.tags || []).forEach((t) => {
        tagWeights[t] = (tagWeights[t] || 0) + 2;
      });
      totalPrice += p.price;
      priceCount++;
    });

    // Weight from viewed history (Recent Interest: weight 2, decay for older items)
    viewedProducts.forEach((p, idx) => {
      const recencyWeight = Math.max(1, 2.5 - idx * 0.2);
      categoryWeights[p.category] = (categoryWeights[p.category] || 0) + recencyWeight;
      brandWeights[p.brand] = (brandWeights[p.brand] || 0) + recencyWeight;
      (p.tags || []).forEach((t) => {
        tagWeights[t] = (tagWeights[t] || 0) + 1.2;
      });
      totalPrice += p.price;
      priceCount++;
    });

    const avgPrice = priceCount > 0 ? totalPrice / priceCount : 2000;

    // 2. Score candidate products
    const scored = products.map((prod) => {
      let score = 0;
      const reasons: string[] = [];

      // Category matching
      const catWeight = categoryWeights[prod.category] || 0;
      if (catWeight > 0) {
        score += catWeight * 12;
        reasons.push(language === 'bn' ? 'আপনার প্রিয় ক্যাটাগরি' : 'Matches preferred category');
      }

      // Brand matching
      const bWeight = brandWeights[prod.brand] || 0;
      if (bWeight > 0) {
        score += bWeight * 10;
        reasons.push(language === 'bn' ? `${prod.brand} ব্র্যান্ড পছন্দ` : `You like ${prod.brand}`);
      }

      // Tags matching
      let matchingTags = 0;
      (prod.tags || []).forEach((tag) => {
        if (tagWeights[tag]) {
          score += tagWeights[tag] * 5;
          matchingTags++;
        }
      });
      if (matchingTags > 0 && reasons.length < 2) {
        reasons.push(language === 'bn' ? 'অনুরূপ বৈশিষ্ট্যযুক্ত' : 'Similar attributes');
      }

      // Price similarity bonus (within ±40% of user interest average)
      if (Math.abs(prod.price - avgPrice) / avgPrice < 0.4) {
        score += 8;
      }

      // Product quality indicators
      score += (prod.rating || 4.5) * 4;
      if (prod.isDarazMall) score += 6;
      if (prod.isFreeDelivery) score += 5;
      if (prod.discountPercent > 10) score += 4;

      // Slight diversity penalty if identical item is already in wishlist
      const isAlreadyInWishlist = wishlist.includes(prod.id);
      if (isAlreadyInWishlist) {
        score -= 10; // Recommend new items first
      }

      // Recently viewed items should have a mild boost if in 'viewed' or overall
      const isViewed = viewedHistory.includes(prod.id);
      if (isViewed) {
        score += 8;
      }

      const topReason = reasons[0] || (language === 'bn' ? 'জনপ্রিয় বাছাই' : 'Top trending pick');

      return {
        product: prod,
        score,
        reason: topReason,
        isWishlistRelated: catWeight > 0 || bWeight > 0 || isAlreadyInWishlist,
        isViewed
      };
    });

    // Sort by computed recommendation score
    scored.sort((a, b) => b.score - a.score);

    return scored;
  }, [products, wishlistedProducts, viewedProducts, wishlist, viewedHistory, language]);

  // Filter products based on active tab
  const displayedItems = useMemo(() => {
    if (filterTab === 'viewed') {
      // Prioritize strictly the recently viewed items in reverse chronological order
      if (viewedProducts.length > 0) {
        return viewedProducts.map((p) => ({
          product: p,
          score: 100,
          reason: language === 'bn' ? 'সম্প্রতি দেখা হয়েছে' : 'Recently viewed by you',
          isWishlistRelated: false,
          isViewed: true
        }));
      }
      return [];
    }

    if (filterTab === 'wishlist') {
      const wishlistRelated = recommendations.filter((r) => r.isWishlistRelated);
      return wishlistRelated.slice(0, 8);
    }

    // Default 'smart': top 8 scored recommendations
    return recommendations.slice(0, 8);
  }, [filterTab, viewedProducts, recommendations, language]);

  // Primary categories of interest for subtitle
  const topInterests = useMemo(() => {
    const set = new Set<string>();
    [...wishlistedProducts, ...viewedProducts].forEach((p) => {
      set.add(language === 'bn' ? p.categoryBn : p.category);
    });
    return Array.from(set).slice(0, 3);
  }, [wishlistedProducts, viewedProducts, language]);

  return (
    <section className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800">
      {/* Header Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-3 sm:space-y-4">
        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-500/10 text-[#f85606] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </div>
              <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {language === 'bn' ? 'আপনার জন্য বিশেষ সুপারিশ' : 'Recommended for You'}
              </h2>
            </div>

            {/* Zero-Pill Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 pl-0 sm:pl-10">
              <span>
                {language === 'bn'
                  ? `উইশলিস্ট (${wishlist.length}) ও ব্রাউজিং হিস্ট্রির (${viewedHistory.length}) ভিত্তিতে তৈরি`
                  : `Curated from ${wishlist.length} saved · ${viewedHistory.length} viewed products`}
              </span>
              {topInterests.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {language === 'bn' ? 'আগ্রহ:' : 'Focus:'} {topInterests.join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Navigation / Filter Tabs & History Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setFilterTab('smart')}
                className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
                  filterTab === 'smart'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>{language === 'bn' ? 'স্মার্ট' : 'Smart'}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('wishlist')}
                className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
                  filterTab === 'wishlist'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{language === 'bn' ? 'উইশলিস্ট' : 'Wishlist'}</span>
                {wishlist.length > 0 && (
                  <span className="text-[10px] text-gray-400">({wishlist.length})</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('viewed')}
                className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
                  filterTab === 'viewed'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{language === 'bn' ? 'সম্প্রতি দেখা' : 'Viewed'}</span>
                {viewedHistory.length > 0 && (
                  <span className="text-[10px] text-gray-400">({viewedHistory.length})</span>
                )}
              </button>
            </div>

            {/* Clear History Button */}
            {viewedHistory.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer text-xs flex items-center gap-1 shrink-0"
                title={language === 'bn' ? 'ব্রাউজিং হিস্ট্রি মুছুন' : 'Clear viewing history'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {language === 'bn' ? 'হিস্ট্রি মুছুন' : 'Clear History'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {displayedItems.length === 0 ? (
          <div className="py-10 sm:py-12 px-4 text-center bg-gray-50/60 dark:bg-gray-850/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#f85606] flex items-center justify-center mx-auto">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
              {filterTab === 'viewed'
                ? language === 'bn'
                  ? 'আপনার কোনো সাম্প্রতিক দেখা পণ্য নেই'
                  : 'No recently viewed items yet'
                : language === 'bn'
                ? 'উইশলিস্টে কোনো পণ্য নেই'
                : 'No wishlist items to base recommendations on'}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {language === 'bn'
                ? 'ক্যাটালগ থেকে যেকোনো পণ্য দেখলে বা পছন্দ তালিকায় রাখলে এখানে ব্যক্তিগত সুপারিশ প্রদর্শিত হবে।'
                : 'Browse products or save them to your wishlist to get personalized recommendations.'}
            </p>
            <button
              type="button"
              onClick={() => setFilterTab('smart')}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#f85606] hover:bg-[#d84a05] text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {language === 'bn' ? 'স্মার্ট সুপারিশ দেখুন' : 'Explore Smart Picks'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {displayedItems.map(({ product, reason }) => (
              <div key={product.id} className="relative flex flex-col group">
                {/* Subtle Context Reason Tag above the product */}
                <div className="mb-1 px-0.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">{reason}</span>
                </div>

                <ProductCard
                  product={product}
                  language={language}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={(p, e) => onAddToCart(p, e)}
                  onSelectProduct={onSelectProduct}
                  onQuickBuy={onQuickBuy}
                  isCompared={comparedProductIds.includes(product.id)}
                  onToggleCompare={onToggleCompare}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
