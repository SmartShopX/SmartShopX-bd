import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  language: 'bn' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-[#0b1a30] text-gray-300 mt-12 border-t-4 border-[#f85606]">
      {/* Upper features grid */}
      <div className="border-b border-gray-800 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-yellow-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">
                {language === 'bn' ? 'সারা দেশে ডেলিভারি' : 'Nationwide Delivery'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-2">
                {language === 'bn' ? 'বাংলাদেশের ৬৪টি জেলায় ক্যাশ অন ডেলিভারি' : 'Fast delivery to all 64 districts'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-yellow-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">
                {language === 'bn' ? '১০০% আসল পণ্য' : '100% Genuine Products'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-2">
                {language === 'bn' ? 'স্মার্টমল অথেনটিসিটি গ্যারান্টি' : 'SmartMall verified brand warranty'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-yellow-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">
                {language === 'bn' ? 'সহজ রিটার্ন পলিসি' : '7-14 Days Return'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-2">
                {language === 'bn' ? 'কোনো ঝামেলা ছাড়াই পরিবর্তনের সুবিধা' : 'Hassle-free replacement policy'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-yellow-400 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">
                {language === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : '24/7 Support'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-2">
                {language === 'bn' ? 'কল করুন ১৬৪৯২ অথবা লাইভ চ্যাট' : 'Call 16492 or Live Chat with us'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand highlight bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full shadow-md">
              <Logo size="md" showText={false} />
            </div>
            <div>
              <h3 className="text-white font-black text-base flex items-baseline gap-0.5">
                <span>SmartShop</span><span className="text-[#f85606]">X</span><span className="text-[#00a8ff] text-xs">.bd</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">Smart Choice, Better Life • বাংলাদেশের প্রিমিয়াম অনলাইন শপিং মার্কেটপ্লেস ও ডিজিটাল হিসাব</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">✓ Verified Merchant</span>
            <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full">⚡ Fast Dispatch</span>
          </div>
        </div>
      </div>

      {/* Main Links Area */}
      <div className="py-10 px-4 sm:px-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        {/* Col 1: Customer Care */}
        <div className="space-y-3">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider text-[#f85606]">
            {language === 'bn' ? 'কাস্টমার কেয়ার' : 'Customer Care'}
          </h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#help" className="hover:text-white transition">{language === 'bn' ? 'হেল্প সেন্টার' : 'Help Center'}</a></li>
            <li><a href="#how-to-buy" className="hover:text-white transition">{language === 'bn' ? 'অর্ডার কীভাবে করবেন?' : 'How to Buy'}</a></li>
            <li><a href="#returns" className="hover:text-white transition">{language === 'bn' ? 'রিটার্ন ও রিফান্ড পলিসি' : 'Returns & Refunds'}</a></li>
            <li><a href="#contact" className="hover:text-white transition">{language === 'bn' ? 'যোগাযোগ ও সাপোর্ট (১৬৪৯২)' : 'Contact Us (16492)'}</a></li>
          </ul>
        </div>

        {/* Col 2: SmartShopX Information */}
        <div className="space-y-3">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider text-[#f85606]">
            {language === 'bn' ? 'SmartShopX.bd' : 'SmartShopX.bd'}
          </h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#about" className="hover:text-white transition">{language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</a></li>
            <li><a href="#seller" className="hover:text-white transition">{language === 'bn' ? 'সেলার হিসেবে বিক্রি করুন' : 'Sell on SmartShopX'}</a></li>
            <li><a href="#mall" className="hover:text-white transition">{language === 'bn' ? 'স্মার্টমল ও অফিশিয়াল স্টোর' : 'SmartMall Official'}</a></li>
            <li><a href="#privacy" className="hover:text-white transition">{language === 'bn' ? 'প্রাইভেসি পলিসি ও শর্তাবলী' : 'Privacy Policy & Terms'}</a></li>
          </ul>
        </div>

        {/* Col 3: Payment Partners */}
        <div className="space-y-3">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider text-[#f85606]">
            {language === 'bn' ? 'পেমেন্ট মেথড সমূহ' : 'Payment Methods'}
          </h4>
          <p className="text-gray-400">
            {language === 'bn'
              ? 'নিরাপদ গেটওয়ে এবং ক্যাশ অন ডেলিভারি'
              : 'Secure online gateway and Cash on Delivery'}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="bg-[#e2136e] text-white px-2.5 py-1 rounded text-[11px] font-bold">bKash (বিকাশ)</span>
            <span className="bg-[#f7941d] text-white px-2.5 py-1 rounded text-[11px] font-bold">Nagad (নগদ)</span>
            <span className="bg-blue-600 text-white px-2.5 py-1 rounded text-[11px] font-bold">VISA</span>
            <span className="bg-red-600 text-white px-2.5 py-1 rounded text-[11px] font-bold">Mastercard</span>
            <span className="bg-gray-700 text-white px-2.5 py-1 rounded text-[11px] font-bold">Cash On Delivery</span>
          </div>
        </div>

        {/* Col 4: Contact & Office */}
        <div className="space-y-3">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider text-[#f85606]">
            {language === 'bn' ? 'হেড অফিস ও যোগাযোগ' : 'Head Office & Contact'}
          </h4>
          <div className="space-y-2 text-gray-400">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#f85606] shrink-0" />
              <span>{language === 'bn' ? 'গুলশান-২, ঢাকা, বাংলাদেশ' : 'Gulshan-2, Dhaka, Bangladesh'}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>১৬৪৯২ (09:00 AM - 09:00 PM)</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>support@smartshopx.bd</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="bg-[#071120] py-4 px-4 text-center text-gray-500 text-xs border-t border-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SmartShopX.bd Bangladesh. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Made for Bangladeshi shoppers with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};
