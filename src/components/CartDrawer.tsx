import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Tag, ShieldCheck, Store } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  language: 'bn' | 'en';
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onOpenVouchers: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onOpenVouchers
}) => {
  if (!isOpen) return null;

  const validCart = cart.filter((item) => item && item.product);
  const subtotal = validCart.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);
  const freeDeliveryThreshold = 2000;
  const progressToFreeDelivery = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  // Multi-Store Cart Separation (Section 15: Store A, Store B separation)
  const storeGroups = validCart.reduce<Record<string, { storeName: string; items: CartItem[] }>>((acc, item) => {
    const storeKey = item.product.storeId || item.product.seller?.name || 'STORE_GENERAL';
    const storeDisplayName = item.product.storeName || item.product.seller?.name || 'Smart Shopping Store';
    if (!acc[storeKey]) {
      acc[storeKey] = { storeName: storeDisplayName, items: [] };
    }
    acc[storeKey].items.push(item);
    return acc;
  }, {});

  const storeGroupEntries = Object.entries(storeGroups);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 safe-area-modal-overlay">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-colors border-l border-gray-100 dark:border-gray-800">
          {/* Cart Header */}
          <div className="p-4 sm:p-5 safe-area-drawer-header border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ea580c] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {language === 'bn' ? 'শপিং কার্ট' : 'Shopping Cart'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {cart.length} {language === 'bn' ? 'টি পণ্য কার্টে রয়েছে' : 'items in cart'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                  title="Clear Cart"
                >
                  {language === 'bn' ? 'সব মুছুন' : 'Clear'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Bar */}
          {cart.length > 0 && (
            <div className="bg-orange-50 dark:bg-gray-900 px-4 py-2.5 border-b border-orange-200 dark:border-gray-800 text-xs">
              <div className="flex items-center justify-between font-semibold text-orange-950 dark:text-orange-300 mb-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#ea580c] dark:text-orange-400" />
                  {subtotal >= freeDeliveryThreshold
                    ? (language === 'bn' ? '🎉 আপনি ফ্রি ডেলিভারি পাওয়ার যোগ্য!' : '🎉 You qualified for Free Shipping!')
                    : (language === 'bn'
                        ? `আর মাত্র ৳${(freeDeliveryThreshold - subtotal).toLocaleString('en-US')} কেনাকাটায় ফ্রি ডেলিভারি!`
                        : `Add ৳${(freeDeliveryThreshold - subtotal).toLocaleString('en-US')} more for Free Shipping!`)}
                </span>
                <span className="font-bold text-[#ea580c] dark:text-orange-400">{progressToFreeDelivery}%</span>
              </div>
              <div className="w-full bg-orange-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#ea580c] dark:bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressToFreeDelivery}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List - Multi-Store Partitioned (Section 15) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-gray-800 text-[#f85606] dark:text-orange-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  {language === 'bn' ? 'আপনার কার্ট খালি রয়েছে' : 'Your cart is empty'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  {language === 'bn'
                    ? 'দারাজের আকর্ষণীয় ডিসকাউন্ট ও অফার থেকে পণ্য কার্টে যোগ করুন।'
                    : 'Explore high discount mega deals and add your favorite items to cart.'}
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#f85606] hover:bg-[#d84a05] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  {language === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              storeGroupEntries.map(([storeKey, group]) => {
                const storeSubtotal = group.items.reduce(
                  (sum, i) => sum + (i.product?.price || 0) * (i.quantity || 1),
                  0
                );

                return (
                  <div
                    key={storeKey}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3"
                  >
                    {/* Store Header Banner */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 text-xs font-bold">
                      <div className="flex items-center gap-1.5 min-w-0 text-gray-900 dark:text-gray-100">
                        <Store className="w-3.5 h-3.5 text-[#ea580c] dark:text-orange-400 shrink-0" />
                        <span className="truncate">{group.storeName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400 font-normal">
                          {group.items.length} {language === 'bn' ? 'টি আইটেম' : 'items'}
                        </span>
                        <span className="font-extrabold text-[#ea580c] dark:text-orange-400">
                          ৳{storeSubtotal.toLocaleString('en-US')}
                        </span>
                      </div>
                    </div>

                    {/* Store Items List */}
                    <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
                      {group.items.map((item) => {
                        const prod = item.product;
                        const prodImg =
                          prod?.image ||
                          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80';
                        const prodTitle =
                          language === 'bn'
                            ? prod?.titleBn || prod?.title || 'পণ্য'
                            : prod?.title || 'Product';
                        const prodPrice = prod?.price || 0;
                        const prodStock = prod?.stock || 99;
                        const prodId = prod?.id || '';

                        return (
                          <div
                            key={prodId || item.selectedColor || item.selectedSize}
                            className="pt-3 first:pt-0 flex gap-3 group"
                          >
                            {/* Thumbnail */}
                            <img
                              src={prodImg}
                              alt={prodTitle}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800"
                            />

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
                                    {prodTitle}
                                  </h4>
                                  <button
                                    onClick={() => onRemoveItem(prodId)}
                                    className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition cursor-pointer"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {(item.selectedColor || item.selectedSize) && (
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {item.selectedColor && <span>{item.selectedColor} </span>}
                                    {item.selectedSize && <span>/ {item.selectedSize}</span>}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-sm font-black text-[#f85606] dark:text-orange-400">
                                    ৳{(prodPrice * item.quantity).toLocaleString('en-US')}
                                  </span>
                                  {item.quantity > 1 && (
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                      (৳{prodPrice} × {item.quantity})
                                    </span>
                                  )}
                                </div>

                                {/* Quantity control */}
                                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                                  <button
                                    onClick={() => onUpdateQuantity(prodId, item.quantity - 1)}
                                    className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 font-bold text-xs text-gray-800 dark:text-gray-200">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(prodId, item.quantity + 1)}
                                    disabled={item.quantity >= prodStock}
                                    className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 safe-area-drawer-footer border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
              {/* Voucher shortcut */}
              <button
                onClick={onOpenVouchers}
                className="w-full flex items-center justify-between p-2.5 bg-orange-50 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-750 text-orange-900 dark:text-orange-300 rounded-xl text-xs font-semibold border border-orange-200 dark:border-gray-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#ea580c] dark:text-orange-400" />
                  <span>{language === 'bn' ? 'দারাজ ভাউচার কোড ব্যবহার করুন' : 'Apply Promo Vouchers'}</span>
                </div>
                <span className="text-[#ea580c] dark:text-orange-400 font-bold">
                  {language === 'bn' ? 'ভাউচার নিন →' : 'View →'}
                </span>
              </button>

              {/* Subtotal Calculation */}
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                <div className="flex justify-between">
                  <span>{language === 'bn' ? 'সাবটোটাল (পণ্য মূল্য):' : 'Subtotal:'}</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">৳{subtotal.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{language === 'bn' ? 'সম্ভাব্য ডেলিভারি চার্জ:' : 'Est. Delivery:'}</span>
                  <span>{subtotal >= freeDeliveryThreshold ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{language === 'bn' ? 'ফ্রি' : 'FREE'}</span>
                  ) : '৳৬০ - ৳১১০'}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#ea580c] hover:bg-[#d9480f] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                <span>{language === 'bn' ? 'চেকআউট করুন' : 'Proceed to Checkout'}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-black">
                  ৳{subtotal.toLocaleString('en-US')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
