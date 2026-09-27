import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/mockProducts';
import { ProductImageZoom } from './ProductImageZoom';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  MapPin,
  CheckCircle,
  Plus,
  Minus,
  Zap,
  MessageSquare,
  Award,
  Clock,
  WifiOff,
  Ruler,
  Share2,
  Check,
  Camera,
  ThumbsUp,
  Scale,
  Sparkles,
  Flame,
  ChevronRight
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  language: 'bn' | 'en';
  isOnline: boolean;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number, options?: { color?: string; size?: string }) => void;
  onBuyNow: (product: Product, quantity: number, options?: { color?: string; size?: string }) => void;
  onOpenSizeGuide?: (category: string) => void;
  onOpenWriteReview?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isCompared?: boolean;
  onViewStore?: (storeId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  language,
  isOnline,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onOpenSizeGuide,
  onOpenWriteReview,
  onToggleCompare,
  isCompared = false,
  onViewStore
}) => {
  const [activeImage, setActiveImage] = useState(product?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.attributes?.find((a) => a.name.toLowerCase().includes('color') || a.name.toLowerCase().includes('strap') || a.nameBn.includes('রং'))
      ?.options[0]
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.attributes?.find((a) => a.name.toLowerCase().includes('size') || a.name.toLowerCase().includes('switch') || a.nameBn.includes('সাইজ'))
      ?.options[0]
  );
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews' | 'warranty'>('details');
  const [selectedDivision, setSelectedDivision] = useState('dhaka');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'all' | 'photo'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || '');
      setSelectedColor(
        product.attributes?.find((a) => a.name.toLowerCase().includes('color') || a.name.toLowerCase().includes('strap') || a.nameBn.includes('রং'))
          ?.options[0]
      );
      setSelectedSize(
        product.attributes?.find((a) => a.name.toLowerCase().includes('size') || a.name.toLowerCase().includes('switch') || a.nameBn.includes('সাইজ'))
          ?.options[0]
      );
      setQuantity(1);
    }
  }, [product?.id, product?.image]);

  if (!product) return null;

  const currentDiv = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivision) || BANGLADESH_DIVISIONS[0];
  const isFashion = product.category === 'fashion' || product.hasSizeChart;

  // Rating breakdown stats
  const totalReviews = product.reviews.length;
  const rating5Count = product.reviews.filter((r) => r.rating === 5).length;
  const rating4Count = product.reviews.filter((r) => r.rating === 4).length;
  const rating3Count = product.reviews.filter((r) => r.rating === 3).length;

  const filteredReviews = product.reviews.filter((r) => {
    if (reviewRatingFilter === 'all') return true;
    if (reviewRatingFilter === 'photo') return r.photos && r.photos.length > 0;
    return r.rating === reviewRatingFilter;
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `SmartShopX.bd: ${product.title} at only ৳${product.price}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {language === 'bn' ? product.categoryBn : product.category}
            </span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[180px] sm:max-w-xs">
              {product.brand}
            </span>
            {!isOnline && (
              <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                {language === 'bn' ? 'অফলাইন ক্যাশ' : 'Offline Cached'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#f85606] dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-full transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Share"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 pb-20 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Gallery with Hover & Pinch Zoom */}
            <div className="space-y-3">
              <ProductImageZoom
                src={product.image}
                alt={language === 'bn' ? (product.titleBn || product.title) : product.title}
                language={language}
                gallery={product.gallery && product.gallery.length > 0 ? product.gallery : [product.image]}
                activeImage={activeImage}
                onSelectImage={(img) => setActiveImage(img)}
                discountPercent={product.discountPercent}
                isDarazMall={product.isDarazMall}
                product={product}
                hotspots={product.hotspots}
                onBuyNow={(prod) => {
                  onBuyNow(prod, quantity, { color: selectedColor, size: selectedSize });
                  onClose();
                }}
                onAddToCart={(prod) => {
                  onAddToCart(prod, quantity, { color: selectedColor, size: selectedSize });
                }}
              />

              {/* Thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                        activeImage === img ? 'border-[#f85606] ring-2 ring-orange-200 dark:ring-orange-900' : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 bg-orange-50/50 dark:bg-gray-800/60 p-3 rounded-2xl border border-orange-100 dark:border-gray-800 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-[#f85606] dark:text-orange-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">১০০% আসল পণ্য</span>
                </div>
                <div className="flex flex-col items-center border-x border-orange-200 dark:border-gray-700">
                  <RotateCcw className="w-4 h-4 text-[#f85606] dark:text-orange-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">৭ দিন ফ্রি রিটার্ন</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-[#f85606] dark:text-orange-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>
            </div>

            {/* Right: Product Info & Actions */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#f85606] uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                    {product.brand}
                  </span>
                  {product.stock <= 25 && (
                    <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{language === 'bn' ? `মাত্র ${product.stock}টি স্টকে বাকি` : `Only ${product.stock} left in stock`}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
                  {language === 'bn' ? product.titleBn : product.title}
                </h1>

                {/* Generic Name & SKU (Section 6 & 7) */}
                {(product.genericName || product.sku) && (
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {product.genericName && (
                      <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                        {language === 'bn' ? 'জেনেরিক:' : 'Generic:'} {language === 'bn' && product.genericNameBn ? product.genericNameBn : product.genericName}
                      </span>
                    )}
                    {product.sku && (
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-mono text-[11px]">
                        SKU: {product.sku}
                      </span>
                    )}
                    {product.barcode && (
                      <span className="hidden sm:inline text-[10px] text-gray-400 font-mono">
                        Barcode: {product.barcode}
                      </span>
                    )}
                  </div>
                )}

                {/* Rating & Compare link */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{product.rating}</span>
                    <span className="text-gray-400 dark:text-gray-500">({product.reviewCount} {language === 'bn' ? 'রিভিউ' : 'reviews'})</span>
                  </div>

                  {onToggleCompare && (
                    <button
                      onClick={() => onToggleCompare(product)}
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        isCompared
                          ? 'bg-[#0a3871] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#f85606]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isCompared ? (language === 'bn' ? 'তুলনায় যুক্ত' : 'Compared') : (language === 'bn' ? 'পণ্য তুলনা' : 'Compare')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Price Banner */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 dark:from-gray-800 dark:to-gray-850 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#f85606] dark:text-orange-400">
                      ৳{product.price.toLocaleString('en-US')}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                        ৳{product.originalPrice.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    {language === 'bn' ? `আপনি সাশ্রয় করছেন ৳${product.originalPrice - product.price}` : `You save ৳${product.originalPrice - product.price}`}
                  </p>
                </div>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-rose-500'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Attributes (Color / Size) */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="space-y-3">
                  {product.attributes.map((attr) => {
                    const isColor = attr.name.toLowerCase().includes('color') || attr.name.toLowerCase().includes('strap') || attr.nameBn.includes('রং');
                    const isSize = attr.name.toLowerCase().includes('size') || attr.nameBn.includes('সাইজ');

                    return (
                      <div key={attr.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {language === 'bn' ? attr.nameBn : attr.name}:{' '}
                            <span className="text-[#f85606] dark:text-orange-400 font-extrabold">{isColor ? selectedColor : selectedSize}</span>
                          </label>

                          {/* Size Guide Trigger if Fashion Size */}
                          {isSize && onOpenSizeGuide && (
                            <button
                              type="button"
                              onClick={() => onOpenSizeGuide(product.category)}
                              className="text-xs text-[#f85606] dark:text-orange-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Ruler className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'সাইজ চার্ট গাইড' : 'Size Chart'}</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {attr.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => (isColor ? setSelectedColor(opt) : setSelectedSize(opt))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                (isColor ? selectedColor === opt : selectedSize === opt)
                                  ? 'border-[#f85606] bg-orange-50 dark:bg-orange-950/40 text-[#f85606] dark:text-orange-400 ring-1 ring-[#f85606]'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'পরিমাণ (Quantity):' : 'Quantity:'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-black text-sm text-gray-900 dark:text-gray-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: 1-Click Buy Now & Cart */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity, { color: selectedColor, size: selectedSize });
                    onClose();
                  }}
                  className="bg-orange-50 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-750 text-[#f85606] dark:text-orange-400 border-2 border-[#f85606] font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={() => {
                    onBuyNow(product, quantity, { color: selectedColor, size: selectedSize });
                    onClose();
                  }}
                  className="bg-gradient-to-r from-[#f85606] to-[#ff5500] hover:from-[#e04d05] hover:to-[#e64c00] text-white font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current text-yellow-300" />
                  <span>{language === 'bn' ? '১-ক্লিকে কিনুন' : 'Buy Now'}</span>
                </button>
              </div>

              {/* Direct WhatsApp Order Button */}
              <a
                href={`https://wa.me/8801700000000?text=${encodeURIComponent(
                  `আসসালামু আলাইকুম! আমি SmartShopX.bd থেকে "${product.titleBn || product.title}" অর্ডার করতে চাই।\nমূল্য: ৳${product.price}\nপরিমাণ: ${quantity}টি\nদোকানের লিংক: https://smartshopx.bd`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{language === 'bn' ? '📱 WhatsApp এ সরাসরি অর্ডার করুন' : '📱 Order Directly via WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Interactive Courier Delivery Calculator & Seller Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/80 dark:bg-gray-850/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs">
            {/* Interactive Delivery Estimator */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#f85606]" />
                  <span>{language === 'bn' ? 'ডেলিভারি এলাকা ও কুরিয়ার চার্জ' : 'Delivery & Courier Partner'}</span>
                </h4>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Steadfast / Pathao
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none focus:border-[#f85606] cursor-pointer"
                >
                  {BANGLADESH_DIVISIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'bn' ? d.nameBn : d.name} (ডেলিভারি চার্জ: ৳{d.deliveryFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                  <span>{language === 'bn' ? 'সম্ভাব্য পৌঁছানোর সময়:' : 'Estimated Delivery:'}</span>
                  <span className="text-[#f85606] dark:text-orange-400 font-bold">{currentDiv.estimatedDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'bn' ? 'হোম ডেলিভারি ফি:' : 'Standard Shipping:'}</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {product.isFreeDelivery ? <strong className="text-emerald-600 dark:text-emerald-400">FREE</strong> : `৳${currentDiv.deliveryFee}`}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-0.5">
                  💵 ক্যাশ অন ডেলিভারি (পণ্য চেক করে মূল্য পরিশোধের সুবিধা)
                </p>
              </div>
            </div>

            {/* Seller & Store Information with Direct Flow to Store Profile (Section 9) */}
            <div className="space-y-2.5 md:border-l md:border-gray-200 dark:md:border-gray-750 md:pl-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#0a3871] dark:text-blue-400" />
                  <span>{language === 'bn' ? 'দোকান / সেলার সম্পর্কিত তথ্য' : 'Sold by'}</span>
                </h4>
                {onViewStore && (
                  <button
                    type="button"
                    onClick={() => {
                      const storeId = product.storeId || product.seller?.storeId || 'STORE_001';
                      onViewStore(storeId);
                    }}
                    className="text-[11px] font-bold text-[#f85606] hover:text-[#d84a05] dark:text-orange-400 flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'দোকান দেখুন' : 'View Store'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-gray-900 dark:text-gray-100 text-xs">
                    {product.storeName || product.seller.name}
                  </p>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                    {language === 'bn' ? 'ভেরিফাইড' : 'Verified'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-orange-50/50 dark:bg-gray-750 p-1.5 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">পজিটিভ রেটিং</span>
                    <span className="font-extrabold text-[#f85606] dark:text-orange-400">{product.seller.rating}%</span>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-gray-750 p-1.5 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">রেসপন্স রেট</span>
                    <span className="font-extrabold text-[#0a3871] dark:text-blue-400">{product.seller.responseRate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-750 text-[10px] text-gray-400 dark:text-gray-500">
                  <span>📍 {product.seller.location}</span>
                  {onViewStore && (
                    <button
                      type="button"
                      onClick={() => {
                        const storeId = product.storeId || product.seller?.storeId || 'STORE_001';
                        onViewStore(storeId);
                      }}
                      className="text-[#f85606] font-bold hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'স্টোর প্রোফাইল →' : 'Store Profile →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description, Specs, Reviews, Warranty */}
          <div>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto gap-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-[#f85606] text-[#f85606] dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {language === 'bn' ? 'পণ্যের বিবরণ' : 'Description'}
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-[#f85606] text-[#f85606] dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <span>{language === 'bn' ? 'কাস্টমার রিভিউ' : 'Reviews'}</span>
                <span className="bg-orange-100 dark:bg-orange-950/60 text-[#f85606] dark:text-orange-400 px-1.5 py-0.2 rounded-full text-[10px]">
                  {product.reviews.length}
                </span>
              </button>

              {product.warranty && (
                <button
                  onClick={() => setActiveTab('warranty')}
                  className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                    activeTab === 'warranty'
                      ? 'border-[#f85606] text-[#f85606] dark:text-orange-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {language === 'bn' ? 'ওয়ারেন্টি পলিসি' : 'Warranty'}
                </button>
              )}
            </div>

            {/* Description Tab */}
            {activeTab === 'details' && (
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>{language === 'bn' ? product.descriptionBn : product.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {product.tags.map((t, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab with Photo Gallery & Rating Filter */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Review Header with Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Left: Overall Star */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-gray-900 dark:text-gray-100">{product.rating}</div>
                      <div className="flex text-amber-400 justify-center my-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{totalReviews} {language === 'bn' ? 'মোট রেটিং' : 'Ratings'}</div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-1 text-[11px] w-40 sm:w-48 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>5★</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: `${(rating5Count / Math.max(1, totalReviews)) * 100}%` }} />
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px]">{rating5Count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>4★</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: `${(rating4Count / Math.max(1, totalReviews)) * 100}%` }} />
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px]">{rating4Count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Write Review Trigger */}
                  {onOpenWriteReview && (
                    <button
                      onClick={() => onOpenWriteReview(product)}
                      className="bg-[#f85606] hover:bg-[#d84a05] text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ছবি সহ রিভিউ দিন' : 'Write a Review'}</span>
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setReviewRatingFilter('all')}
                    className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                      reviewRatingFilter === 'all' ? 'bg-[#f85606] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {language === 'bn' ? 'সকল রিভিউ' : 'All Reviews'}
                  </button>
                  <button
                    onClick={() => setReviewRatingFilter(5)}
                    className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                      reviewRatingFilter === 5 ? 'bg-[#f85606] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>5 Star</span>
                    <Star className="w-3 h-3 fill-current text-amber-400" />
                  </button>
                  <button
                    onClick={() => setReviewRatingFilter('photo')}
                    className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                      reviewRatingFilter === 'photo' ? 'bg-[#f85606] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>{language === 'bn' ? 'ছবিসহ রিভিউ' : 'With Photos'}</span>
                  </button>
                </div>

                {/* Review Cards */}
                <div className="space-y-3">
                  {filteredReviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-gray-50/70 dark:bg-gray-850/70 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-gray-100">{rev.author}</span>
                          {rev.verifiedPurchase && (
                            <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              ✓ {language === 'bn' ? 'ভেরিফায়েড ক্রেতা' : 'Verified Purchase'}
                            </span>
                          )}
                          {rev.userLocation && (
                            <span className="text-gray-400 dark:text-gray-500 text-[10px]">({rev.userLocation})</span>
                          )}
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-[11px]">{rev.date}</span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{language === 'bn' ? rev.commentBn : rev.comment}</p>

                      {/* Photo Attachments */}
                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.photos.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Review customer photo"
                              onClick={() => setZoomedPhoto(img)}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700 cursor-zoom-in hover:scale-105 transition"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[10px] pt-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{rev.helpfulCount} {language === 'bn' ? 'জন উপকৃত হয়েছেন' : 'found this helpful'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty Tab */}
            {activeTab === 'warranty' && (
              <div className="text-xs text-gray-700 dark:text-gray-300 bg-orange-50/50 dark:bg-gray-800 p-4 rounded-xl border border-orange-100 dark:border-gray-700 space-y-2">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {language === 'bn' ? product.warrantyBn : product.warranty}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'bn'
                    ? 'ওয়ারেন্টি সময়কালে যেকোনো অফিসিয়াল সার্ভিস সেন্টার থেকে বিনামূল্যে মেরামত বা পরিবর্তন সেবা পাবেন।'
                    : 'Get free repair and warranty support across authorized service centers nationwide.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal for Review Photos */}
      {zoomedPhoto && (
        <div
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img src={zoomedPhoto} alt="Zoomed review" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};
