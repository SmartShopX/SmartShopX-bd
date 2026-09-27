import React from 'react';
import { Product } from '../types';
import { X, Scale, Star, Check, ShoppingCart, Zap, Trash2, ArrowRight } from 'lucide-react';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onAddToCart: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
  language: 'bn' | 'en';
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveFromCompare,
  onClearCompare,
  onAddToCart,
  onQuickBuy,
  language
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a3871] via-[#0b1a30] to-[#f85606] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-yellow-300">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {language === 'bn' ? 'পণ্য তুলনা ও স্পেসিফিকেশন' : 'Product Comparison Tool'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? `${products.length}টি পণ্যের তুলনামূলক বিবরণ` : `Comparing ${products.length} items side-by-side`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <button
                onClick={onClearCompare}
                className="text-xs text-white/80 hover:text-white underline font-semibold px-2 py-1 cursor-pointer"
              >
                {language === 'bn' ? 'সব মুছুন' : 'Clear All'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-3 sm:p-6 scrollbar-thin pb-20 sm:pb-6">
          {products.length > 1 && (
            <div className="sm:hidden mb-2 text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-between px-1">
              <span>{language === 'bn' ? '← ডানে-বামে স্ক্রোল করে তুলনা দেখুন →' : '← Scroll horizontally to compare →'}</span>
              <span>{products.length} {language === 'bn' ? 'টি পণ্য' : 'items'}</span>
            </div>
          )}
          {products.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Scale className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
              <h4 className="text-gray-700 dark:text-gray-300 font-bold text-sm">
                {language === 'bn' ? 'তুলনা করার জন্য কোনো পণ্য যোগ করা হয়নি' : 'No products selected for comparison'}
              </h4>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {language === 'bn' ? 'যেকোনো পণ্যের কার্ডের "তুলনা" বাটনে ক্লিক করে যোগ করুন।' : 'Click the compare icon on product cards to add.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 min-w-[520px] sm:min-w-[600px]">
              {products.filter((p) => p && p.id).map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-50/70 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative group hover:shadow-md transition"
                >
                  <button
                    onClick={() => onRemoveFromCompare(p.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full shadow-xs transition cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-3">
                    <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center p-2">
                      <img src={p.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80'} alt={p.title || 'Product'} className="w-full h-full object-contain" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.brand}</span>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs line-clamp-2 mt-0.5">
                        {language === 'bn' ? (p.titleBn || p.title) : p.title}
                      </h4>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-750 pt-2 space-y-2 text-xs">
                      <div className="flex items-baseline justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-[11px]">{language === 'bn' ? 'মূল্য:' : 'Price:'}</span>
                        <div className="text-right">
                          <div className="text-sm font-black text-[#f85606] dark:text-orange-400">৳{p.price}</div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 line-through">৳{p.originalPrice}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400">{language === 'bn' ? 'রেটিং:' : 'Rating:'}</span>
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{p.rating}</span>
                          <span className="text-gray-400 dark:text-gray-500 font-normal">({p.reviewCount})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400">{language === 'bn' ? 'ওয়ারেন্টি:' : 'Warranty:'}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-[10px] text-right truncate max-w-[110px]">
                          {language === 'bn' ? p.warrantyBn || '৭ দিন রিটার্ন' : p.warranty || '7 Days Return'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400">{language === 'bn' ? 'ডেলিভারি:' : 'Delivery:'}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {p.isFreeDelivery ? (language === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free') : '৳৬০'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400">{language === 'bn' ? 'স্টক:' : 'Stock:'}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {p.stock > 0 ? (language === 'bn' ? `${p.stock}টি উপলব্ধ` : `${p.stock} in stock`) : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-1.5">
                    <button
                      onClick={() => {
                        onQuickBuy(p);
                        onClose();
                      }}
                      className="w-full py-2 bg-gradient-to-r from-[#f85606] to-[#ff5500] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm hover:opacity-95 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}</span>
                    </button>
                    <button
                      onClick={() => onAddToCart(p)}
                      className="w-full py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3 text-[#f85606] dark:text-orange-400" />
                      <span>{language === 'bn' ? 'কার্টে রাখুন' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
