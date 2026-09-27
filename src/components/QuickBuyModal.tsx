import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Product, Order, DeliveryAddress, Voucher, CartItem } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/mockProducts';
import { MarketplaceService } from '../services/marketplaceService';
import {
  X,
  Zap,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  CreditCard,
  Sparkles,
  WifiOff,
  CheckCircle2,
  Tag,
  AlertCircle
} from 'lucide-react';

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedColor?: string;
  selectedSize?: string;
  quantity?: number;
  language: 'bn' | 'en';
  isOnline: boolean;
  userAddress: DeliveryAddress;
  onSaveAddress: (addr: DeliveryAddress) => void;
  onOrderPlaced: (order: Order, isOffline: boolean) => void;
  vouchers?: Voucher[];
}

export const QuickBuyModal: React.FC<QuickBuyModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedColor: initialColor,
  selectedSize: initialSize,
  quantity: initialQty = 1,
  language,
  isOnline,
  userAddress,
  onSaveAddress,
  onOrderPlaced,
  vouchers = []
}) => {
  const [quantity, setQuantity] = useState(initialQty);
  const [selectedColor, setSelectedColor] = useState(
    initialColor || product?.attributes?.find(a => a.name.toLowerCase().includes('color') || a.nameBn.includes('রং'))?.options[0] || ''
  );
  const [selectedSize, setSelectedSize] = useState(
    initialSize || product?.attributes?.find(a => a.name.toLowerCase().includes('size') || a.nameBn.includes('সাইজ'))?.options[0] || ''
  );
  const [fullName, setFullName] = useState(userAddress.fullName || '');
  const [phone, setPhone] = useState(userAddress.phone || '');
  const [division, setDivision] = useState(userAddress.division || 'dhaka');
  const [addressDetails, setAddressDetails] = useState(userAddress.addressDetails || '');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !product) return null;

  const currentDiv = BANGLADESH_DIVISIONS.find((d) => d.id === division) || BANGLADESH_DIVISIONS[0];
  const itemsTotal = product.price * quantity;
  const deliveryFee = itemsTotal >= 2000 || product.isFreeDelivery ? 0 : currentDiv.deliveryFee;
  const finalAmount = itemsTotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMsg(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' : 'Enter a valid 11-digit mobile number.');
      return;
    }
    if (!addressDetails.trim()) {
      setErrorMsg(language === 'bn' ? 'আপনার পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা) লিখুন।' : 'Please enter detailed delivery address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // 1. Marketplace Validation (Section 3 & 4)
    const cartItem: CartItem = {
      product,
      quantity,
      selectedColor,
      selectedSize
    };
    const validation = MarketplaceService.validateCart({
      items: [cartItem],
      address: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        division,
        city: currentDiv.name,
        zone: currentDiv.name,
        addressDetails: addressDetails.trim(),
        label: 'home'
      },
      vouchers
    });

    if (!validation.isValid) {
      setIsSubmitting(false);
      setErrorMsg(
        language === 'bn'
          ? validation.errorsBn[0] || 'দামের বা স্টকের পরিবর্তন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : validation.errors[0] || 'Price or stock mismatch detected. Please try again.'
      );
      return;
    }

    const updatedAddress: DeliveryAddress = {
      fullName: fullName.trim(),
      phone: cleanPhone,
      division,
      city: currentDiv.name,
      zone: currentDiv.name,
      addressDetails: addressDetails.trim(),
      label: 'home'
    };

    onSaveAddress(updatedAddress);

    // Generate Order with Idempotency Key (Section 8)
    const orderId = `SX-${Date.now().toString().slice(-6)}`;
    const clientOrderId = orderId;
    const idempotencyKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      clientOrderId,
      idempotencyKey,
      storeId: product.storeId || product.seller?.storeId || 'STORE_001',
      storeName: product.storeName || product.seller?.name || 'Verified Store',
      items: [cartItem],
      totalAmount: validation.verifiedSubtotal,
      discountAmount: (product.originalPrice - product.price) * quantity + validation.verifiedVoucherDiscount,
      deliveryFee: validation.verifiedDeliveryFee,
      finalAmount: validation.verifiedGrandTotal,
      paymentMethod,
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
          stepBn: isOnline ? 'ইনস্ট্যান্ট অর্ডার কনফার্ম' : 'অফলাইন অর্ডার সংরক্ষিত',
          completed: true,
          time: new Date().toLocaleTimeString()
        },
        {
          step: 'Packed & Dispatched',
          stepBn: 'প্যাকেজিং সম্পন্ন',
          completed: false
        },
        {
          step: 'Handed to Courier',
          stepBn: `${currentDiv.name} কুরিয়ার পার্টনারে হস্তান্তর`,
          completed: false
        },
        {
          step: 'Delivered',
          stepBn: 'হোম ডেলিভারি সফল',
          completed: false
        }
      ]
    };

    if (isOnline) {
      try {
        const dispatchRes = await MarketplaceService.dispatchOrderToCentralBackend(newOrder);
        if (dispatchRes.success && dispatchRes.syncedWithCentralBackend) {
          newOrder.status = 'synced';
          newOrder.backendSynced = true;
          newOrder.syncedAt = new Date().toISOString();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          onOrderPlaced(newOrder, false);
        } else {
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
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      onOrderPlaced(newOrder, true);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#f85606] via-[#ff5500] to-[#ff7a00] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-yellow-300">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                <span>{language === 'bn' ? '১-ক্লিকে সরাসরি অর্ডার' : '1-Click Direct Buy'}</span>
                <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded">FAST</span>
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? 'কোনো রেজিস্ট্রেশন ছাড়াই সরাসরি অর্ডার সম্পন্ন করুন' : 'Place order in 10 seconds without sign-up'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-white px-3 py-1.5 text-xs flex items-center gap-2 shrink-0">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'bn' ? 'অফলাইন মোড: অর্ডারটি ডিভাইসে জমা থাকবে এবং কানেক্ট হলেই প্লেস হবে।' : 'Offline: Order saved locally, auto-synced on reconnect.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 text-xs sm:text-sm pb-20 sm:pb-5">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs sm:text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Product Mini Preview */}
          <div className="flex items-center gap-3 p-3 bg-orange-50/60 dark:bg-gray-850 rounded-2xl border border-orange-100 dark:border-gray-800">
            <img
              src={product.image}
              alt={product.title}
              className="w-16 h-16 rounded-xl object-cover bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate text-xs sm:text-sm">
                {language === 'bn' ? product.titleBn : product.title}
              </h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-[#f85606] dark:text-orange-400">৳{product.price}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">৳{product.originalPrice}</span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold px-1.5 py-0.2 rounded">
                  -{product.discountPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Variant Selectors if product has attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.attributes.map((attr) => (
                <div key={attr.name} className="space-y-1">
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">
                    {language === 'bn' ? attr.nameBn : attr.name}
                  </label>
                  <select
                    value={attr.name.toLowerCase().includes('color') ? selectedColor : selectedSize}
                    onChange={(e) => {
                      if (attr.name.toLowerCase().includes('color')) setSelectedColor(e.target.value);
                      else setSelectedSize(e.target.value);
                    }}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-base sm:text-sm font-semibold focus:border-[#f85606] text-gray-850 dark:text-gray-200 outline-none cursor-pointer min-h-[44px]"
                  >
                    {attr.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
              {language === 'bn' ? 'অর্ডার পরিমাণ (Quantity):' : 'Quantity:'}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-black hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-center text-base active:scale-95 transition"
              >
                -
              </button>
              <span className="font-black text-base w-7 text-center text-gray-900 dark:text-gray-100">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                className="w-9 h-9 rounded-xl bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-black hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-center text-base active:scale-95 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
                  {language === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter full name'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-750 focus:border-[#f85606] text-gray-900 dark:text-gray-100 outline-none font-medium min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
                  {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-750 focus:border-[#f85606] text-gray-900 dark:text-gray-100 outline-none font-medium min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
                  {language === 'bn' ? 'ডেলিভারি বিভাগ *' : 'Division *'}
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full py-2.5 px-3 text-base sm:text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-750 focus:border-[#f85606] text-gray-900 dark:text-gray-100 outline-none font-semibold cursor-pointer min-h-[44px]"
                >
                  {BANGLADESH_DIVISIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'bn' ? d.nameBn : d.name} (৳{d.deliveryFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
                  {language === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা) *' : 'Delivery Address *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder={language === 'bn' ? 'বাসা নং, রোড নং, থানা, জেলা' : 'House, Road, Area'}
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-750 focus:border-[#f85606] text-gray-900 dark:text-gray-100 outline-none font-medium min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Option */}
          <div className="space-y-1.5">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm mb-1.5">
              {language === 'bn' ? 'পেমেন্ট মেথড নির্বাচন করুন:' : 'Payment Method:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer min-h-[48px] ${
                  paymentMethod === 'cod'
                    ? 'border-[#f85606] bg-orange-50 dark:bg-orange-950/30 text-[#f85606] dark:text-orange-400 font-bold'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Truck className="w-4 h-4 shrink-0" />
                <div className="leading-tight">
                  <div className="text-xs sm:text-sm">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">হাতে পেয়ে টাকা দিন</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer min-h-[48px] ${
                  paymentMethod === 'bkash'
                    ? 'border-[#e2136e] bg-pink-50 dark:bg-pink-950/30 text-[#e2136e] dark:text-pink-400 font-bold'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <div className="leading-tight">
                  <div className="text-xs sm:text-sm">bKash (বিকাশ)</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">ইনস্ট্যান্ট পে</div>
                </div>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-850 rounded-2xl p-3.5 space-y-1.5 text-xs sm:text-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{language === 'bn' ? 'পণ্যের মোট মূল্য:' : 'Subtotal:'}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">৳{itemsTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{language === 'bn' ? `ডেলিভারি চার্জ (${currentDiv.nameBn}):` : `Delivery (${currentDiv.name}):`}</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-600 dark:text-emerald-400">FREE</strong> : `৳${deliveryFee}`}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-black text-sm sm:text-base text-gray-900 dark:text-gray-100">
              <span>{language === 'bn' ? 'সর্বমোট পরিশোধযোগ্য:' : 'Total Payable:'}</span>
              <span className="text-[#f85606] dark:text-orange-400">৳{finalAmount}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 min-h-[46px] bg-gradient-to-r from-[#f85606] to-[#ff5500] hover:from-[#e04d05] hover:to-[#e64c00] text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-sm active:scale-[0.99] transition cursor-pointer"
          >
            {isSubmitting ? (
              <span>{language === 'bn' ? 'অর্ডার প্রসেস হচ্ছে...' : 'Processing Order...'}</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                <span>{language === 'bn' ? `৳${finalAmount} - নিশ্চিত অর্ডার করুন` : `Place Order (৳${finalAmount})`}</span>
              </>
            )}
          </button>

          {/* Quick WhatsApp Order */}
          <a
            href={`https://wa.me/8801700000000?text=${encodeURIComponent(
              `আসসালামু আলাইকুম, আমি সরাসরি WhatsApp এ অর্ডার করতে চাই:\nপণ্য: ${product.titleBn || product.title}\nপরিমাণ: ${quantity}টি\nসর্বমোট মূল্য: ৳${finalAmount}\nনাম: ${fullName || '...'}\nমোবাইল: ${phone || '...'}\nঠিকানা: ${addressDetails || '...'}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm transition active:scale-95 cursor-pointer"
          >
            <span>📱 WhatsApp এ ১-ক্লিক অর্ডার পাঠান</span>
          </a>
        </form>
      </div>
    </div>
  );
};
