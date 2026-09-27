import React, { useState } from 'react';
import { X, Store, CheckCircle, TrendingUp, DollarSign, Truck, Users, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
}

export const SellerModal: React.FC<SellerModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;

  const [submitted, setSubmitted] = useState(false);
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Electronics');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !phone) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 }
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-[#f85606] to-[#ff7a00] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="text-base font-bold">
                {language === 'bn' ? 'SmartShopX.bd-এ সেলার রেজিস্ট্রেশন' : 'Sell on SmartShopX.bd'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? 'দেশের কোটি কোটি ক্রেতার কাছে আপনার পণ্য বিক্রি করুন' : 'Reach millions of customers nationwide'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 pb-20 sm:pb-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {language === 'bn' ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Seller Application Received!'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'SmartShopX সেলার সাপোর্ট টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।'
                  : 'Our seller onboarding team will contact you shortly.'}
              </p>
            </div>
          ) : (
            <>
              {/* Value props */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-800">
                  <TrendingUp className="w-4 h-4 text-[#f85606] dark:text-orange-400 mx-auto mb-1" />
                  <p className="font-bold text-gray-800 dark:text-gray-200">{language === 'bn' ? '০% রেজিস্ট্রেশন ফি' : '0% Signup Fee'}</p>
                </div>
                <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-800">
                  <Truck className="w-4 h-4 text-[#f85606] dark:text-orange-400 mx-auto mb-1" />
                  <p className="font-bold text-gray-800 dark:text-gray-200">{language === 'bn' ? 'এক্সপ্রেস ডেলিভারি' : 'SX Express'}</p>
                </div>
                <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-800">
                  <DollarSign className="w-4 h-4 text-[#f85606] dark:text-orange-400 mx-auto mb-1" />
                  <p className="font-bold text-gray-800 dark:text-gray-200">{language === 'bn' ? 'সাপ্তাহিক পেমেন্ট' : 'Fast Payout'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1.5">
                    {language === 'bn' ? 'আপনার দোকানের নাম *' : 'Shop / Business Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ঢাকা গ্যাজেট শপ' : 'e.g. Dhaka Gadget Hub'}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1.5">
                    {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#f85606] text-base sm:text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1.5">
                    {language === 'bn' ? 'পণ্যের প্রধান ক্যাটাগরি' : 'Primary Product Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#f85606] cursor-pointer text-base sm:text-sm min-h-[44px]"
                  >
                    <option value="Electronics">স্মার্টফোন ও গ্যাজেট (Electronics)</option>
                    <option value="Fashion">ফ্যাশন ও পোশাক (Fashion)</option>
                    <option value="Home">হোম ও কিচেন অ্যাপ্লায়েন্স (Home Appliances)</option>
                    <option value="Beauty">রূপচর্চা ও বিউটি (Health & Beauty)</option>
                    <option value="Groceries">অর্গানিক ফুড ও গ্রোসারি (Groceries)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f85606] hover:bg-[#d84a05] text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer min-h-[46px] text-sm"
                >
                  {language === 'bn' ? 'সেলার হিসেবে যোগ দিন' : 'Submit Seller Application'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
