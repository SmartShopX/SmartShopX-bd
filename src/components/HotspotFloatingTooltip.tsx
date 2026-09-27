import React, { useState } from 'react';
import {
  Zap,
  ShoppingBag,
  X,
  Cpu,
  Layers,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { Product, ProductHotspot } from '../types';

interface HotspotFloatingTooltipProps {
  hotspot: ProductHotspot;
  product: Product;
  language: 'bn' | 'en';
  onClose: () => void;
  onBuyNow?: (product: Product, hotspot: ProductHotspot) => void;
  onAddToCart?: (product: Product, hotspot: ProductHotspot) => void;
}

export const HotspotFloatingTooltip: React.FC<HotspotFloatingTooltipProps> = ({
  hotspot,
  product,
  language,
  onClose,
  onBuyNow,
  onAddToCart
}) => {
  const [isBought, setIsBought] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const displayPrice = hotspot.partPrice || product.price;
  const originalPrice = product.originalPrice;
  const partTitle = language === 'bn' ? hotspot.titleBn : hotspot.title;
  const partName = language === 'bn' ? (hotspot.partNameBn || hotspot.partName) : (hotspot.partName || hotspot.title);
  const partDescription = language === 'bn' ? hotspot.descriptionBn : hotspot.description;

  // Decide positioning relative to hotspot coordinates
  const isRightSide = hotspot.x > 50;
  const isBottomSide = hotspot.y > 55;

  // Construct sharable URL and pre-filled feature description text
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?product=${product.id}&hotspot=${hotspot.id}`
    : '';

  const shareText = language === 'bn'
    ? `🔥 SmartShopX.bd-এ দেখুন: ${partTitle} (${product.title}) - মাত্র ৳${displayPrice.toLocaleString()}!`
    : `🔥 SmartShopX.bd: Check out "${partTitle}" on ${product.title} - only ৳${displayPrice.toLocaleString()}!`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = `${shareText}\n${shareUrl}`;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBought(true);
    if (onBuyNow) {
      onBuyNow(product, hotspot);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdded(true);
    if (onAddToCart) {
      onAddToCart(product, hotspot);
    }
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getCategoryIcon = () => {
    switch (hotspot.category) {
      case 'spec':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'performance':
        return <Zap className="w-3.5 h-3.5" />;
      case 'material':
        return <Layers className="w-3.5 h-3.5" />;
      case 'warranty':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryLabel = () => {
    if (language === 'bn') {
      switch (hotspot.category) {
        case 'spec':
          return 'প্রযুক্তিগত স্পেক';
        case 'performance':
          return 'পারফরম্যান্স';
        case 'material':
          return 'ম্যাটেরিয়াল ও বিল্ড';
        case 'warranty':
          return 'অফিসিয়াল সুরক্ষা';
        default:
          return 'কী ফিচার';
      }
    }
    switch (hotspot.category) {
      case 'spec':
        return 'Tech Spec';
      case 'performance':
        return 'Performance';
      case 'material':
        return 'Material & Build';
      case 'warranty':
        return 'Official Warranty';
      default:
        return 'Key Feature';
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute z-40 w-[280px] sm:w-[325px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-500/40 p-3.5 sm:p-4 text-xs transition animate-in fade-in zoom-in-95 duration-200 select-text ${
        isRightSide ? 'right-0 -translate-x-1 sm:-translate-x-2' : 'left-0 translate-x-1 sm:translate-x-2'
      } ${
        isBottomSide ? 'bottom-full mb-3' : 'top-full mt-3'
      }`}
    >
      {/* Directional Pointer Arrow Indicator */}
      <div
        className={`absolute w-3 h-3 bg-white dark:bg-gray-900 border-orange-500/40 rotate-45 pointer-events-none ${
          isBottomSide
            ? 'bottom-[-7px] border-r border-b'
            : 'top-[-7px] border-l border-t'
        } ${
          isRightSide ? 'right-6' : 'left-6'
        }`}
      />

      {/* Header: Category Badge & Close Button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-[#f85606] dark:text-orange-400 border border-orange-500/20 text-[10px] font-extrabold uppercase tracking-wide">
          {getCategoryIcon()}
          <span>{getCategoryLabel()}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          aria-label="Close tooltip"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Highlighted Feature & Part Information */}
      <div className="space-y-1.5 mb-3">
        <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white leading-snug">
          {partTitle}
        </h4>

        {hotspot.partName && (
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-900/60">
            <PackageCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{partName}</span>
          </div>
        )}

        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
          {partDescription}
        </p>
      </div>

      {/* Pricing & Stock Status */}
      <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-[#f85606]">
              ৳{displayPrice.toLocaleString()}
            </span>
            {originalPrice > displayPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {language === 'bn' ? 'স্টকে আছে • দ্রুত ডেলিভারি' : 'In Stock • Ready to Ship'}
          </span>
        </div>

        {/* Feature Part Badge */}
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {language === 'bn' ? '১০০% জেনুইন' : '100% Genuine'}
        </span>
      </div>

      {/* Action Buttons: Add to Cart & Buy Now */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Optional Add To Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 hover:text-[#f85606] font-bold text-xs transition cursor-pointer active:scale-95"
        >
          {isAdded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'bn' ? 'যোগ হয়েছে' : 'Added'}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কার্টে যোগ' : 'Add Cart'}</span>
            </>
          )}
        </button>

        {/* Dedicated Buy Now Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f85606] hover:bg-[#d84a05] active:scale-95 text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer group"
          title={language === 'bn' ? 'এই পার্ট/ফিচার সহ এখনই কিনুন' : 'Buy Now with this highlighted feature/part'}
        >
          {isBought ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>{language === 'bn' ? 'অর্ডার শুরু...' : 'Ordering...'}</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
              <span>{language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {/* Social Media Sharing Bar: WhatsApp, Facebook & Copy Link */}
      <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-1.5 select-none">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <Share2 className="w-3.5 h-3.5 text-[#f85606]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {language === 'bn' ? 'শেয়ার:' : 'Share:'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* WhatsApp Direct Share */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-[#25D366] text-[#25D366] hover:text-white dark:bg-emerald-950/50 dark:hover:bg-[#25D366] dark:text-emerald-400 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
            title={language === 'bn' ? 'হোয়াটসঅ্যাপে ফিচারটি শেয়ার করুন' : 'Share this feature on WhatsApp'}
            aria-label="Share on WhatsApp"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

          {/* Facebook Direct Share */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-[#1877F2] text-[#1877F2] hover:text-white dark:bg-blue-950/50 dark:hover:bg-[#1877F2] dark:text-blue-400 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
            title={language === 'bn' ? 'ফেসবুকে ফিচারটি শেয়ার করুন' : 'Share this feature on Facebook'}
            aria-label="Share on Facebook"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* Copy Link to Clipboard Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
              copiedLink
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={language === 'bn' ? 'ফিচার লিংক ও তথ্য কপি করুন' : 'Copy feature link & summary to clipboard'}
            aria-label="Copy feature link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{language === 'bn' ? 'লিংক কপি' : 'Copy Link'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

