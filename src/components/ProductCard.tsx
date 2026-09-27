import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, Zap, Scale, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  language: 'bn' | 'en';
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
  onQuickBuy?: (product: Product, e: React.MouseEvent) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onQuickBuy,
  isCompared = false,
  onToggleCompare
}) => {
  if (!product) return null;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer relative hover:-translate-y-1"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-850 overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'}
          alt={language === 'bn' ? (product.titleBn || product.title || '') : (product.title || '')}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.discountPercent > 0 && (
            <span className="bg-[#f85606] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              -{product.discountPercent}%
            </span>
          )}
          {product.isDarazMall && (
            <span className="bg-[#0b1a30] text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-yellow-400" />
              <span>Mall</span>
            </span>
          )}
          {product.stock <= 25 && (
            <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs animate-pulse">
              <Flame className="w-2.5 h-2.5 fill-current" />
              <span>{language === 'bn' ? `মাত্র ${product.stock}টি বাকি` : `Only ${product.stock} left`}</span>
            </span>
          )}
        </div>

        {/* Top Right Buttons: Compare & Wishlist */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md transition shadow-xs flex items-center justify-center cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-rose-500 dark:hover:text-rose-400'
            }`}
            aria-label="Wishlist"
            title={language === 'bn' ? 'পছন্দ করুন' : 'Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Compare Button */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product, e);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md transition shadow-xs flex items-center justify-center cursor-pointer ${
                isCompared
                  ? 'bg-[#0a3871] text-white'
                  : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#0a3871] dark:hover:text-blue-400'
              }`}
              aria-label="Compare"
              title={language === 'bn' ? 'তুলনা করুন' : 'Compare'}
            >
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Free delivery badge on image bottom */}
        {product.isFreeDelivery && (
          <div className="absolute bottom-2 left-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>{language === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free Delivery'}</span>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand name */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-300 mb-1">
            <span className="font-semibold truncate max-w-[55%]">{product.brand}</span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[42%] text-right">
              {language === 'bn' ? product.categoryBn : product.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-[#f85606] dark:group-hover:text-orange-400 transition leading-snug">
            {language === 'bn' ? product.titleBn : product.title}
          </h3>

          {/* Price Area */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
            <span className="text-sm sm:text-lg font-black text-[#ea580c] dark:text-orange-400">
              ৳{product.price.toLocaleString('en-US')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-through">
                ৳{product.originalPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>

          {/* Flash Sale Progress if applicable */}
          {product.isFlashSale && (
            <div className="mb-2">
              <div className="w-full bg-orange-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full"
                  style={{ width: `${product.soldPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-orange-800 dark:text-orange-300 font-semibold mt-0.5">
                <span>
                  {language === 'bn'
                    ? `${product.soldPercent}% বিক্রি`
                    : `${product.soldPercent}% Sold`}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'bn' ? `স্টক: ${product.stock}` : `Stock: ${product.stock}`}
                </span>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">
            <div className="flex items-center text-amber-500 dark:text-amber-400">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span className="text-gray-800 dark:text-gray-100 font-bold ml-1 text-[11px] sm:text-xs">{product.rating}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Dual Action Buttons: Quick Buy & Cart */}
        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 pt-1">
          {onQuickBuy ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickBuy(product, e);
              }}
              className="bg-gradient-to-r from-[#f85606] to-[#ff5500] hover:from-[#e04d05] hover:to-[#e64c00] text-white font-extrabold text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 rounded-xl flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer min-h-[36px] sm:min-h-[38px]"
            >
              <Zap className="w-3 h-3 fill-current text-yellow-300 shrink-0" />
              <span className="truncate">{language === 'bn' ? 'কিনুন' : 'Buy'}</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={(e) => onAddToCart(product, e)}
            className={`bg-orange-50 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-750 text-[#f85606] dark:text-orange-400 border border-orange-200 dark:border-gray-700 font-bold text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer min-h-[36px] sm:min-h-[38px] ${
              onQuickBuy ? '' : 'col-span-2'
            }`}
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{language === 'bn' ? 'কার্ট' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
