import React from 'react';
import { X, Headphones, Phone, Mail, MessageCircle, HelpCircle, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

interface CustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
}

export const CustomerCareModal: React.FC<CustomerCareModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;

  const faqs = [
    {
      qBn: 'অর্ডার কীভাবে ট্র্যাক করব?',
      qEn: 'How do I track my order?',
      aBn: 'ওয়েবসাইটের উপরের "ট্র্যাক অর্ডার" অপশনে ক্লিক করে আপনার অর্ডার আইডি ও ফোন নম্বর দিয়ে বর্তমান ডেলিভারি স্ট্যাটাস দেখতে পারবেন।',
      aEn: 'Click on "Track Order" in the top bar to view live shipping status.'
    },
    {
      qBn: 'ডেলিভারি চার্জ কত এবং কত দিন সময় লাগে?',
      qEn: 'What is the delivery fee and timeframe?',
      aBn: 'ঢাকা সিটিতে ডেলিভারি চার্জ মাত্র ৳৬০ (১-২ কার্যদিবস)। ঢাকার বাইরে সারাদেশে ৳১১০ (২-৩ কার্যদিবস)। ৳২,০০০ বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি!',
      aEn: 'Dhaka City ৳60 (1-2 days). Outside Dhaka ৳110 (2-3 days). Orders over ৳2,000 get Free Shipping!'
    },
    {
      qBn: 'পণ্য পছন্দ না হলে কীভাবে রিটার্ন করব?',
      qEn: 'How do I return a product?',
      aBn: 'পণ্য গ্রহণের ৭ থেকে ১৪ দিনের মধ্যে কোনো সমস্যা থাকলে হেল্পলাইনে কল করে বা অর্ডার সেকশন থেকে রিটার্ন রিকোয়েস্ট করতে পারেন।',
      aEn: 'You can initiate return within 7-14 days through customer support.'
    },
    {
      qBn: 'ক্যাশ অন ডেলিভারিতে কীভাবে পেমেন্ট করব?',
      qEn: 'How does Cash on Delivery work?',
      aBn: 'কুরিয়ার পার্সন আপনার ঠিকানায় পণ্য পৌঁছে দিলে প্যাকেট দেখে মূল্য নগদ বা বিকাশে পরিশোধ করতে পারবেন।',
      aEn: 'Pay cash directly to the courier agent upon receiving your package.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-[#f85606] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="text-base font-bold">
                {language === 'bn' ? 'SmartShopX.bd হেল্প সেন্টার ও কাস্টমার কেয়ার' : 'SmartShopX.bd Help Center & Customer Care'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? '২৪ ঘণ্টা গ্রাহক সেবা ও সরাসরি সহায়তা' : '24/7 Dedicated Customer Support'}
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

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 text-xs sm:text-sm pb-20 sm:pb-6">
          {/* Contact options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f85606] text-white flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">১৬৪৯২</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">09:00 AM - 09:00 PM</p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 truncate">support@smartshopx.bd</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{language === 'bn' ? 'ইমেইল হেল্প' : 'Email Help'}</p>
              </div>
            </div>

            <div className="p-3.5 bg-green-50/70 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{language === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}</p>
                <p className="text-[10px] text-green-700 dark:text-green-400 font-bold">{language === 'bn' ? 'অনলাইন আছে' : 'Active Now'}</p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#f85606] dark:text-orange-400" />
              <span>{language === 'bn' ? 'সাধারণ জিজ্ঞাসাসমূহ (FAQ)' : 'Frequently Asked Questions'}</span>
            </h4>
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                    {language === 'bn' ? faq.qBn : faq.qEn}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                    {language === 'bn' ? faq.aBn : faq.aEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
