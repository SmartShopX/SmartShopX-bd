import React from 'react';
import {
  X,
  User,
  Sun,
  Moon,
  Coins,
  Tag,
  Package,
  Heart,
  Bell,
  Scale,
  Gift,
  Store,
  Headphones,
  MapPin,
  Globe,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Palette,
  Check,
  LogIn,
  LogOut
} from 'lucide-react';
import { AuthState, CustomerSession, DeliveryAddress, Order, Voucher } from '../types';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSetTheme?: (theme: 'light' | 'dark') => void;
  coins: number;
  vouchers: Voucher[];
  orders: Order[];
  wishlistCount: number;
  compareCount?: number;
  unreadNotificationsCount?: number;
  userAddress: DeliveryAddress;
  authState?: AuthState;
  session?: CustomerSession | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onOpenAccountModal?: (tab?: 'info' | 'addresses' | 'orders' | 'rewards' | 'security') => void;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  onOpenVouchers: () => void;
  onOpenNotifications?: () => void;
  onOpenCompare?: () => void;
  onOpenSpin?: () => void;
  onOpenSeller: () => void;
  onOpenHelp: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  theme,
  onToggleTheme,
  onSetTheme,
  coins,
  vouchers,
  orders,
  wishlistCount,
  compareCount = 0,
  unreadNotificationsCount = 0,
  userAddress,
  authState = 'AUTHENTICATED',
  session,
  onLogin,
  onLogout,
  onOpenAccountModal,
  onOpenOrders,
  onOpenWishlist,
  onOpenVouchers,
  onOpenNotifications,
  onOpenCompare,
  onOpenSpin,
  onOpenSeller,
  onOpenHelp
}) => {
  if (!isOpen) return null;

  const collectedVouchersCount = vouchers.filter((v) => v.isCollected).length;
  const isDark = theme === 'dark';
  const isAuthenticated = authState === 'AUTHENTICATED' && Boolean(session?.isAuthenticated ?? true);

  const displayName = session?.fullName || userAddress.fullName || (language === 'bn' ? 'মো. তানভীর আহমেদ' : 'Md. Tanvir Ahmed');
  const displayPhone = session?.phone || userAddress.phone || '01712-345678';

  const handleSelectTheme = (targetTheme: 'light' | 'dark') => {
    if (onSetTheme) {
      onSetTheme(targetTheme);
    } else if (theme !== targetTheme) {
      onToggleTheme();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 safe-area-modal-overlay"
      onClick={onClose}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-colors border-l border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 h-full"
        >
          {/* Header with User Profile Summary & Safe Area Inset */}
          <div className="p-4 sm:p-5 safe-area-drawer-header border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/40 dark:via-gray-850 dark:to-gray-900">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#f85606] text-white shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      SmartClub VIP
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      {language === 'bn' ? 'ভেরিফাইড অ্যাকাউন্ট' : 'Verified'}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <User className="w-3 h-3" />
                    {language === 'bn' ? 'গেস্ট মোড' : 'Guest Mode'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                aria-label="Close Profile Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Row or Login Box */}
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#f85606] to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white dark:border-gray-800">
                      {displayName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                      <span>{displayName}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {displayPhone} • {userAddress.city || 'Dhaka'}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#f85606] dark:text-orange-400 font-semibold mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === 'bn' ? 'গোল্ড মেম্বারশিপ লেভেল' : 'Gold Membership Level'}</span>
                    </div>
                  </div>
                </div>

                {onOpenAccountModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAccountModal('info');
                    }}
                    className="w-full py-2 px-3 bg-white dark:bg-gray-800 border border-orange-200 dark:border-gray-700 hover:border-orange-500 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl flex items-center justify-between shadow-2xs transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#f85606]" />
                      <span>{language === 'bn' ? 'আমার অ্যাকাউন্ট ও ঠিকানা পরিচালনা' : 'Manage Profile & Address Book'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-gray-800/90 p-3.5 rounded-2xl border border-orange-200 dark:border-gray-700 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#f85606] dark:text-orange-400 flex items-center justify-center font-bold">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">
                      {language === 'bn' ? 'অ্যাকাউন্টে লগইন করুন' : 'Login to your account'}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'bn' ? 'অর্ডার ট্র্যাকিং ও পয়েন্ট পেতে সাইন ইন করুন' : 'Sign in to access your orders & points'}
                    </p>
                  </div>
                </div>

                {onLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogin();
                    }}
                    className="w-full bg-[#f85606] hover:bg-[#d84a05] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লগইন / সাইন আপ করুন' : 'Login / Sign Up'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Fast Stats Row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVouchers();
                }}
                className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-orange-300 dark:hover:border-orange-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-sm">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{isAuthenticated ? coins : 0}</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {language === 'bn' ? 'কয়েন পয়েন্ট' : 'Coins'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVouchers();
                }}
                className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-orange-300 dark:hover:border-orange-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-[#f85606] font-black text-sm">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{isAuthenticated ? collectedVouchersCount : 0}</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {language === 'bn' ? 'ভাউচার' : 'Vouchers'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-orange-300 dark:hover:border-orange-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 font-black text-sm">
                  <Package className="w-3.5 h-3.5" />
                  <span>{isAuthenticated ? orders.length : 0}</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {language === 'bn' ? 'অর্ডারসমূহ' : 'Orders'}
                </span>
              </button>
            </div>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 safe-area-bottom">
            {/* ======================================================== */}
            {/* DEDICATED THEME TOGGLE & DISPLAY SETTINGS AREA          */}
            {/* ======================================================== */}
            <div className="bg-gradient-to-br from-orange-500/8 via-amber-500/5 to-transparent dark:from-gray-800/90 dark:via-gray-800/50 dark:to-gray-850 rounded-2xl border-2 border-orange-200/90 dark:border-orange-500/30 p-4 shadow-xs transition-all">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
                    isDark ? 'bg-amber-400/20 text-amber-400' : 'bg-orange-500 text-white'
                  }`}>
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'থিম ও ডিসপ্লে সেটিংস' : 'Theme & Display Settings'}</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'bn' ? 'ম্যানুয়ালি লাইট ও ডার্ক মোড পরিবর্তন করুন' : 'Manually switch between light & dark modes'}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-colors ${
                  isDark
                    ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                    : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}>
                  {isDark ? (language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode') : (language === 'bn' ? 'লাইট মোড' : 'Light Mode')}
                </span>
              </div>

              {/* The Dedicated Toggle Switch Row */}
              <div className="bg-white dark:bg-gray-850/90 rounded-xl p-3 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-800 text-amber-300' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                      {isDark
                        ? (language === 'bn' ? 'ডার্ক মোড সক্রিয়' : 'Dark Mode Active')
                        : (language === 'bn' ? 'লাইট মোড সক্রিয়' : 'Light Mode Active')}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {isDark
                        ? (language === 'bn' ? 'রাতের বেলা চোখের আরামদায়ক ভিউ' : 'Easy on the eyes in low light')
                        : (language === 'bn' ? 'উজ্জ্বল এবং স্পষ্ট দিবালোক ভিউ' : 'Crisp and bright day contrast')}
                    </div>
                  </div>
                </div>

                {/* Dedicated Interactive Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDark}
                  onClick={onToggleTheme}
                  className={`w-14 h-8 shrink-0 rounded-full p-1 transition-colors duration-200 ease-in-out relative cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#f85606]/40 ${
                    isDark ? 'bg-[#f85606]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  title={
                    isDark
                      ? (language === 'bn' ? 'লাইট মোডে পরিবর্তন করুন' : 'Switch to Light Mode')
                      : (language === 'bn' ? 'ডার্ক মোডে পরিবর্তন করুন' : 'Switch to Dark Mode')
                  }
                  aria-label="Toggle Theme Mode"
                >
                  <span
                    className={`pointer-events-none w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[10px] ${
                      isDark ? 'translate-x-6 bg-gray-900 text-amber-300' : 'translate-x-0 text-amber-500'
                    }`}
                  >
                    {isDark ? (
                      <Moon className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 fill-current" />
                    )}
                  </span>
                </button>
              </div>

              {/* Segmented Dual-Mode Selector Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectTheme('light')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    !isDark
                      ? 'bg-orange-500 text-white border-orange-600 shadow-xs ring-2 ring-orange-500/20'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-white' : 'text-amber-500'}`} />
                  <span>{language === 'bn' ? 'লাইট মোড' : 'Light Mode'}</span>
                  {!isDark && <Check className="w-3.5 h-3.5 stroke-[3] ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTheme('dark')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-gray-800 text-amber-300 border-orange-500 shadow-xs ring-2 ring-orange-500/30'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300 fill-current' : 'text-gray-500'}`} />
                  <span>{language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</span>
                  {isDark && <Check className="w-3.5 h-3.5 stroke-[3] ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Language Preference Section */}
            <div className="bg-gray-50 dark:bg-gray-850 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {language === 'bn' ? 'অ্যাপের ভাষা' : 'App Language'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Language</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    language === 'bn'
                      ? 'bg-[#f85606] text-white border-[#f85606] shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>বাংলা</span>
                  {language === 'bn' && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    language === 'en'
                      ? 'bg-[#f85606] text-white border-[#f85606] shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Saved Delivery Address Preview */}
            <div className="bg-gray-50 dark:bg-gray-850 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#f85606]" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {language === 'bn' ? 'সংরক্ষিত ডেলিভারি ঠিকানা' : 'Default Delivery Address'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-[#f85606] font-bold px-2 py-0.5 rounded-full uppercase">
                    {userAddress.label === 'office' ? (language === 'bn' ? 'অফিস' : 'Office') : (language === 'bn' ? 'বাসা' : 'Home')}
                  </span>
                  {onOpenAccountModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAccountModal('addresses');
                      }}
                      className="text-[11px] font-bold text-[#f85606] hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'পরিবর্তন' : 'Manage'}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {userAddress.addressDetails || 'House 42, Road 11, Block D'}, {userAddress.zone || 'Gulshan / Banani'}, {userAddress.city || 'Dhaka'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {language === 'bn' ? 'প্রাপক:' : 'Recipient:'} {userAddress.fullName} • {userAddress.phone}
              </p>
            </div>

            {/* Quick Navigation Menu Links */}
            <div className="space-y-1 pt-1">
              <div className="px-1 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                {language === 'bn' ? 'ন্যাভিগেশন মেনু' : 'Navigation Menu'}
              </div>

              {/* Orders */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                      {language === 'bn' ? 'আমার অর্ডারসমূহ ও লাইভ ট্র্যাকিং' : 'My Orders & Tracking'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {orders.length} {language === 'bn' ? 'টি অর্ডার রেকর্ড' : 'order records'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWishlist();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                      {language === 'bn' ? 'পছন্দের পণ্য তালিকা (উইশলিস্ট)' : 'My Wishlist'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {wishlistCount} {language === 'bn' ? 'টি আইটেম সংরক্ষিত' : 'saved items'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Vouchers & Rewards */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVouchers();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                      {language === 'bn' ? 'ভাউচার সেন্টার ও ডেইলি চেক-ইন' : 'Vouchers & Daily Check-in'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {collectedVouchersCount} {language === 'bn' ? 'টি সক্রিয় কুপন' : 'active coupons'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Notifications */}
              {onOpenNotifications && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNotifications();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center relative">
                      <Bell className="w-4 h-4" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f85606] rounded-full animate-ping"></span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                        {language === 'bn' ? 'নোটিফিকেশন সেন্টার' : 'Notifications'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {unreadNotificationsCount > 0
                          ? `${unreadNotificationsCount} ${language === 'bn' ? 'টি নতুন বার্তা' : 'new alerts'}`
                          : language === 'bn' ? 'সকল আপডেট দেখা হয়েছে' : 'All caught up'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Product Compare */}
              {onOpenCompare && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCompare();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                        {language === 'bn' ? 'পণ্য তুলনা টুল' : 'Product Comparison Tool'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {compareCount > 0
                          ? `${compareCount} ${language === 'bn' ? 'টি পণ্য নির্বাচিত' : 'items selected'}`
                          : language === 'bn' ? 'বৈশিষ্ট্য ও দাম তুলনা করুন' : 'Compare specs & prices'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Spin & Win */}
              {onOpenSpin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSpin();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                      <Gift className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                        {language === 'bn' ? 'লাকি স্পিন হুইল' : 'Lucky Spin Wheel'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {language === 'bn' ? 'দৈনিক ফ্রি কয়েন ও ভাউচার জিতুন' : 'Win free coins and discounts daily'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Customer Care */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHelp();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                      {language === 'bn' ? '২৪/৭ কাস্টমার কেয়ার ও সাপোর্ট' : '24/7 Customer Care & FAQ'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {language === 'bn' ? 'সহায়তা ও রিটার্ন পলিসি' : 'Help center & return policy'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Sell on SmartShopX */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSeller();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-left text-gray-800 dark:text-gray-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold group-hover:text-[#f85606] transition-colors">
                      {language === 'bn' ? 'সেলার হিসেবে পণ্য বিক্রি করুন' : 'Sell on SmartShopX'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {language === 'bn' ? '০% কমিশন দিয়ে ব্যবসা শুরু করুন' : 'Start your online store with 0% fees'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Logout Button (When Authenticated) */}
              {isAuthenticated && onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition cursor-pointer text-left group border-t border-gray-100 dark:border-gray-800 mt-2 pt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100/70 dark:bg-rose-950/50 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">
                        {language === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট' : 'Logout from Account'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {language === 'bn' ? 'সেশন সমাপ্ত করুন' : 'End active customer session'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Footer Area with Safe-Area Inset Support */}
          <div className="p-4 safe-area-drawer-footer border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/70 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
              <Smartphone className="w-3.5 h-3.5 text-[#f85606]" />
              <span>SmartShopX Bangladesh PWA v2.4.0</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {language === 'bn' ? 'সুরক্ষিত লেনদেন • আসল পণ্য গ্যারান্টি' : 'Secure Checkout • 100% Authentic'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
