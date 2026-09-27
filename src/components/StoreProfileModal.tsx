import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Star,
  MapPin,
  Clock,
  Truck,
  Phone,
  Mail,
  ShieldCheck,
  Tag,
  Package,
  Search,
  ShoppingCart,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Share2,
  ExternalLink,
  ChevronRight,
  Send,
  ArrowLeft,
  Heart,
  MessageCircle,
  Check,
  ArrowUpDown,
  Filter,
  Zap,
  Copy
} from 'lucide-react';
import { Product, Store as StoreType, StoreReview } from '../types';
import { StorageService } from '../services/storageService';

interface StoreProfileModalProps {
  store: StoreType | null;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  language: 'bn' | 'en';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickBuy?: (product: Product) => void;
  onCollectVoucher?: (code: string) => void;
}

export const StoreProfileModal: React.FC<StoreProfileModalProps> = ({
  store,
  isOpen,
  onClose,
  products,
  language,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  onCollectVoucher
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');
  const [isCopied, setIsCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Review states
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Initialize follow state and count from localStorage
  useEffect(() => {
    if (!store) return;
    const followKey = `smartshopx_follow_${store.id}`;
    const savedFollow = localStorage.getItem(followKey) === 'true';
    setIsFollowing(savedFollow);

    // Initial simulated followers
    const baseFollowers = (store.reviewCount || 100) * 3 + (savedFollow ? 1 : 0);
    setFollowersCount(baseFollowers);
  }, [store?.id]);

  if (!isOpen || !store) return null;

  // Filter products belonging exclusively to this store
  const storeProducts = products.filter(
    (p) =>
      (p.storeId === store.id ||
        p.seller?.storeId === store.id ||
        p.seller?.name?.toLowerCase() === store.name?.toLowerCase()) &&
      p.isPublished !== false
  );

  // Extract unique subcategories/categories from store's own products
  const storeCategories = Array.from(
    new Set(storeProducts.map((p) => (language === 'bn' ? p.categoryBn : p.category)))
  ).filter(Boolean);

  // Filter by search & category
  let filteredStoreProducts = storeProducts.filter((p) => {
    const matchesSearch = searchFilter.trim()
      ? p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.titleBn.includes(searchFilter) ||
        p.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (p.genericName && p.genericName.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (p.genericNameBn && p.genericNameBn.includes(searchFilter)) ||
        (p.sku && p.sku.toLowerCase().includes(searchFilter.toLowerCase()))
      : true;

    const currentCat = language === 'bn' ? p.categoryBn : p.category;
    const matchesCat = selectedSubCategory === 'all' || currentCat === selectedSubCategory;

    return matchesSearch && matchesCat;
  });

  // Sort store products
  filteredStoreProducts.sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.soldCount - a.soldCount;
  });

  const storeReviews: StoreReview[] = StorageService.getStoreReviews(store.id);

  // Copy Store Link to clipboard
  const handleCopyLink = () => {
    const storeUrl = `${window.location.origin}${window.location.pathname}?store=${store.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(storeUrl).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      });
    } else {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Toggle Follow
  const handleToggleFollow = () => {
    const nextFollow = !isFollowing;
    setIsFollowing(nextFollow);
    setFollowersCount((prev) => (nextFollow ? prev + 1 : Math.max(0, prev - 1)));
    localStorage.setItem(`smartshopx_follow_${store.id}`, String(nextFollow));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: StoreReview = {
      id: `sr-${Date.now()}`,
      storeId: store.id,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: language === 'bn' ? 'মাত্র এইমাত্র' : 'Just now',
      comment: newReviewComment.trim(),
      commentBn: newReviewComment.trim()
    };

    StorageService.addStoreReview(newRev);
    setIsReviewSubmitted(true);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setTimeout(() => setIsReviewSubmitted(false), 3000);
  };

  const cleanPhone = store.contactPhone ? store.contactPhone.replace(/[^0-9+]/g, '') : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-0 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[94dvh] rounded-none sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border-0 sm:border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating App Bar */}
        <div className="bg-[#0b1a30] text-white px-3 sm:px-5 py-2.5 flex items-center justify-between border-b border-white/10 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition cursor-pointer min-h-[36px]"
              title={language === 'bn' ? 'মূল মার্কেটপ্লেসে ফিরে যান' : 'Back to Marketplace'}
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>{language === 'bn' ? 'মূল শপে ফিরুন' : 'Back to Mall'}</span>
            </button>
            <span className="hidden md:inline text-xs text-gray-400">|</span>
            <span className="hidden md:inline text-xs font-medium text-gray-300 truncate max-w-xs">
              {language === 'bn' ? 'অফিসিয়াল স্টোর ল্যান্ডিং পেজ' : 'Official Store Landing Page'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share / Copy URL button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer min-h-[36px] ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white'
              }`}
              title={language === 'bn' ? 'দোকানের লিংক কপি করুন' : 'Copy Store Link'}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{language === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{language === 'bn' ? 'শেয়ার লিঙ্ক' : 'Share Store'}</span>
                </>
              )}
            </button>

            {/* Follow Store button */}
            <button
              type="button"
              onClick={handleToggleFollow}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer min-h-[36px] ${
                isFollowing
                  ? 'bg-rose-600 text-white'
                  : 'bg-[#f85606] hover:bg-[#d84a05] text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-current' : ''}`} />
              <span>
                {isFollowing
                  ? language === 'bn'
                    ? 'ফলো করা হচ্ছে'
                    : 'Following'
                  : language === 'bn'
                  ? 'ফলো করুন'
                  : 'Follow'}
              </span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close Store Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Store Landing Header Billboard Banner */}
        <div className="relative h-44 sm:h-56 bg-gradient-to-r from-orange-600 via-amber-600 to-[#0b1a30] overflow-hidden shrink-0">
          <img
            src={store.coverImage}
            alt={store.name}
            className="w-full h-full object-cover opacity-45 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Top Verification & Followers Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-600/90 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
              <span>Smart Business Verified</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
              👥 {followersCount.toLocaleString('en-US')}{' '}
              {language === 'bn' ? 'ফলোয়ার' : 'Followers'}
            </div>
          </div>

          {/* Store Info Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div className="flex items-end gap-3 min-w-0">
              {/* Store Logo with verified glow */}
              <div className="relative shrink-0">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-xl bg-white"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-black truncate tracking-tight text-white flex items-center gap-2">
                  <span>{language === 'bn' && store.nameBn ? store.nameBn : store.name}</span>
                </h1>
                <p className="text-xs text-orange-200 truncate font-medium">
                  {language === 'bn' && store.categoryBn ? store.categoryBn : store.category} •{' '}
                  {language === 'bn' && store.locationBn ? store.locationBn : store.location}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-300 mt-0.5">
                  <span>
                    {language === 'bn'
                      ? `যোগদান: ${store.joinedYear}`
                      : `Joined: ${store.joinedYear}`}
                  </span>
                  <span>•</span>
                  <span>
                    {storeProducts.length} {language === 'bn' ? 'টি পণ্য' : 'products'}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Rating & Quick Contacts */}
            <div className="flex items-center sm:items-end gap-2 shrink-0">
              {/* Contact actions */}
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                  title={language === 'bn' ? 'সরাসরি কল করুন' : 'Call Store'}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'bn' ? 'কল' : 'Call'}</span>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
                    language === 'bn'
                      ? `হ্যালো ${store.nameBn || store.name}, আমি SmartShopX এ আপনার দোকান দেখেছি।`
                      : `Hello ${store.name}, I found your store on SmartShopX.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                  title={language === 'bn' ? 'হোয়াটসঅ্যাপ চ্যাট' : 'WhatsApp'}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}

              {/* Rating Card */}
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                <div className="flex items-center gap-1 text-amber-400 font-black text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{store.rating.toFixed(1)}</span>
                </div>
                <div className="text-[10px] text-gray-300">
                  <div>({store.reviewCount})</div>
                  <div className="text-emerald-400 font-bold">{store.responseRate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Key Details & Offers Banner */}
        <div className="bg-orange-50/80 dark:bg-gray-850 border-b border-orange-100 dark:border-gray-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-gray-700 dark:text-gray-300">
            {store.openingHours && (
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-[#f85606]" />
                <span>
                  {language === 'bn' && store.openingHoursBn
                    ? store.openingHoursBn
                    : store.openingHours}
                </span>
              </span>
            )}
            {store.deliveryInfo && (
              <span className="flex items-center gap-1 text-[11px]">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === 'bn' && store.deliveryInfoBn
                    ? store.deliveryInfoBn
                    : store.deliveryInfo}
                </span>
              </span>
            )}
          </div>

          {/* Active Store Offers & Coupons */}
          {store.offers && store.offers.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {store.offers.map((offer, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-2xs"
                >
                  <Tag className="w-3 h-3" />
                  <span>{offer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-3 sm:px-5 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'products'
                  ? 'border-[#f85606] text-[#f85606] dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'সকল পণ্য' : 'Products'} ({storeProducts.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#f85606] text-[#f85606] dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'দোকানের রিভিউ' : 'Store Reviews'} ({storeReviews.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'about'
                  ? 'border-[#f85606] text-[#f85606] dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{language === 'bn' ? 'দোকান পরিচিতি' : 'About Store'}</span>
            </button>
          </div>

          {/* Desktop Search inside store */}
          {activeTab === 'products' && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-2.5 py-1 text-xs border border-gray-200 dark:border-gray-700 w-48 focus-within:w-60 transition-all">
                <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={language === 'bn' ? 'এই দোকানে খুঁজুন...' : 'Search in store...'}
                  className="bg-transparent outline-none w-full text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1 text-xs text-gray-700 dark:text-gray-300 font-semibold outline-none cursor-pointer"
              >
                <option value="popular">
                  {language === 'bn' ? 'জনপ্রিয়তা' : 'Popularity'}
                </option>
                <option value="price_low">
                  {language === 'bn' ? 'কম দাম' : 'Price: Low'}
                </option>
                <option value="price_high">
                  {language === 'bn' ? 'বেশি দাম' : 'Price: High'}
                </option>
                <option value="rating">
                  {language === 'bn' ? 'সেরা রেটিং' : 'Rating'}
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 pb-20 sm:pb-6 space-y-4">
          {/* TAB 1: ALL PUBLISHED PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Mobile Search & Sort */}
              <div className="sm:hidden flex flex-col gap-2">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 w-full">
                  <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder={
                      language === 'bn' ? 'এই দোকানে পণ্য খুঁজুন...' : 'Search in this store...'
                    }
                    className="bg-transparent outline-none w-full text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="text-gray-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    {filteredStoreProducts.length} {language === 'bn' ? 'টি পণ্য' : 'products'}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1 text-xs text-gray-700 dark:text-gray-300 font-semibold outline-none cursor-pointer"
                  >
                    <option value="popular">
                      {language === 'bn' ? 'জনপ্রিয়তা' : 'Popularity'}
                    </option>
                    <option value="price_low">
                      {language === 'bn' ? 'কম দাম' : 'Price: Low'}
                    </option>
                    <option value="price_high">
                      {language === 'bn' ? 'বেশি দাম' : 'Price: High'}
                    </option>
                    <option value="rating">
                      {language === 'bn' ? 'সেরা রেটিং' : 'Rating'}
                    </option>
                  </select>
                </div>
              </div>

              {/* In-Store Category Pills */}
              {storeCategories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedSubCategory('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedSubCategory === 'all'
                        ? 'bg-[#f85606] text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}
                  </button>
                  {storeCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        selectedSubCategory === cat
                          ? 'bg-[#f85606] text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Product Grid */}
              {filteredStoreProducts.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <Store className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="font-bold text-sm">
                    {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'bn'
                      ? 'সার্চ বা ক্যাটাগরি ফিল্টার পরিবর্তন করে দেখুন।'
                      : 'Try a different search term or category.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                  {filteredStoreProducts.map((prod) => {
                    const title = language === 'bn' && prod.titleBn ? prod.titleBn : prod.title;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onClose();
                          onSelectProduct(prod);
                        }}
                        className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-750 p-2.5 flex flex-col justify-between hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500/50 transition cursor-pointer group"
                      >
                        <div>
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
                            <img
                              src={prod.image}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {prod.discountPercent > 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-[#f85606] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                -{prod.discountPercent}%
                              </span>
                            )}
                            {prod.isDarazMall && (
                              <span className="absolute top-1.5 right-1.5 bg-[#0b1a30] text-yellow-400 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Mall</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-[#f85606] transition-colors">
                            {title}
                          </h4>
                          {prod.genericName && (
                            <span className="inline-block text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {language === 'bn' && prod.genericNameBn
                                ? prod.genericNameBn
                                : prod.genericName}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{prod.rating}</span>
                            <span className="text-gray-400 font-normal">({prod.reviewCount})</span>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-baseline gap-1.5 mb-1.5">
                            <span className="font-black text-sm text-[#f85606]">৳{prod.price}</span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ৳{prod.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="grid grid-cols-2 gap-1">
                            {onQuickBuy && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClose();
                                  onQuickBuy(prod);
                                }}
                                className="bg-gradient-to-r from-[#f85606] to-[#ff5500] hover:from-[#e04d05] text-white text-[10px] font-extrabold py-1 rounded-lg flex items-center justify-center gap-0.5 shadow-2xs transition active:scale-95 cursor-pointer min-h-[30px]"
                              >
                                <Zap className="w-3 h-3 fill-current text-yellow-300" />
                                <span>{language === 'bn' ? 'কিনুন' : 'Buy'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(prod, 1);
                              }}
                              className={`bg-orange-50 dark:bg-gray-750 text-[#f85606] hover:bg-[#f85606] hover:text-white transition flex items-center justify-center gap-0.5 text-[10px] font-bold rounded-lg cursor-pointer shadow-2xs min-h-[30px] ${
                                onQuickBuy ? '' : 'col-span-2'
                              }`}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>{language === 'bn' ? 'কার্ট' : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORE REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {/* Store Overall Rating Card */}
              <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center sm:text-left">
                    <div className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start gap-1">
                      <span>{store.rating.toFixed(1)}</span>
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {language === 'bn'
                        ? `মোট ${store.reviewCount} টি গ্রাহক মূল্যায়ন`
                        : `Based on ${store.reviewCount} verified reviews`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>
                    {language === 'bn'
                      ? 'স্মার্ট বিজনেস অডিট দ্বারা পরীক্ষিত'
                      : 'Verified by Smart Business audit'}
                  </span>
                </div>
              </div>

              {/* Review Submission Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="bg-orange-50/50 dark:bg-gray-800/80 p-4 rounded-2xl border border-orange-200 dark:border-gray-700 space-y-3"
              >
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#f85606]" />
                  <span>
                    {language === 'bn'
                      ? 'এই দোকানের জন্য আপনার মূল্যায়ন দিন'
                      : 'Rate this store experience'}
                  </span>
                </h4>

                {isReviewSubmitted && (
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'bn'
                        ? 'ধন্যবাদ! আপনার রিভিউ প্রকাশিত হয়েছে।'
                        : 'Thank you! Your store review has been posted.'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-[#f85606]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'রেটিং (১-৫)' : 'Rating (1-5)'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReviewRating(s)}
                          className="p-1 cursor-pointer transition transform active:scale-125"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= newReviewRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    {language === 'bn' ? 'আপনার অভিজ্ঞতা লিখুন' : 'Your Review Comment'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'পণ্যের মান, ডেলিভারি ও সেলারের রেসপন্স কেমন ছিল লিখুন...'
                        : 'Write about delivery time, packaging, and store support...'
                    }
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-[#f85606]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#f85606] hover:bg-[#d84a05] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-2.5">
                {storeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-black text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {rev.author}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {language === 'bn' && rev.commentBn ? rev.commentBn : rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT STORE & POLICIES */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#f85606]" />
                  <span>{language === 'bn' ? 'দোকানের বর্ণনা' : 'About This Store'}</span>
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {language === 'bn' && store.descriptionBn
                    ? store.descriptionBn
                    : store.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-black">
                    {language === 'bn' ? 'দোকান কোড (Store ID)' : 'Store ID'}
                  </span>
                  <p className="font-bold font-mono text-sm text-[#f85606]">{store.id}</p>
                </div>

                <div className="p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-black">
                    {language === 'bn' ? 'মালিকানা কোড (Owner ID)' : 'Owner ID'}
                  </span>
                  <p className="font-bold font-mono text-sm text-blue-600 dark:text-blue-400">
                    {store.ownerId}
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-black">
                    {language === 'bn' ? 'যোগাযোগের ফোন' : 'Contact Phone'}
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {store.contactPhone || 'N/A'}
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-black">
                    {language === 'bn' ? 'ইমেইল' : 'Contact Email'}
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 truncate">
                    {store.contactEmail || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs">
                    {language === 'bn'
                      ? 'স্মার্ট হিসাব — সেন্ট্রাল ব্যাকএন্ড গ্যারান্টি'
                      : 'Smart Hisab — Central Ecosystem Guarantee'}
                  </h5>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 mt-0.5">
                    {language === 'bn'
                      ? 'এই দোকানের সকল পণ্য সরাসরি সেন্ট্রাল ইনভেন্টরির সাথে সংযুক্ত। আপনার যেকোনো অর্ডার সুরক্ষিত ও যাচাইকৃত।'
                      : 'All products from this store synchronize directly with verified central inventory and genuine business licenses.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
