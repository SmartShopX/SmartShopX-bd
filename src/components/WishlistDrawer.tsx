import React from 'react';
import { Product } from '../types';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  allProducts: Product[];
  language: 'bn' | 'en';
  onRemoveWishlist: (productId: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  allProducts,
  language,
  onRemoveWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = allProducts.filter((p) => p && p.id && wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 safe-area-modal-overlay">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-colors border-l border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
          {/* Header */}
          <div className="p-4 sm:p-5 safe-area-drawer-header border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {language === 'bn' ? 'পছন্দের তালিকা (উইশলিস্ট)' : 'My Wishlist'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {wishlistedProducts.length} {language === 'bn' ? 'টি আইটেম সংরক্ষিত' : 'items saved'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-area-bottom">
            {wishlistedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-gray-800 text-rose-500 dark:text-rose-400 flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  {language === 'bn' ? 'উইশলিস্ট খালি রয়েছে' : 'Wishlist is empty'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  {language === 'bn'
                    ? 'যেসব পণ্য পরে কিনতে চান সেগুলোর হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।'
                    : 'Tap the heart icon on any product to save it for later.'}
                </p>
              </div>
            ) : (
              wishlistedProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(prod);
                  }}
                  className="p-3 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-gray-700 flex gap-3 cursor-pointer shadow-2xs group"
                >
                  <img
                    src={prod?.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80'}
                    alt={prod?.title || 'Product'}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-[#f85606] dark:group-hover:text-orange-400">
                          {language === 'bn' ? prod.titleBn : prod.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveWishlist(prod.id);
                          }}
                          className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-black text-[#f85606] dark:text-orange-400 mt-1">
                        ৳{prod.price.toLocaleString('en-US')}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(prod, e);
                      }}
                      className="mt-2 bg-orange-50 dark:bg-gray-800 hover:bg-[#f85606] dark:hover:bg-[#f85606] text-[#f85606] dark:text-orange-400 hover:text-white dark:hover:text-white border border-orange-200 dark:border-gray-700 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'কার্টে নিন' : 'Move to Cart'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
