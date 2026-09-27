import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  Coins,
  Globe,
  ShieldCheck,
  Headphones,
  Store,
  Tag,
  X,
  Sparkles,
  Scale,
  Gift,
  Flame,
  Star,
  Sun,
  Moon,
  Bell,
  Mic,
  User,
  Menu,
  ChevronDown,
  ChevronRight,
  Grid,
  Zap,
  Smartphone,
  Shirt,
  Laptop,
  ShoppingBag,
  Home
} from 'lucide-react';
import { Category, CustomerSession, Product, Store as StoreType } from '../types';
import { Logo } from './Logo';
import { VoiceSearchModal } from './VoiceSearchModal';

interface NavbarProps {
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenProfile?: () => void;
  session?: CustomerSession;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenAccount?: (tab?: 'info' | 'addresses' | 'orders' | 'rewards' | 'security') => void;
  cartCount: number;
  wishlistCount: number;
  compareCount?: number;
  unreadNotificationsCount?: number;
  coins: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  categories: Category[];
  allProducts?: Product[];
  stores?: StoreType[];
  onSelectProduct?: (product: Product) => void;
  onSelectStore?: (store: StoreType) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenNotifications?: () => void;
  onOpenVouchers: () => void;
  onOpenHelp: () => void;
  onOpenSeller: () => void;
  onOpenSpin?: () => void;
  onOpenCompare?: () => void;
  onOpenAdmin?: () => void;
  onOpenSmartHisab?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  theme = 'light',
  onToggleTheme,
  onOpenProfile,
  session,
  onOpenAuth,
  onOpenAccount,
  cartCount,
  wishlistCount,
  compareCount = 0,
  unreadNotificationsCount = 0,
  coins,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  allProducts = [],
  stores = [],
  onSelectProduct,
  onSelectStore,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenNotifications,
  onOpenVouchers,
  onOpenHelp,
  onOpenSeller,
  onOpenSpin,
  onOpenCompare,
  onOpenAdmin,
  onOpenSmartHisab
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const storeMenuRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-rose-500" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Home':
        return <Home className="w-4 h-4 text-emerald-500" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-purple-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4 text-orange-500" />;
      default:
        return <Grid className="w-4 h-4 text-orange-500" />;
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const popularKeywords = [
    { label: 'নাপা (প্যারাসিটামল)', labelEn: 'Napa 500mg', term: 'napa' },
    { label: 'ইয়ারবাডস', labelEn: 'Earbuds', term: 'earbuds' },
    { label: 'স্মার্টওয়াচ', labelEn: 'Smartwatch', term: 'watch' },
    { label: 'পাঞ্জাবি', labelEn: 'Panjabi', term: 'panjabi' },
    { label: 'সুন্দরবনের মধু', labelEn: 'Pure Honey', term: 'honey' },
    { label: 'টি-শার্ট', labelEn: 'T-Shirt', term: 'shirt' }
  ];

  const qLower = searchQuery.toLowerCase().trim();

  // Multi-dimensional Search (Section 6: Name, Brand, Category, Generic Name, SKU, Barcode, Store)
  const searchSuggestions = qLower
    ? allProducts
        .filter((p) =>
          p.title.toLowerCase().includes(qLower) ||
          p.titleBn.includes(searchQuery.trim()) ||
          p.brand.toLowerCase().includes(qLower) ||
          p.category.toLowerCase().includes(qLower) ||
          (p.genericName && p.genericName.toLowerCase().includes(qLower)) ||
          (p.genericNameBn && p.genericNameBn.includes(searchQuery.trim())) ||
          (p.sku && p.sku.toLowerCase().includes(qLower)) ||
          (p.barcode && p.barcode.includes(qLower)) ||
          (p.storeName && p.storeName.toLowerCase().includes(qLower)) ||
          (p.seller?.name && p.seller.name.toLowerCase().includes(qLower))
        )
        .slice(0, 6)
    : [];

