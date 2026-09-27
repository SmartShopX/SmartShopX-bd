import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CartItem, DeliveryAddress, Order, Voucher, CartValidationResult } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/mockProducts';
import { MarketplaceService } from '../services/marketplaceService';
import { SMSService } from '../services/smsService';
import { PixelAnalyticsService } from '../services/pixelAnalyticsService';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Tag,
  Coins,
  Wifi,
  WifiOff,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Store,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Copy,
  Check
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  language: 'bn' | 'en';
  isOnline: boolean;
  userAddress: DeliveryAddress;
  onSaveAddress: (addr: DeliveryAddress) => void;
  vouchers: Voucher[];
  coins: number;
  onCoinsUsed: (usedCoins: number) => void;
  onOrderPlaced: (order: Order, isOffline: boolean) => void;
  onOpenCart?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  language,
  isOnline,
  userAddress,
  onSaveAddress,
  vouchers,
  coins,
  onCoinsUsed,
  onOrderPlaced,
  onOpenCart
}) => {
  if (!isOpen) return null;

  const [address, setAddress] = useState<DeliveryAddress>(userAddress);
  const [selectedDivision, setSelectedDivision] = useState(userAddress.division || 'dhaka');
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [trxId, setTrxId] = useState('');
  const [isCopiedNum, setIsCopiedNum] = useState(false);
  const [isTrxVerified, setIsTrxVerified] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationState, setValidationState] = useState<CartValidationResult | null>(null);

  // Coins maximum calculation (10 coins = ৳1, max 10% with coins)
  const roughSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const maxUsableCoins = Math.min(coins, Math.floor(roughSubtotal * 0.1 * 10));

  // Dynamic Marketplace Validation (Section 3 & 4)
  const validation = useMemo(() => {
    return MarketplaceService.validateCart({
      items: cart,
      address: { ...address, division: selectedDivision },
      appliedVoucherCode: appliedVoucher?.code,
      coinsUsed: useCoins ? maxUsableCoins : 0,
      vouchers
    });
  }, [cart, address, selectedDivision, appliedVoucher, useCoins, maxUsableCoins, vouchers]);

  const itemsTotal = validation.verifiedSubtotal;
  const deliveryFee = validation.verifiedDeliveryFee;
  const voucherDiscount = validation.verifiedVoucherDiscount;
  const coinDiscount = validation.verifiedCoinsDiscount;
  const finalAmount = validation.verifiedGrandTotal;

  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    const found = vouchers.find((v) => v.code.toUpperCase() === code);

    if (!found) {
      setErrorMsg(language === 'bn' ? 'ভুল বা মেয়াদোত্তীর্ণ ভাউচার কোড।' : 'Invalid or expired voucher code.');
      return;
    }

    if (itemsTotal < found.minSpend) {
      setErrorMsg(
        language === 'bn'
          ? `এই ভাউচারটির জন্য সর্বনিম্ন ৳${found.minSpend} এর অর্ডার প্রয়োজন।`
          : `Minimum order of ৳${found.minSpend} required for this voucher.`
      );
      return;
    }

    setAppliedVoucher(found);
    setErrorMsg('');
  };

  const handlePlaceOrder = async () => {
    if (!address.fullName.trim()) {
      setErrorMsg(language === 'bn' ? 'দয়া করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (!address.phone.trim() || address.phone.length < 10) {
      setErrorMsg(
        language === 'bn'
          ? 'সঠিক বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 017xxxxxxxx)'
          : 'Please enter a valid BD phone number (e.g. 017xxxxxxxx)'
      );
      return;
    }
    if (!address.addressDetails.trim()) {
      setErrorMsg(language === 'bn' ? 'ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন।' : 'Please enter detailed delivery address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // 1. Rigorous Price & Inventory Verification before creating order (Section 3 & 4)
    const freshValidation = MarketplaceService.validateCart({
      items: cart,
      address: { ...address, division: selectedDivision },
      appliedVoucherCode: appliedVoucher?.code,
      coinsUsed: useCoins ? maxUsableCoins : 0,
      vouchers
    });

    if (!freshValidation.isValid) {
      setIsSubmitting(false);
      setValidationState(freshValidation);
      setErrorMsg(
        language === 'bn'
          ? freshValidation.errorsBn[0] || 'দামের পরিবর্তন হয়েছে। কার্ট আপডেট করে আবার চেষ্টা করুন।'
          : freshValidation.errors[0] || 'Cart prices or availability have changed. Please update your cart and try again.'
      );
      return;
    }

    // Save address for future use
    const updatedAddress = { ...address, division: selectedDivision };
    onSaveAddress(updatedAddress);

    if (useCoins && maxUsableCoins > 0) {
      onCoinsUsed(maxUsableCoins);
    }

    // Generate Order with Idempotency Key & Client Order ID (Section 8)
    const orderId = 'DARAZ-' + Math.floor(100000 + Math.random() * 900000);
    const clientOrderId = orderId;
    const idempotencyKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const primaryStore = freshValidation.groupedByStore[0];

    const newOrder: Order = {
      id: orderId,
      clientOrderId,
      idempotencyKey,
      storeId: primaryStore?.storeId || 'STORE_001',
      storeName: primaryStore?.storeName || 'Verified Store',
      items: [...cart],
      totalAmount: freshValidation.verifiedSubtotal,
      discountAmount: freshValidation.verifiedVoucherDiscount + freshValidation.verifiedCoinsDiscount,
      deliveryFee: freshValidation.verifiedDeliveryFee,
      finalAmount: freshValidation.verifiedGrandTotal,
      appliedVoucher: appliedVoucher ? appliedVoucher.code : undefined,
      coinsUsed: useCoins ? maxUsableCoins : 0,
      coinsDiscount: freshValidation.verifiedCoinsDiscount,
      paymentMethod: selectedPayment,
      address: updatedAddress,
      status: isOnline ? 'synced' : 'pending_offline_sync',
      orderDate: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOfflineCreated: !isOnline,
      trackingSteps: [
        {
          step: 'Order Placed',
          stepBn: isOnline ? 'অর্ডার গৃহীত হয়েছে' : 'অফলাইন অর্ডার সংরক্ষিত',
          completed: true,
          time: new Date().toLocaleTimeString()
        },
        {
          step: 'Processing & Packed',
          stepBn: 'প্যাকেজিং ও প্রসেসিং',
          completed: false
        },
        {
          step: 'Handed to Courier',
          stepBn: 'কুরিয়ারে হস্তান্তর',
          completed: false
        },
        {
          step: 'Delivered',
          stepBn: 'ডেলিভারি সম্পন্ন',
          completed: false
        }
      ]
    };

    // 2. Online Order Dispatch vs Offline Pipeline (Section 5 & 6)
    if (isOnline) {
      try {
        const dispatchRes = await MarketplaceService.dispatchOrderToCentralBackend(newOrder);
        if (dispatchRes.success && dispatchRes.syncedWithCentralBackend) {
          newOrder.status = 'synced';
          newOrder.backendSynced = true;
          newOrder.syncedAt = new Date().toISOString();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          onOrderPlaced(newOrder, false);
        } else {
          // Central backend unavailable -> transparently store in pending offline queue
          newOrder.status = 'pending_offline_sync';
          newOrder.isOfflineCreated = true;
          newOrder.syncError = dispatchRes.message;
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
          onOrderPlaced(newOrder, true);
        }
      } catch {
        newOrder.status = 'pending_offline_sync';
        newOrder.isOfflineCreated = true;
        onOrderPlaced(newOrder, true);
      }
    } else {
      // Offline mode
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      onOrderPlaced(newOrder, true);
    }

    // Auto Dispatch Bangla SMS Notification to Customer
    try {
      SMSService.sendSMS({
        phone: updatedAddress.phone,
        name: updatedAddress.fullName,
        orderId: newOrder.id,
        type: 'placed',
        amount: newOrder.finalAmount
      });
    } catch {}

    // Auto Track Facebook Pixel & GA4 Purchase Event
    try {
      PixelAnalyticsService.trackPurchase({
        id: newOrder.id,
        finalAmount: newOrder.finalAmount,
        itemsCount: newOrder.items.length,
        paymentMethod: newOrder.paymentMethod
      });
    } catch {}

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Checkout Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-[#f85606] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-yellow-300" />
            <h3 className="text-base font-bold">
              {language === 'bn' ? 'অর্ডার চেকআউট ও ডেলিভারি' : 'Order Checkout & Delivery'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline reassurance banner inside checkout */}
        {!isOnline && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs flex items-center gap-2 shrink-0">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              {language === 'bn'
                ? '📱 অফলাইন মোড: আপনার অর্ডারটি ডিভাইসে নিরাপদে জমা রাখা হবে এবং ইন্টারনেট সংযোগ পেলেই স্বয়ংক্রিয়ভাবে সেলারের কাছে পৌঁছে যাবে।'
                : '📱 Offline Mode: Order will be stored securely on device and auto-dispatched upon reconnection.'}
            </span>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 text-xs sm:text-sm pb-20 sm:pb-6">
          {/* Price / Inventory Mismatch Alert (Section 4) */}
          {validationState && !validationState.isValid && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 rounded-2xl border-2 border-amber-300 dark:border-amber-700 space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-sm">
                    {language === 'bn' ? 'দামের বা স্টকের পরিবর্তন হয়েছে' : 'Cart Prices or Stock Changed'}
                  </h5>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    {language === 'bn'
                      ? 'দামের পরিবর্তন হয়েছে। কার্ট আপডেট করে আবার চেষ্টা করুন।'
                      : 'Catalog price or availability has been updated. Please update your cart before proceeding.'}
                  </p>

                  {/* Itemized mismatches */}
                  <ul className="mt-2 space-y-1 text-xs">
                    {validationState.unitPriceMismatches.map((m) => (
                      <li key={m.productId} className="flex items-center justify-between gap-2 bg-white/70 dark:bg-gray-800/80 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        <span className="font-semibold truncate">{language === 'bn' ? m.productTitleBn : m.productTitle}</span>
                        <span className="font-mono text-xs shrink-0">
                          <span className="line-through text-gray-400 mr-1.5">৳{m.clientPrice}</span>
                          <span className="font-bold text-[#f85606]">৳{m.catalogPrice}</span>
                        </span>
                      </li>
                    ))}
                    {validationState.stockIssues.map((s) => (
                      <li key={s.productId} className="flex items-center justify-between gap-2 bg-white/70 dark:bg-gray-800/80 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800 text-rose-600">
                        <span className="font-semibold truncate">{s.productTitle}</span>
                        <span className="font-bold text-xs shrink-0">
                          {language === 'bn' ? `স্টক: ${s.availableStock}টি (অনুরোধ: ${s.requestedQty}টি)` : `Stock: ${s.availableStock}`}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex items-center gap-2">
                    {onOpenCart && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCart();
                        }}
                        className="px-3 py-1.5 bg-[#f85606] text-white rounded-xl text-xs font-bold hover:bg-[#d84a05] transition flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'কার্ট আপডেট করুন' : 'Update Cart'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setValidationState(null)}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-300 transition cursor-pointer"
                    >
                      {language === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (!validationState || validationState.isValid) && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Multi-Store Cart Breakdown (Section 11) */}
          <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 text-sm">
              <Store className="w-4 h-4 text-[#ea580c] dark:text-orange-400" />
              <span>{language === 'bn' ? 'অর্ডারকৃত পণ্য ও সেলার সম্বলিত বিবরণ' : 'Ordered Stores & Items'}</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full ml-auto">
                {validation.groupedByStore.length} {language === 'bn' ? 'টি স্টোর' : 'Store(s)'}
              </span>
            </h4>

            <div className="space-y-2 mt-2">
              {validation.groupedByStore.map((storeGroup) => (
                <div
                  key={storeGroup.storeId}
                  className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-1">
                    <span className="flex items-center gap-1">
                      <Store className="w-3 h-3 text-[#ea580c] dark:text-orange-400" />
                      {storeGroup.storeName}
                    </span>
                    <span className="font-extrabold text-[#ea580c] dark:text-orange-400">৳{storeGroup.subtotal.toLocaleString('en-US')}</span>
                  </div>
                  <div className="space-y-1 pt-0.5">
                    {storeGroup.items.map((it) => (
                      <div key={it.product.id} className="flex items-center justify-between text-gray-700 dark:text-gray-300 text-[11px]">
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">
                          {language === 'bn' ? it.product.titleBn || it.product.title : it.product.title} (x{it.quantity})
                        </span>
                        <span className="font-mono font-semibold">৳{(it.product.price * it.quantity).toLocaleString('en-US')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Delivery Address Section */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-[#ea580c] dark:text-orange-400" />
              <span>{language === 'bn' ? '১. ডেলিভারি ঠিকানা' : '1. Delivery Address'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1.5">
                  {language === 'bn' ? 'গ্রাহকের পুরো নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    placeholder={language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1.5">
                  {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1.5">
                  {language === 'bn' ? 'বিভাগ (Division) *' : 'Division *'}
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-[#f85606] font-medium text-gray-800 dark:text-gray-200 cursor-pointer text-base sm:text-sm min-h-[44px]"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {language === 'bn' ? div.nameBn : div.name} (ডেলিভারি ৳{div.deliveryFee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1.5">
                  {language === 'bn' ? 'শহর / এরিয়া *' : 'City / Area *'}
                </label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: ধানমন্ডি / মিরপুর / আগ্রাবাদ' : 'e.g. Dhanmondi / Agrabad'}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1.5">
                {language === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা (বাসা/রোড নম্বর) *' : 'Detailed Street / House Address *'}
              </label>
              <textarea
                rows={2}
                value={address.addressDetails}
                onChange={(e) => setAddress({ ...address, addressDetails: e.target.value })}
                placeholder={language === 'bn' ? 'বাসা নং, রোড নং, এলাকা...' : 'House no, Road no, Landmark...'}
                className="w-full p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[64px]"
              />
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="space-y-3 bg-gray-50/70 dark:bg-gray-850/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 text-sm">
              <CreditCard className="w-4 h-4 text-[#f85606] dark:text-orange-400" />
              <span>{language === 'bn' ? '২. পেমেন্ট মেথড নির্বাচন করুন' : '2. Payment Method'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPayment('cod')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer min-h-[48px] ${
                  selectedPayment === 'cod'
                    ? 'border-[#f85606] bg-orange-50/80 dark:bg-orange-950/30 ring-1 ring-[#f85606]'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedPayment === 'cod' ? 'border-[#f85606] bg-[#f85606]' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedPayment === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                    {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'পণ্য হাতে পেয়ে টাকা পরিশোধ' : 'Pay when you receive package'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment('bkash')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer min-h-[48px] ${
                  selectedPayment === 'bkash'
                    ? 'border-[#e2136e] bg-pink-50/80 dark:bg-pink-950/30 ring-1 ring-[#e2136e]'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedPayment === 'bkash' ? 'border-[#e2136e] bg-[#e2136e]' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedPayment === 'bkash' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-bold text-pink-700 dark:text-pink-400 flex items-center gap-1 text-xs sm:text-sm">
                    <span>bKash (বিকাশ)</span>
                    <span className="bg-pink-100 dark:bg-pink-900/60 text-[#e2136e] dark:text-pink-300 text-[9px] px-1 rounded font-extrabold">১০% ছাড়</span>
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'সহজ অনলাইন ও অফলাইন পে' : 'Instant mobile gateway'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment('nagad')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer min-h-[48px] ${
                  selectedPayment === 'nagad'
                    ? 'border-[#f7941d] bg-amber-50/80 dark:bg-amber-950/30 ring-1 ring-[#f7941d]'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedPayment === 'nagad' ? 'border-[#f7941d] bg-[#f7941d]' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedPayment === 'nagad' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400 text-xs sm:text-sm">Nagad (নগদ)</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'নগদ ওয়ালেট পেমেন্ট' : 'Direct Nagad payment'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment('card')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer min-h-[48px] ${
                  selectedPayment === 'card'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedPayment === 'card' ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedPayment === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-bold text-blue-800 dark:text-blue-300 text-xs sm:text-sm">Visa / Mastercard</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'ডেবিট ও ক্রেডিট কার্ড' : 'Debit or Credit Card'}
                  </p>
                </div>
              </button>
            </div>

            {/* Interactive bKash / Nagad Guidance Box */}
            {(selectedPayment === 'bkash' || selectedPayment === 'nagad') && (
              <div className={`p-4 rounded-2xl border text-xs space-y-3 animate-in slide-in-from-top-2 mt-3 ${
                selectedPayment === 'bkash'
                  ? 'bg-pink-50/90 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800 text-pink-950 dark:text-pink-200'
                  : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {selectedPayment === 'bkash' ? 'bKash মার্চেন্ট পেমেন্ট গাইড' : 'Nagad পেমেন্ট গাইড'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/80 dark:bg-black/40 border border-current">
                    ইনস্ট্যান্ট ভেরিফিকেশন
                  </span>
                </div>

                <div className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-xl border border-pink-150 dark:border-pink-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 block font-semibold">মার্চেন্ট নম্বর (Make Payment):</span>
                    <span className="font-mono font-black text-sm tracking-wider text-gray-900 dark:text-white">
                      {selectedPayment === 'bkash' ? '01700-112233' : '01800-445566'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPayment === 'bkash' ? '01700112233' : '01800445566');
                      setIsCopiedNum(true);
                      setTimeout(() => setIsCopiedNum(false), 2000);
                    }}
                    className="flex items-center gap-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {isCopiedNum ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedNum ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                  <li>আপনার {selectedPayment === 'bkash' ? 'bKash' : 'Nagad'} অ্যাপ খুলুন অথবা ডায়াল করুন।</li>
                  <li><strong>Make Payment</strong> অপশনে গিয়ে ওপরের নম্বরে <strong>৳{finalAmount}</strong> পরিশোধ করুন।</li>
                  <li>পেমেন্ট সফল হলে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> নিচে লিখে নিশ্চিত করুন।</li>
                </ol>

                <div className="pt-1">
                  <label className="block font-bold mb-1 text-[11px] text-gray-800 dark:text-gray-200">
                    Transaction ID (TrxID) লিখুন:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => {
                        setTrxId(e.target.value.toUpperCase());
                        setIsTrxVerified(false);
                      }}
                      placeholder="যেমন: 9J3K8L2M9P"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 font-mono font-bold uppercase outline-none focus:border-[#f85606]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (trxId.length >= 6) {
                          setIsTrxVerified(true);
                        } else {
                          alert('অনুগ্রহ করে সঠিক Transaction ID লিখুন (কমপক্ষে ৬ অক্ষর)');
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      {isTrxVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      <span>{isTrxVerified ? 'যাচাই হয়েছে' : 'যাচাই করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Vouchers & SmartShopX Coins */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 text-sm">
              <Tag className="w-4 h-4 text-[#ea580c] dark:text-orange-400" />
              <span>{language === 'bn' ? '৩. ভাউচার ও স্মার্টশপ কয়েন' : '3. Vouchers & Smart Coins'}</span>
            </h4>

            {/* Voucher input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={language === 'bn' ? 'ভাউচার কোড লিখুন (যেমন DARAZ2026)' : 'Enter promo code'}
                className="flex-1 px-3 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700 uppercase font-bold outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => handleApplyVoucher()}
                className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs sm:text-sm min-h-[44px]"
              >
                {language === 'bn' ? 'প্রয়োগ করুন' : 'Apply'}
              </button>
            </div>

            {appliedVoucher && (
              <div className="p-2.5 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-between text-xs font-semibold">
                <span>
                  🎉 {appliedVoucher.code} ({language === 'bn' ? appliedVoucher.titleBn : appliedVoucher.titleEn})
                </span>
                <span className="font-black">-৳{voucherDiscount}</span>
              </div>
            )}

            {/* SmartShopX Coins Checkbox */}
            {coins > 0 && (
              <label className="flex items-center gap-2 p-2.5 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCoins}
                  onChange={(e) => setUseCoins(e.target.checked)}
                  className="rounded text-[#f85606] focus:ring-[#f85606] w-4 h-4"
                />
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-gray-900 dark:text-gray-100 font-semibold flex-1">
                  {language === 'bn'
                    ? `${maxUsableCoins} স্মার্ট কয়েন ব্যবহার করে ৳${Math.floor(maxUsableCoins / 10)} ছাড় নিন`
                    : `Redeem ${maxUsableCoins} Smart Coins for ৳${Math.floor(maxUsableCoins / 10)} discount`}
                </span>
                <span className="text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                  (ব্যালেন্স: {coins})
                </span>
              </label>
            )}
          </div>

          {/* 4. Order Summary Calculations */}
          <div className="bg-orange-50/60 dark:bg-gray-800 p-4 rounded-2xl border border-orange-200/80 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-gray-700 dark:text-gray-300 font-medium">
              <span>{language === 'bn' ? `পণ্যের মোট মূল্য (${cart.length} টি):` : `Items Total (${cart.length}):`}</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">৳{itemsTotal.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300 font-medium">
              <span>{language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
              <span className="font-bold">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{language === 'bn' ? 'ফ্রি' : 'FREE'}</span>
                ) : (
                  `৳${deliveryFee}`
                )}
              </span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-emerald-800 dark:text-emerald-400 font-semibold">
                <span>{language === 'bn' ? 'ভাউচার ডিসকাউন্ট:' : 'Voucher Discount:'}</span>
                <span>-৳{voucherDiscount}</span>
              </div>
            )}
            {coinDiscount > 0 && (
              <div className="flex justify-between text-amber-800 dark:text-amber-400 font-semibold">
                <span>{language === 'bn' ? 'কয়েন ডিসকাউন্ট:' : 'Coins Discount:'}</span>
                <span>-৳{coinDiscount}</span>
              </div>
            )}

            <div className="pt-2 border-t border-orange-200 dark:border-gray-700 flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100">
                {language === 'bn' ? 'সর্বমোট প্রদেয় মূল্য:' : 'Total Payable Amount:'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#ea580c] dark:text-orange-400">
                ৳{finalAmount.toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>{language === 'bn' ? 'নিশ্চিত অর্ডারের পর ট্র্যাকিং কোড পাবেন' : 'Tracking ID generated upon confirmation'}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="bg-[#f85606] hover:bg-[#d84a05] disabled:opacity-50 text-white font-extrabold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/30 transition active:scale-95 text-sm cursor-pointer"
          >
            {isSubmitting ? (
              <span>{language === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Processing...'}</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isOnline
                    ? (language === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order')
                    : (language === 'bn' ? 'অফলাইন অর্ডার সেভ করুন' : 'Save Offline Order')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