  const storeSuggestions = qLower && stores.length > 0
    ? stores
        .filter((s) =>
          s.name.toLowerCase().includes(qLower) ||
          (s.nameBn && s.nameBn.includes(searchQuery.trim())) ||
          s.category.toLowerCase().includes(qLower) ||
          (s.categoryBn && s.categoryBn.includes(searchQuery.trim()))
        )
        .slice(0, 2)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (storeMenuRef.current && !storeMenuRef.current.contains(e.target as Node)) {
        setIsStoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-xs border-b border-gray-100 dark:border-gray-800 transition-colors pt-[env(safe-area-inset-top,0px)]">
      {/* Top micro bar (Real Daraz BD Style) */}
      <div className="bg-[#f85606] dark:bg-[#c94302] text-white text-[10px] sm:text-xs py-1 px-[max(0.625rem,env(safe-area-inset-left,0px))] sm:px-6 transition-colors overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-max sm:min-w-0">
          {/* Left top links */}
          <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
            <button
              onClick={() => {
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-yellow-200 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span>{language === 'bn' ? 'স্মার্টমল' : 'SmartMall'}</span>
            </button>

            <button
              onClick={onOpenSeller}
              className="hidden sm:flex items-center gap-1 hover:text-yellow-200 font-medium transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সেলার হিসেবে বিক্রি করুন' : 'Sell on SmartShopX.bd'}</span>
            </button>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black text-[10px] hover:bg-yellow-300 transition cursor-pointer shadow-xs"
              >
                <span>👑 {language === 'bn' ? 'অ্যাডমিন হাব' : 'Admin Hub'}</span>
              </button>
            )}

            {onOpenSmartHisab && (
              <button
                onClick={onOpenSmartHisab}
                className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-0.5 rounded-full font-black text-[10px] transition cursor-pointer shadow-xs border border-emerald-400/40"
              >
                <span>📒 {language === 'bn' ? 'স্মার্ট হিসাব খাতা' : 'Smart Hisab'}</span>
              </button>
            )}

            <button
              onClick={onOpenHelp}
              className="hidden md:flex items-center gap-1 hover:text-yellow-200 font-medium transition cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কাস্টমার কেয়ার' : 'Customer Care'}</span>
            </button>

            {/* Profile & Customer Account Link */}
            {session?.isAuthenticated ? (
              <button
                onClick={() => {
                  if (onOpenAccount) onOpenAccount('info');
                  else if (onOpenProfile) onOpenProfile();
                }}
                className="hidden lg:flex items-center gap-1.5 hover:text-yellow-200 font-bold transition cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-yellow-300 text-black flex items-center justify-center text-[10px] font-black">
                  {session.displayName?.charAt(0) || session.fullName?.charAt(0) || 'U'}
                </div>
                <span>{session.displayName || session.fullName}</span>
                <span className="bg-yellow-400/20 text-yellow-200 text-[9px] px-1 rounded-full uppercase">
                  {session.membershipLevel || 'VIP'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('login');
                  else if (onOpenProfile) onOpenProfile();
                }}
                className="hidden lg:flex items-center gap-1 hover:text-yellow-200 font-bold transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-yellow-300" />
                <span>{language === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Register'}</span>
              </button>
            )}

            {/* Lucky Spin Wheel Trigger */}
            {onOpenSpin && (
              <button
                onClick={onOpenSpin}
                className="hidden lg:flex items-center gap-1 text-yellow-300 hover:text-white font-extrabold transition animate-pulse cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '🎁 লাকি স্পিন' : '🎁 Spin & Win'}</span>
              </button>
            )}
          </div>

          {/* Right top utilities */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Vouchers & Coins */}
            <button
              onClick={onOpenVouchers}
              className="flex items-center gap-1 hover:text-yellow-200 font-semibold transition cursor-pointer"
            >
              <Tag className="w-3 h-3 text-yellow-300 shrink-0" />
              <span>{language === 'bn' ? 'ভাউচার' : 'Vouchers'}</span>
            </button>

            {/* Daily Coins Badge */}
            <button
              onClick={onOpenVouchers}
              className="flex items-center gap-1 text-yellow-300 hover:text-white font-bold transition cursor-pointer"
            >
              <Coins className="w-3 h-3 text-yellow-300 shrink-0" />
              <span>{coins} {language === 'bn' ? 'কয়েন' : 'Coins'}</span>
            </button>

            {/* Track Orders */}
            <button
              onClick={onOpenOrders}
              className="hover:text-yellow-200 font-semibold transition hidden sm:inline cursor-pointer"
            >
              {language === 'bn' ? 'ট্র্যাক অর্ডার' : 'Track Order'}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 hover:text-yellow-200 font-semibold bg-white/15 px-2 py-0.5 rounded transition cursor-pointer text-[10px] sm:text-xs"
            >
              <Globe className="w-3 h-3" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Global Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-1 bg-black/25 hover:bg-black/40 text-yellow-300 hover:text-yellow-200 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition shadow-xs cursor-pointer border border-white/20"
                title={theme === 'dark' ? (language === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to Light Mode') : (language === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to Dark Mode')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3 h-3 text-yellow-300 animate-spin-slow" />
                    <span className="hidden xs:inline">{language === 'bn' ? 'লাইট' : 'Light'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 text-yellow-200" />
                    <span className="hidden xs:inline">{language === 'bn' ? 'ডার্ক' : 'Dark'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar Container */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-3.5">
        {/* Single Seamless High-Density Mobile Row (< sm) */}
        <div className="flex sm:hidden items-center justify-between gap-1.5 w-full">
          {/* Mobile Navigation Drawer Trigger */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="p-1.5 text-gray-700 dark:text-gray-200 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer shrink-0"
              title={language === 'bn' ? 'মেনু ও সেটিংস' : 'Menu & Settings'}
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Brand Logo (Ultra-Compact) */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-1 shrink-0 cursor-pointer pr-0.5"
            aria-label="SmartShopX Home"
          >
            <Logo size="sm" showText={false} className="shrink-0" />
            <span className="hidden min-[370px]:inline-block font-black text-xs tracking-tight text-[#0a3871] dark:text-gray-100">
              SmartShop<span className="text-[#f85606]">X</span><span className="text-[#00a8ff] text-[10px]">.bd</span>
            </span>
          </button>

          {/* Consolidated High-Density Mobile Search Bar */}
          <div ref={searchContainerRef} className="flex-1 min-w-0 relative">
            <div className="flex items-center bg-[#f5f5f5] dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-[#f85606] dark:focus-within:border-[#f85606] focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all overflow-hidden h-8 px-2 gap-1">
              <Search className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder={
                  language === 'bn'
                    ? 'পণ্য খুঁজুন...'
                    : 'Search products...'
                }
                className="flex-1 text-base sm:text-xs bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-medium min-w-0 py-0.5"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xs cursor-pointer shrink-0"
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Clear search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Mobile Voice Search Mic */}
              <button
                type="button"
                onClick={() => setIsVoiceSearchOpen(true)}
                className="p-1 text-gray-600 hover:text-[#f85606] dark:text-gray-300 dark:hover:text-orange-400 transition cursor-pointer flex items-center justify-center shrink-0"
                title={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
              >
                <Mic className="w-3.5 h-3.5 text-[#ea580c] dark:text-orange-400" />
              </button>
            </div>

            {/* Mobile Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-[-60px] sm:right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in duration-150">
                {/* Popular Tags */}
                <div className="p-2.5 bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    <Flame className="w-3 h-3 text-[#ea580c] dark:text-orange-400" />
                    <span>{language === 'bn' ? 'জনপ্রিয় সার্চ:' : 'Popular Searches:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {popularKeywords.map((item) => (
                      <button
                        key={item.term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item.term);
                          setIsSearchFocused(false);
                        }}
                        className="text-[11px] bg-white dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#ea580c] dark:hover:text-orange-400 hover:border-[#ea580c] text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-lg border border-gray-300 dark:border-gray-700 transition font-medium cursor-pointer"
                      >
                        {language === 'bn' ? item.label : item.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matching Stores Preview (Section 8) */}
                {storeSuggestions.length > 0 && (
                  <div className="p-2 bg-orange-50/70 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-2 py-0.5 text-[9px] font-extrabold uppercase text-orange-800 dark:text-orange-300 flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>{language === 'bn' ? 'ভেরিফাইড দোকান' : 'Verified Stores'}</span>
                    </div>
                    {storeSuggestions.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => {
                          if (onSelectStore) onSelectStore(st);
                          setIsSearchFocused(false);
                        }}
                        className="p-1.5 hover:bg-orange-100/60 dark:hover:bg-gray-800 rounded-xl flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={st.logo} alt={st.name} className="w-6 h-6 rounded-lg object-cover bg-white shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate block">
                              {language === 'bn' && st.nameBn ? st.nameBn : st.name}
                            </span>
                            <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate block">
                              {language === 'bn' && st.categoryBn ? st.categoryBn : st.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#ea580c] dark:text-orange-400 font-bold shrink-0">
                          {language === 'bn' ? 'দেখুন →' : 'View →'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Matching Products Preview */}
                {searchSuggestions.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
                    <div className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-[9px] font-extrabold uppercase text-gray-600 dark:text-gray-400">
                      {language === 'bn' ? 'পণ্য ফলাফল' : 'Product Matches'}
                    </div>
                    {searchSuggestions.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(prod);
                          setIsSearchFocused(false);
                        }}
                        className="p-2 hover:bg-orange-50/70 dark:hover:bg-gray-700/60 flex items-center gap-2.5 cursor-pointer transition"
                      >
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-8 h-8 rounded-md object-cover bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 truncate">
                            {language === 'bn' ? prod.titleBn : prod.title}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                            <span className="font-black text-[#ea580c] dark:text-orange-400">৳{prod.price}</span>
                            <span className="text-gray-500 dark:text-gray-400 line-through text-[9px]">৳{prod.originalPrice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? `"${searchQuery}" পাওয়া যায়নি` : `No matches for "${searchQuery}"`}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Consolidated High-Density Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Compare (if active) */}
            {onOpenCompare && compareCount > 0 && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg relative transition cursor-pointer"
                title={language === 'bn' ? 'তুলনা' : 'Compare'}
              >
                <Scale className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-[#0a3871] text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {compareCount}
                </span>
              </button>
            )}

            {/* Notifications */}
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg relative transition cursor-pointer"
                title={language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f85606] text-white text-[8px] font-black min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center justify-center bg-[#f85606] hover:bg-[#d84a05] text-white h-8 px-2 rounded-lg font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer relative"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Quick Navigation Menu Bar (< sm) */}
        <div className="sm:hidden -mx-2.5 px-2.5 pt-2 pb-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-[11px] font-bold border-t border-gray-100 dark:border-gray-800 mt-1.5">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('category-section') || document.querySelector('main');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500 text-white shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Grid className="w-3 h-3" />
            <span>{language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('flash-sale-section')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Flame className="w-3 h-3 fill-current animate-pulse" />
            <span>{language === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('smartmall-section')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{language === 'bn' ? 'স্মার্টমল' : 'SmartMall'}</span>
          </button>

          {stores.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (onSelectStore) onSelectStore(stores[0]);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <Store className="w-3 h-3" />
              <span>{language === 'bn' ? 'দোকানসমূহ' : 'Stores'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenVouchers}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Tag className="w-3 h-3" />
            <span>{language === 'bn' ? 'ভাউচার' : 'Vouchers'}</span>
          </button>

          {onOpenSpin && (
            <button
              type="button"
              onClick={onOpenSpin}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <Gift className="w-3 h-3 animate-bounce" />
              <span>{language === 'bn' ? 'স্পিন' : 'Spin'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSeller}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-[#f85606] border border-orange-200 dark:border-orange-800 shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Store className="w-3 h-3" />
            <span>{language === 'bn' ? 'সেলার' : 'Seller'}</span>
          </button>
        </div>

        {/* Desktop Header Row (hidden on mobile, shown on sm and above) */}
        <div className="hidden sm:flex items-center justify-between gap-6">
          {/* Brand Logo (Desktop) */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group text-left cursor-pointer"
            >
              <Logo size="md" />
            </button>
          </div>

          {/* Search Bar with Live Suggestions Dropdown (Desktop) */}
          <div className="flex-1 max-w-2xl relative w-full">
            <div className="flex items-center bg-[#f5f5f5] dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-[#f85606] dark:focus-within:border-[#f85606] focus-within:bg-white dark:focus-within:bg-gray-850 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all overflow-hidden">
              {/* Category selection on desktop */}
              <div className="hidden md:flex items-center border-r border-gray-200 dark:border-gray-700 pl-3 pr-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer pr-1 text-gray-700 dark:text-gray-200 font-medium dark:bg-gray-800"
                >
                  <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'bn' ? cat.nameBn : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder={
                  language === 'bn'
                    ? 'SmartShopX.bd-এ খুঁজুন (যেমন: ইয়ারবাড, পাঞ্জাবি, মধু...)'
                    : 'Search in SmartShopX.bd (e.g. Earbuds, Panjabi...)'
                }
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium min-w-0"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-0.5 text-xs cursor-pointer shrink-0"
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Clear search'}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={() => setIsVoiceSearchOpen(true)}
                className="p-1.5 text-gray-500 hover:text-[#f85606] dark:text-gray-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700/60 rounded-lg mx-1 transition cursor-pointer flex items-center justify-center shrink-0 relative group"
                title={language === 'bn' ? 'ভয়েস সার্চ (বাংলা/English)' : 'Voice Search (Bangla/English)'}
              >
                <Mic className="w-4 h-4 text-[#f85606] group-hover:scale-110 transition-transform" />
                <span className="sr-only">Voice Search</span>
              </button>

              <button
                type="button"
                className="bg-[#f85606] hover:bg-[#e04d05] text-white px-4 py-2.5 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in duration-150">
                {/* Popular Tags */}
                <div className="p-3 bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <Flame className="w-3.5 h-3.5 text-[#ea580c] dark:text-orange-400" />
                    <span>{language === 'bn' ? 'জনপ্রিয় সার্চসমূহ:' : 'Popular Searches:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularKeywords.map((item) => (
                      <button
                        key={item.term}
                        onClick={() => {
                          setSearchQuery(item.term);
                          setIsSearchFocused(false);
                        }}
                        className="text-xs bg-white dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#ea580c] dark:hover:text-orange-400 hover:border-[#ea580c] text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-700 transition font-medium cursor-pointer"
                      >
                        {language === 'bn' ? item.label : item.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matching Stores Preview (Section 8: Store Discovery) */}
                {storeSuggestions.length > 0 && (
                  <div className="p-2.5 bg-orange-50/70 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-2 py-0.5 text-[10px] font-extrabold uppercase text-orange-800 dark:text-orange-300 flex items-center gap-1.5 mb-1">
                      <Store className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ভেরিফাইড স্মার্ট বিজনেস দোকান' : 'Verified Smart Business Stores'}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {storeSuggestions.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => {
                            if (onSelectStore) onSelectStore(st);
                            setIsSearchFocused(false);
                          }}
                          className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-orange-200 dark:border-gray-700 flex items-center justify-between cursor-pointer transition shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={st.logo} alt={st.name} className="w-8 h-8 rounded-lg object-cover bg-white shrink-0 border border-gray-200 dark:border-gray-700" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate block">
                                {language === 'bn' && st.nameBn ? st.nameBn : st.name}
                              </span>
                              <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate block">
                                {language === 'bn' && st.categoryBn ? st.categoryBn : st.category} • ⭐ {st.rating}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#ea580c] dark:text-orange-400 font-bold shrink-0 ml-1">
                            {language === 'bn' ? 'দোকান দেখুন →' : 'Store →'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Products Preview */}
                {searchSuggestions.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-72 overflow-y-auto">
                    <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-[10px] font-extrabold uppercase text-gray-600 dark:text-gray-400">
                      {language === 'bn' ? 'সরাসরি পণ্য ফলাফল' : 'Direct Product Matches'}
                    </div>
                    {searchSuggestions.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(prod);
                          setIsSearchFocused(false);
                        }}
                        className="p-2.5 hover:bg-orange-50/70 dark:hover:bg-gray-700/60 flex items-center gap-3 cursor-pointer transition"
                      >
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                            {language === 'bn' ? prod.titleBn : prod.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] mt-0.5">
                            <span className="font-black text-[#ea580c] dark:text-orange-400">৳{prod.price}</span>
                            <span className="text-gray-500 dark:text-gray-400 line-through text-[10px]">৳{prod.originalPrice}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                              {prod.rating} ★
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-xs text-gray-600 dark:text-gray-300">
                    {language === 'bn' ? `"${searchQuery}" এর জন্য কোনো পণ্য মেলেনি` : `No direct matches for "${searchQuery}"`}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Desktop Action icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* User Profile & Account Management Button */}
            {session?.isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAccount) onOpenAccount('info');
                  else if (onOpenProfile) onOpenProfile();
                }}
                className="p-1.5 sm:p-2 text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-xl relative transition cursor-pointer group flex items-center gap-2"
                title={language === 'bn' ? 'আমার অ্যাকাউন্ট ও সেটিংস' : 'My Account & Settings'}
                aria-label="User Account"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f85606] to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-2xs group-hover:scale-105 transition-transform border border-white dark:border-gray-700">
                  {session.displayName?.charAt(0) || session.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#f85606] truncate max-w-[100px]">
                    {session.displayName || session.fullName}
                  </span>
                  <span className="text-[10px] text-[#f85606] font-semibold">
                    {session.membershipLevel || 'Gold'} VIP
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('login');
                  else if (onOpenProfile) onOpenProfile();
                }}
                className="px-3 py-1.5 bg-orange-50 dark:bg-gray-800 text-[#f85606] dark:text-orange-400 hover:bg-[#f85606] hover:text-white border border-orange-200 dark:border-gray-700 rounded-xl text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Register'}</span>
              </button>
            )}

            {/* Dedicated Theme Switcher Icon */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-amber-400 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-xl relative transition cursor-pointer group"
                title={
                  theme === 'dark'
                    ? language === 'bn'
                      ? 'লাইট মোড চালু করুন (বর্তমান: ডার্ক)'
                      : 'Switch to Light Mode (Current: Dark)'
                    : language === 'bn'
                    ? 'ডার্ক মোড চালু করুন (বর্তমান: লাইট)'
                    : 'Switch to Dark Mode (Current: Light)'
                }
                aria-label={
                  theme === 'dark'
                    ? language === 'bn'
                      ? 'লাইট মোড চালু করুন'
                      : 'Switch to light mode'
                    : language === 'bn'
                      ? 'ডার্ক মোড চালু করুন'
                      : 'Switch to dark mode'
                }
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400/20 transition-transform duration-300 group-hover:rotate-45" />
                ) : (
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 fill-gray-700/10 transition-transform duration-300 group-hover:-rotate-12" />
                )}
              </button>
            )}

            {/* Comparison Tool Button */}
            {onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-xl relative transition cursor-pointer"
                title={language === 'bn' ? 'পণ্য তুলনা' : 'Compare Products'}
              >
                <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0a3871] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {compareCount}
                  </span>
                )}
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-xl relative transition cursor-pointer"
              title={language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notification Bell Button */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-xl relative transition cursor-pointer"
                title={language === 'bn' ? 'অর্ডার নোটিফিকেশন' : 'Order Notifications'}
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f85606] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Orders Tracking Button */}
            <button
              onClick={onOpenOrders}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-xl relative transition cursor-pointer"
              title={language === 'bn' ? 'আমার অর্ডার' : 'My Orders'}
            >
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-[#f85606] hover:bg-[#d84a05] text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {language === 'bn' ? 'কার্ট' : 'Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Desktop Navigation Menu Bar (প্রধান মেনু বার) */}
      <nav className="border-t border-gray-100 dark:border-gray-800 bg-[#fafafa] dark:bg-gray-850/95 hidden sm:block transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-200">
          {/* Left Menu Items */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* All Categories Mega Dropdown Trigger */}
            <div ref={categoryMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryMenuOpen((prev) => !prev);
                  setIsStoreMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition cursor-pointer ${
                  isCategoryMenuOpen || selectedCategory !== 'all'
                    ? 'bg-[#f85606] text-white shadow-xs'
                    : 'bg-orange-50/80 dark:bg-gray-800 text-[#f85606] dark:text-orange-400 hover:bg-[#f85606] hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>
                  {selectedCategory === 'all'
                    ? language === 'bn'
                      ? 'সকল ক্যাটাগরি'
                      : 'All Categories'
                    : categories.find((c) => c.id === selectedCategory)?.[
                        language === 'bn' ? 'nameBn' : 'name'
                      ] || (language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories')}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isCategoryMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Mega Dropdown Panel */}
              {isCategoryMenuOpen && (
                <div className="absolute top-full left-0 w-72 bg-white dark:bg-gray-850 rounded-b-2xl rounded-tr-2xl shadow-2xl border border-gray-200 dark:border-gray-750 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
                    {language === 'bn' ? 'পণ্য বিভাগসমূহ' : 'Product Categories'}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-[#f85606] font-extrabold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-gray-800 flex items-center justify-center text-[#f85606]">
                        <Grid className="w-4 h-4" />
                      </div>
                      <span>{language === 'bn' ? 'সব পণ্য (All)' : 'All Products'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsCategoryMenuOpen(false);
                          const el =
                            document.getElementById('category-section') ||
                            document.querySelector('main');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-orange-50 dark:bg-orange-950/40 text-[#f85606] font-extrabold'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {getCategoryIcon(cat.iconName)}
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">
                              {language === 'bn' ? cat.nameBn : cat.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-normal">
                              {allProducts.filter((p) => p.category === cat.id).length ||
                                cat.subcategories?.length ||
                                0}{' '}
                              {language === 'bn' ? 'টি পণ্য' : 'items'}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Flash Sale Link with Pulse Badge */}
            <button
              type="button"
              onClick={() => scrollToSection('flash-sale-section')}
              className="flex items-center gap-1.5 px-3 py-2.5 hover:text-[#f85606] dark:hover:text-orange-400 transition cursor-pointer group"
            >
              <Flame className="w-4 h-4 text-[#f85606] group-hover:scale-110 transition-transform" />
              <span>{language === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}</span>
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase animate-pulse">
                HOT
              </span>
            </button>

            {/* SmartMall Official Brands Link */}
            <button
              type="button"
              onClick={() => scrollToSection('smartmall-section')}
              className="flex items-center gap-1.5 px-3 py-2.5 hover:text-[#f85606] dark:hover:text-orange-400 transition cursor-pointer group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>{language === 'bn' ? 'স্মার্টমল' : 'SmartMall'}</span>
            </button>

            {/* Brand Stores Dropdown */}
            {stores.length > 0 && (
              <div ref={storeMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStoreMenuOpen((prev) => !prev);
                    setIsCategoryMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 hover:text-[#f85606] dark:hover:text-orange-400 transition cursor-pointer"
                >
                  <Store className="w-4 h-4 text-blue-500" />
                  <span>{language === 'bn' ? 'দোকানসমূহ' : 'Stores'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      isStoreMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isStoreMenuOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white dark:bg-gray-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-750 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
                      {language === 'bn' ? 'ভেরিফাইড ব্র্যান্ড শোরুম' : 'Verified Brand Stores'}
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {stores.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            if (onSelectStore) onSelectStore(st);
                            setIsStoreMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-xl transition text-left cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={st.logo}
                              alt={st.name}
                              className="w-7 h-7 rounded-lg object-cover bg-white shrink-0 border border-gray-200"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#f85606]">
                                {language === 'bn' && st.nameBn ? st.nameBn : st.name}
                              </div>
                              <div className="text-[10px] text-gray-400 truncate">
                                ⭐ {st.rating} • {st.responseRate}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vouchers Center */}
            <button
              type="button"
              onClick={onOpenVouchers}
              className="flex items-center gap-1.5 px-3 py-2.5 hover:text-[#f85606] dark:hover:text-orange-400 transition cursor-pointer"
            >
              <Tag className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'ভাউচার ও অফার' : 'Vouchers'}</span>
            </button>

            {/* Lucky Spin Wheel */}
            {onOpenSpin && (
              <button
                type="button"
                onClick={onOpenSpin}
                className="flex items-center gap-1.5 px-3 py-2.5 hover:text-[#f85606] dark:hover:text-orange-400 transition cursor-pointer group"
              >
                <Gift className="w-4 h-4 text-purple-500 group-hover:rotate-12 transition-transform" />
                <span>{language === 'bn' ? 'লাকি স্পিন' : 'Daily Spin'}</span>
              </button>
            )}

            {/* Track Orders */}
            <button
              type="button"
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 px-3 py-2.5 hover:text-[#f85606] dark:hover:text-orange-400 transition cursor-pointer"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>
          </div>

          {/* Right Action Menu Links */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sell on SmartShopX */}
            <button
              type="button"
              onClick={onOpenSeller}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100/70 dark:bg-gray-800 text-[#f85606] dark:text-orange-400 hover:bg-[#f85606] hover:text-white transition cursor-pointer text-xs font-bold"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'দোকানদার হিসেবে যুক্ত হোন' : 'Become a Seller'}</span>
            </button>

            {/* Customer Care */}
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-600 dark:text-gray-300 hover:text-[#f85606] dark:hover:text-orange-400 transition cursor-pointer text-xs"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'bn' ? 'হেল্পলাইন' : 'Help'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Voice Search Modal (Bengali & English) */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearch={(transcript) => {
          setSearchQuery(transcript);
          setIsSearchFocused(true);
        }}
        currentLanguage={language}
      />
    </header>
  );
};
