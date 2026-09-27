import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Move,
  Info,
  Cpu,
  Zap,
  ShieldCheck,
  Layers,
  Crosshair,
  CheckCircle2,
  SlidersHorizontal,
  Palette,
  Sun,
  Flame,
  Droplets,
  Camera,
  Check,
  Share2,
  Copy,
  MessageCircle,
  ExternalLink,
  Highlighter,
  Pencil,
  Download
} from 'lucide-react';
import { Product, ProductHotspot } from '../types';
import { HotspotFloatingTooltip } from './HotspotFloatingTooltip';
import { ProductAnnotationCanvas } from './ProductAnnotationCanvas';

export interface ImageFilterPreset {
  id: string;
  name: string;
  nameBn: string;
  category: 'lighting' | 'tone' | 'artistic';
  description: string;
  descriptionBn: string;
  filterCss: string;
  previewGradient: string;
  ambientOverlay?: string;
  iconType: 'original' | 'studio' | 'warm' | 'cool' | 'vintage' | 'vibrant' | 'monochrome';
}

export const IMAGE_FILTER_PRESETS: ImageFilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    nameBn: 'আসল ভিউ',
    category: 'tone',
    description: 'Natural true-to-life color reproduction without visual adjustments',
    descriptionBn: 'কোনো পরিবর্তন ছাড়াই পণ্যের স্বাভাবিক ও আসল দৃশ্য',
    filterCss: 'none',
    previewGradient: 'from-gray-300 via-gray-400 to-gray-500',
    iconType: 'original'
  },
  {
    id: 'studio',
    name: 'Studio Lighting',
    nameBn: 'স্টুডিও লাইটিং',
    category: 'lighting',
    description: 'Crisp commercial softbox illumination with enhanced contrast and pop',
    descriptionBn: 'উজ্জ্বল বাণিজ্যিক সফটবক্স আলো, নিখুঁত কনট্রাস্ট ও শার্প হাইলাইট',
    filterCss: 'brightness(1.08) contrast(1.12) saturate(1.06)',
    previewGradient: 'from-amber-200 via-white to-sky-200',
    ambientOverlay: 'radial-gradient(circle at 45% 35%, rgba(255, 255, 255, 0.16) 0%, transparent 65%)',
    iconType: 'studio'
  },
  {
    id: 'warm',
    name: 'Warm',
    nameBn: 'ওয়ার্ম টোন',
    category: 'lighting',
    description: 'Golden hour incandescent warmth with soft amber undertones',
    descriptionBn: 'সোনালী বিকেলের উষ্ণ রোদ ও মনোরম উজ্জ্বল আভা',
    filterCss: 'sepia(0.24) saturate(1.22) brightness(1.04) hue-rotate(-8deg)',
    previewGradient: 'from-amber-500 via-orange-400 to-yellow-300',
    ambientOverlay: 'radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.14) 0%, transparent 65%)',
    iconType: 'warm'
  },
  {
    id: 'cool',
    name: 'Cool',
    nameBn: 'কুল ডে-লাইট',
    category: 'lighting',
    description: 'Clean 6500K daylight accentuating metallic & modern tech finishes',
    descriptionBn: '৬৫০০কে পরিচ্ছন্ন উজ্জ্বল আধুনিক আলো যা মেটালিক ফিনিশ ফুটিয়ে তোলে',
    filterCss: 'brightness(1.05) contrast(1.08) saturate(0.94) hue-rotate(12deg)',
    previewGradient: 'from-sky-400 via-cyan-300 to-blue-500',
    ambientOverlay: 'radial-gradient(circle at 60% 35%, rgba(56, 189, 248, 0.13) 0%, transparent 65%)',
    iconType: 'cool'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameBn: 'ভিন্টেজ ফিল্ম',
    category: 'artistic',
    description: 'Classic 35mm retro aesthetic with rich shadows and warm filmic richness',
    descriptionBn: 'অ্যানালগ রেট্রো ৩৫মিমি ফিল্মের ক্লাসিক ও নস্টালজিক লুক',
    filterCss: 'sepia(0.36) contrast(1.15) brightness(0.96) saturate(1.14)',
    previewGradient: 'from-amber-800 via-yellow-700 to-stone-500',
    ambientOverlay: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(70, 40, 15, 0.14) 100%)',
    iconType: 'vintage'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    nameBn: 'ভাইব্রেন্ট পপ',
    category: 'artistic',
    description: 'Punchy saturated colors with showcase brilliance and rich depth',
    descriptionBn: 'গাঢ় প্রাণবন্ত রঙ ও আকর্ষণীয় শোকেস ব্রিলিয়ান্স',
    filterCss: 'contrast(1.14) saturate(1.36) brightness(1.02)',
    previewGradient: 'from-rose-500 via-purple-500 to-amber-400',
    iconType: 'vibrant'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    nameBn: 'মনোক্রোম',
    category: 'artistic',
    description: 'High-contrast black & white to inspect textures, curves, and industrial form',
    descriptionBn: 'পণ্যের টেক্সচার ও সূক্ষ্ম গড়ন স্পষ্ট দেখার জন্য সাদাকালো ভিউ',
    filterCss: 'grayscale(1) contrast(1.22) brightness(1.02)',
    previewGradient: 'from-gray-950 via-gray-700 to-gray-200',
    iconType: 'monochrome'
  }
];

interface ProductImageZoomProps {
  src: string;
  alt: string;
  language: 'bn' | 'en';
  gallery?: string[];
  activeImage: string;
  onSelectImage?: (img: string) => void;
  discountPercent?: number;
  isDarazMall?: boolean;
  product?: Product;
  hotspots?: ProductHotspot[];
  onBuyNow?: (product: Product, hotspot: ProductHotspot) => void;
  onAddToCart?: (product: Product, hotspot: ProductHotspot) => void;
}

export const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  src,
  alt,
  language,
  gallery = [],
  activeImage,
  onSelectImage,
  discountPercent = 0,
  isDarazMall = false,
  product,
  hotspots: customHotspots,
  onBuyNow,
  onAddToCart
}) => {
  // Desktop Hover Zoom State
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Touch Pinch & Pan State
  const [touchScale, setTouchScale] = useState(1);
  const [touchTranslate, setTouchTranslate] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  // Fullscreen Lightbox Inspection State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1.5);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const [isDraggingLightbox, setIsDraggingLightbox] = useState(false);

  // Interactive Hotspots State
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  // Real-time Image Filter Presets State
  const [activeFilterId, setActiveFilterId] = useState<string>('original');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterIntensity, setFilterIntensity] = useState<number>(100);

  const activePreset = useMemo<ImageFilterPreset>(() => {
    return IMAGE_FILTER_PRESETS.find(p => p.id === activeFilterId) || IMAGE_FILTER_PRESETS[0];
  }, [activeFilterId]);

  // Social Media Sharing State
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'shared' | 'copied' | 'error'>('idle');
  const [shareToastText, setShareToastText] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Annotation & Drawing Overlay State
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotatedPreviewUrl, setAnnotatedPreviewUrl] = useState<string | null>(null);
  const [annotatedBlob, setAnnotatedBlob] = useState<Blob | null>(null);
  const [annotatedNotesSummary, setAnnotatedNotesSummary] = useState<string>('');
  const [containerDimensions, setContainerDimensions] = useState({ width: 500, height: 500 });

  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({
        width: Math.round(rect.width) || 500,
        height: Math.round(rect.height) || 500
      });
    }
  }, []);

  useEffect(() => {
    updateContainerDimensions();
    window.addEventListener('resize', updateContainerDimensions);
    return () => window.removeEventListener('resize', updateContainerDimensions);
  }, [updateContainerDimensions]);

  // 360° Interactive Turntable & Rotation State
  const [is360Active, setIs360Active] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDragging360, setIsDragging360] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [rotationDirection, setRotationDirection] = useState<'cw' | 'ccw'>('cw');
  const dragStartXRef = useRef<number | null>(null);
  const dragStartAngleRef = useRef<number>(0);

  // Refs for gesture calculations
  const containerRef = useRef<HTMLDivElement>(null);
  const initialTouchDistRef = useRef<number | null>(null);
  const initialTouchScaleRef = useRef<number>(1);
  const lastTouchPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const lightboxDragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  // Resolve Contextual Hotspots
  const resolvedHotspots = useMemo<ProductHotspot[]>(() => {
    if (customHotspots && customHotspots.length > 0) return customHotspots;
    if (product?.hotspots && product.hotspots.length > 0) return product.hotspots;
    if (!product) return [];

    const list: ProductHotspot[] = [];

    // Hotspot 1: Display / Driver / Core Material
    if (product.category === 'electronics') {
      const isWatch = product.title.toLowerCase().includes('watch');
      const isAudio = product.title.toLowerCase().includes('earbud') || product.title.toLowerCase().includes('headphone') || product.title.toLowerCase().includes('sound');
      if (isWatch) {
        list.push({
          id: 'hs-1',
          x: 48,
          y: 36,
          title: 'HD AMOLED Retina Display',
          titleBn: 'উচ্চ রেজোলিউশন অ্যামোলেড ডিসপ্লে',
          description: 'Ultra-clear 60Hz vibrant color gamut with scratch-resistant curved glass protection.',
          descriptionBn: '৬০ হার্জ রিফ্রেশ রেট, স্ক্র্যাচ-প্রতিরোধী কার্ভড গ্লাস এবং প্রখর রোদেও পরিষ্কার ভিউ।',
          category: 'spec',
          partName: 'AMOLED Retina Glass Panel',
          partNameBn: 'অ্যামোলেড রেটিনা গ্লাস প্যানেল',
          partPrice: product.price
        });
      } else if (isAudio) {
        list.push({
          id: 'hs-1',
          x: 38,
          y: 34,
          title: '10mm Dynamic Audio Drivers',
          titleBn: '১০ মিমি ডাইনামিক বেস ড্রাইভার্স',
          description: 'Precision acoustic chamber delivering deep punchy bass and crystalline high frequencies.',
          descriptionBn: 'উচ্চ মানের অ্যাকোস্টিক চেম্বার, ডিপ বেস এবং স্বচ্ছ ক্রিস্টাল ক্লিয়ার অডিও আউটপুট।',
          category: 'performance',
          partName: 'Dynamic Bass Driver & Acoustic Mesh',
          partNameBn: 'ডাইনামিক অডিও ড্রাইভার ও মেশ ইউনিট',
          partPrice: product.price
        });
      } else {
        list.push({
          id: 'hs-1',
          x: 44,
          y: 35,
          title: 'High-Precision Architecture',
          titleBn: 'উন্নত প্রযুক্তির হাই-প্রিসিশন হার্ডওয়্যার',
          description: 'Engineered with premium low-latency components and responsive sensors.',
          descriptionBn: 'সূক্ষ্ম ইঞ্জিনিয়ারিং ও প্রিমিয়াম বিল্ড কোয়ালিটির সমন্বয়ে দীর্ঘস্থায়ী পারফরম্যান্স।',
          category: 'spec',
          partName: 'Precision Core Hardware Module',
          partNameBn: 'হাই-প্রিসিশন কোর হার্ডওয়্যার মডিউল',
          partPrice: product.price
        });
      }
    } else if (product.category === 'fashion') {
      list.push({
        id: 'hs-1',
        x: 50,
        y: 34,
        title: '100% Breathable Combed Fabric',
        titleBn: '১০০% ব্রিদেবল প্রিমিয়াম কটন',
        description: 'Ultra-soft handfeel with enhanced color fastness and anti-pilling weave technology.',
        descriptionBn: 'অত্যন্ত আরামদায়ক প্রিমিয়াম কটন ফেব্রিক, টেকসই রঙ ও নিখুঁত মসৃণ বুনন।',
        category: 'material',
        partName: '100% Combed Cotton Weave Fabric',
        partNameBn: '১০০% কম্বড সুতির প্রিমিয়াম ফেব্রিক',
        partPrice: product.price
      });
    } else {
      list.push({
        id: 'hs-1',
        x: 45,
        y: 34,
        title: `${product.brand || 'Premium'} Certified Build`,
        titleBn: `${product.brand || 'আসল'} সার্টিফাইড কোয়ালিটি`,
        description: 'Undergoes rigorous multi-stage quality checks for superior durability and finish.',
        descriptionBn: 'সর্বোচ্চ মাননিয়ন্ত্রণ ও স্থায়িত্ব পরীক্ষার মাধ্যমে অনুমোদিত আসল পণ্য।',
        category: 'spec',
        partName: `${product.brand || 'Premium'} Verified Quality Component`,
        partNameBn: `${product.brand || 'আসল'} সার্টিফাইড কোয়ালিটি কম্পোনেন্ট`,
        partPrice: product.price
      });
    }

    // Hotspot 2: Chip / Wireless / Ergonomics
    if (product.category === 'electronics') {
      list.push({
        id: 'hs-2',
        x: 68,
        y: 48,
        title: 'Bluetooth 5.3 Low-Latency',
        titleBn: 'স্মার্ট ব্লুটুথ ৫.৩ ও ডুয়াল মাইক',
        description: 'Instant ultra-stable pairing up to 15m and AI noise-cancellation for clear voice calls.',
        descriptionBn: '১৫ মিটার পর্যন্ত তাৎক্ষণিক নিরবচ্ছিন্ন কানেক্টিভিটি এবং এআই নয়েজ ক্যান্সেলেশন।',
        category: 'feature',
        partName: 'Low-Latency Bluetooth 5.3 Antenna Assembly',
        partNameBn: 'ব্লুটুথ ৫.৩ অ্যান্টেনা ও এআই চিপ অ্যাসেম্বলি',
        partPrice: product.price
      });
    } else if (product.category === 'fashion') {
      list.push({
        id: 'hs-2',
        x: 35,
        y: 56,
        title: 'Reinforced Double-Stitch Seams',
        titleBn: 'দ্বিগুণ মজবুত নিখুঁত সেলাই',
        description: 'Industrial-grade thread stitching crafted to maintain tailored fit after regular washes.',
        descriptionBn: 'আন্তর্জাতিক মানের ডাবল-লক সেলাই, যা বারবার ধোয়ার পরও ফিটিং বজায় রাখে।',
        category: 'feature',
        partName: 'Reinforced Tailored Collar & Seams',
        partNameBn: 'মজবুত ডাবল-লক কলার ও সিম ফিনিশিং',
        partPrice: product.price
      });
    } else {
      list.push({
        id: 'hs-2',
        x: 65,
        y: 52,
        title: 'Ergonomic Functional Design',
        titleBn: 'স্মার্ট এরগনোমিক ফাংশনাল ডিজাইন',
        description: 'Balanced weight distribution crafted for natural, comfortable daily handling.',
        descriptionBn: 'ব্যবহারকারীর সুবিধাজনক ও নিরাপদ ব্যবহার নিশ্চিত করতে বিশেষ এরগনোমিক কারিগরি।',
        category: 'feature',
        partName: 'Ergonomic Grip Body Casing',
        partNameBn: 'এরগনোমিক আরামদায়ক বডি কেসিং',
        partPrice: product.price
      });
    }

    // Hotspot 3: Battery / Warranty / Certified Authenticity
    if (product.warranty) {
      list.push({
        id: 'hs-3',
        x: 52,
        y: 74,
        title: 'Official Warranty Coverage',
        titleBn: 'অফিসিয়াল ওয়ারেন্টি সুরক্ষা',
        description: language === 'bn' ? (product.warrantyBn || product.warranty) : product.warranty,
        descriptionBn: product.warrantyBn || product.warranty,
        category: 'warranty',
        partName: 'Manufacturer Official Brand Warranty',
        partNameBn: 'অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি কার্ড ও কভারেজ',
        partPrice: product.price
      });
    } else if (product.category === 'electronics') {
      list.push({
        id: 'hs-3',
        x: 52,
        y: 74,
        title: 'High-Density Long-Endurance Battery',
        titleBn: 'লং-লাস্টিং ব্যাটারি ও ফাস্ট চার্জিং',
        description: 'High-capacity battery cell with rapid USB-C charging support for all-day reliability.',
        descriptionBn: 'উচ্চ ক্ষমতাসম্পন্ন ব্যাটারি ও দ্রুত ইউএসবি-সি চার্জিং সুবিধা।',
        category: 'performance',
        partName: 'High-Density Battery & USB-C Circuit',
        partNameBn: 'হাই-ক্যাপাসিটি ব্যাটারি ও টাইপ-সি চার্জিং সার্কিট',
        partPrice: product.price
      });
    } else {
      list.push({
        id: 'hs-3',
        x: 50,
        y: 72,
        title: 'SmartMall 100% Authentic Guarantee',
        titleBn: 'স্মার্টমল ১০০% আসল পণ্যের নিশ্চয়তা',
        description: 'Direct verified manufacturer sourcing with official buyer protection & hassle-free returns.',
        descriptionBn: 'সরাসরি প্রস্তুতকারক থেকে সংগৃহীত এবং নিশ্চিত রিটার্ন ও রিফান্ড সুবিধা।',
        category: 'warranty',
        partName: 'SmartMall 100% Authentic Buyer Protection',
        partNameBn: 'স্মার্টমল ১০০% অথেনটিক বায়ার প্রোটেকশন প্যাক',
        partPrice: product.price
      });
    }

    return list;
  }, [customHotspots, product, language]);

  // Active Hotspot item
  const activeHotspot = useMemo(() => {
    if (!activeHotspotId) return null;
    return resolvedHotspots.find((h) => h.id === activeHotspotId) || null;
  }, [activeHotspotId, resolvedHotspots]);

  // Reset touch zoom and active hotspot when active image changes
  useEffect(() => {
    setTouchScale(1);
    setTouchTranslate({ x: 0, y: 0 });
    setIsPinching(false);
    setActiveHotspotId(null);
  }, [activeImage]);

  // 360° Auto-Rotation Animation Loop
  useEffect(() => {
    if (!is360Active || !isAutoRotating || isDragging360) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      // ~36 degrees per second for smooth, pleasant rotation
      const deltaAngle = (delta / 1000) * 36 * (rotationDirection === 'cw' ? 1 : -1) * rotationSpeed;
      setRotationAngle((prev) => {
        let next = (prev + deltaAngle) % 360;
        if (next < 0) next += 360;
        return next;
      });
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [is360Active, isAutoRotating, isDragging360, rotationDirection, rotationSpeed]);

  // Global mouseUp for 360 dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging360) {
        setIsDragging360(false);
        dragStartXRef.current = null;
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging360]);

  // Handle Desktop Mouse Down for 360 Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (is360Active) {
      setIsDragging360(true);
      dragStartXRef.current = e.clientX;
      dragStartAngleRef.current = rotationAngle;
    }
  };

  const handleMouseUp = () => {
    if (is360Active) {
      setIsDragging360(false);
      dragStartXRef.current = null;
    }
  };

  // Handle Desktop Mouse Move for Hover Zoom or 360 Rotation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (is360Active) {
      if (isDragging360 && dragStartXRef.current !== null) {
        const deltaX = e.clientX - dragStartXRef.current;
        let nextAngle = (dragStartAngleRef.current + deltaX * 0.75) % 360;
        if (nextAngle < 0) nextAngle += 360;
        setRotationAngle(Math.round(nextAngle));
      }
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (is360Active) return;
    // Only enable hover zoom on non-touch pointer devices
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsHovering(true);
      handleMouseMove(e);
    }
  };

  const handleMouseLeave = () => {
    if (is360Active) {
      setIsDragging360(false);
      dragStartXRef.current = null;
      return;
    }
    setIsHovering(false);
  };

  // Touch Gestures: Pinch-to-zoom, Pan, and 360 Rotation
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (is360Active) {
      if (e.touches.length === 1) {
        setIsDragging360(true);
        dragStartXRef.current = e.touches[0].clientX;
        dragStartAngleRef.current = rotationAngle;
      }
      return;
    }

    if (e.touches.length === 2) {
      // 2 fingers = Pinch start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      initialTouchDistRef.current = dist;
      initialTouchScaleRef.current = touchScale;
      setIsPinching(true);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;
      const touch = e.touches[0];

      // Double tap detected
      if (timeSinceLastTap < 300) {
        if (touchScale > 1) {
          // Reset to normal
          setTouchScale(1);
          setTouchTranslate({ x: 0, y: 0 });
        } else {
          // Zoom in at tapped position
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const tapX = touch.clientX - rect.left;
            const tapY = touch.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // Shift translation toward tap center
            setTouchTranslate({
              x: (centerX - tapX) * 1.2,
              y: (centerY - tapY) * 1.2
            });
          }
          setTouchScale(2.4);
        }
        lastTapTimeRef.current = 0;
        return;
      }

      lastTapTimeRef.current = now;
      lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (is360Active) {
      if (isDragging360 && dragStartXRef.current !== null && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartXRef.current;
        let nextAngle = (dragStartAngleRef.current + deltaX * 0.8) % 360;
        if (nextAngle < 0) nextAngle += 360;
        setRotationAngle(Math.round(nextAngle));
      }
      return;
    }

    if (e.touches.length === 2 && initialTouchDistRef.current !== null) {
      // Pinching
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const factor = dist / initialTouchDistRef.current;
      const newScale = Math.min(4, Math.max(1, initialTouchScaleRef.current * factor));
      setTouchScale(newScale);

      if (newScale <= 1.05) {
        setTouchTranslate({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && touchScale > 1.05 && lastTouchPosRef.current) {
      // Panning while zoomed
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchPosRef.current.x;
      const dy = touch.clientY - lastTouchPosRef.current.y;

      lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };

      const maxPanX = (containerRef.current ? containerRef.current.clientWidth : 300) * (touchScale - 1) * 0.5;
      const maxPanY = (containerRef.current ? containerRef.current.clientHeight : 300) * (touchScale - 1) * 0.5;

      setTouchTranslate((prev) => ({
        x: Math.min(maxPanX, Math.max(-maxPanX, prev.x + dx)),
        y: Math.min(maxPanY, Math.max(-maxPanY, prev.y + dy))
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (is360Active) {
      setIsDragging360(false);
      dragStartXRef.current = null;
      return;
    }

    if (e.touches.length < 2) {
      initialTouchDistRef.current = null;
      setIsPinching(false);
    }
    if (e.touches.length === 0) {
      lastTouchPosRef.current = null;
      if (touchScale <= 1.1) {
        setTouchScale(1);
        setTouchTranslate({ x: 0, y: 0 });
      }
    }
  };

  // Reset inline zoom
  const resetInlineZoom = () => {
    setTouchScale(1);
    setTouchTranslate({ x: 0, y: 0 });
    setIsHovering(false);
  };

  // Lightbox handlers
  const handleOpenLightbox = () => {
    setIsLightboxOpen(true);
    setLightboxScale(1.8);
    setLightboxPos({ x: 0, y: 0 });
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleLightboxZoomIn = () => {
    setLightboxScale((s) => Math.min(4, s + 0.5));
  };

  const handleLightboxZoomOut = () => {
    setLightboxScale((s) => Math.max(1, s - 0.5));
    if (lightboxScale <= 1.5) {
      setLightboxPos({ x: 0, y: 0 });
    }
  };

  const handleLightboxReset = () => {
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
  };

  // Lightbox mouse drag
  const handleLightboxMouseDown = (e: React.MouseEvent) => {
    if (lightboxScale > 1) {
      setIsDraggingLightbox(true);
      lightboxDragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: lightboxPos.x,
        posY: lightboxPos.y
      };
    }
  };

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (isDraggingLightbox && lightboxDragStartRef.current) {
      const dx = e.clientX - lightboxDragStartRef.current.x;
      const dy = e.clientY - lightboxDragStartRef.current.y;
      setLightboxPos({
        x: lightboxDragStartRef.current.posX + dx,
        y: lightboxDragStartRef.current.posY + dy
      });
    }
  };

  const handleLightboxMouseUp = () => {
    setIsDraggingLightbox(false);
  };

  // Gallery Navigation in Lightbox
  const currentIndex = gallery.indexOf(activeImage);
  const handlePrevImage = useCallback(() => {
    if (gallery.length > 1 && onSelectImage) {
      const prevIdx = (currentIndex - 1 + gallery.length) % gallery.length;
      onSelectImage(gallery[prevIdx]);
    }
  }, [currentIndex, gallery, onSelectImage]);

  const handleNextImage = useCallback(() => {
    if (gallery.length > 1 && onSelectImage) {
      const nextIdx = (currentIndex + 1) % gallery.length;
      onSelectImage(gallery[nextIdx]);
    }
  }, [currentIndex, gallery, onSelectImage]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrevImage, handleNextImage]);

  // Handle mouse wheel zoom in lightbox
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setLightboxScale((s) => Math.min(4, s + 0.25));
    } else {
      setLightboxScale((s) => {
        const next = Math.max(1, s - 0.25);
        if (next <= 1.1) setLightboxPos({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Lightbox touch handlers for pinch & pan
  const lightboxTouchDistRef = useRef<number | null>(null);
  const lightboxInitialScaleRef = useRef<number>(1);
  const lightboxLastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      lightboxTouchDistRef.current = dist;
      lightboxInitialScaleRef.current = lightboxScale;
    } else if (e.touches.length === 1) {
      lightboxLastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lightboxTouchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const factor = dist / lightboxTouchDistRef.current;
      const nextScale = Math.min(4.5, Math.max(1, lightboxInitialScaleRef.current * factor));
      setLightboxScale(nextScale);
      if (nextScale <= 1.05) {
        setLightboxPos({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && lightboxScale > 1 && lightboxLastTouchRef.current) {
      const dx = e.touches[0].clientX - lightboxLastTouchRef.current.x;
      const dy = e.touches[0].clientY - lightboxLastTouchRef.current.y;
      lightboxLastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      setLightboxPos((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lightboxTouchDistRef.current = null;
    }
    if (e.touches.length === 0) {
      lightboxLastTouchRef.current = null;
      if (lightboxScale <= 1.1) {
        setLightboxScale(1);
        setLightboxPos({ x: 0, y: 0 });
      }
    }
  };

  // Social Media Sharing via Web Share API
  const getProductShareData = () => {
    let shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    try {
      const url = new URL(window.location.href);
      if (product?.id) {
        url.searchParams.set('product', product.id);
      }
      shareUrl = url.toString();
    } catch {
      // fallback to current url
    }

    const shareTitle =
      (language === 'bn' ? (product?.titleBn || product?.title) : product?.title) ||
      alt ||
      'SmartBazaar Product';
    const sharePrice = product?.price ? `৳${product.price.toLocaleString()}` : '';
    const shareText =
      language === 'bn'
        ? `${shareTitle} ${sharePrice ? `(${sharePrice})` : ''} - SmartBazaar-এ দারুণ অফারে পাওয়া যাচ্ছে!`
        : `Check out ${shareTitle} ${sharePrice ? `for ${sharePrice}` : ''} on SmartBazaar!`;

    return {
      title: shareTitle,
      text: shareText,
      url: shareUrl
    };
  };

  const handleCopyLinkOnly = async () => {
    const { url } = getProductShareData();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShareStatus('copied');
      setShareToastText(
        language === 'bn' ? 'প্রোডাক্ট লিংক কপি হয়েছে!' : 'Product link copied!'
      );
      setTimeout(() => {
        setShareStatus('idle');
        setShareToastText(null);
      }, 2500);
    } catch {
      setShareStatus('error');
      setShareToastText(
        language === 'bn' ? 'লিংক কপি করা যায়নি' : 'Failed to copy link'
      );
      setTimeout(() => {
        setShareStatus('idle');
        setShareToastText(null);
      }, 2500);
    }
  };

  const handleShareProduct = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const shareData = getProductShareData();

    // 1. Native Web Share API trigger
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        setShareStatus('sharing');
        let canShare = true;
        if (typeof navigator.canShare === 'function') {
          try {
            canShare = navigator.canShare(shareData);
          } catch {
            canShare = true;
          }
        }

        if (canShare) {
          await navigator.share(shareData);
        } else {
          // If title + text + url fails canShare, share title and url
          await navigator.share({
            title: shareData.title,
            url: shareData.url
          });
        }

        setShareStatus('shared');
        setShareToastText(
          language === 'bn' ? 'সফলভাবে শেয়ার করা হয়েছে!' : 'Shared successfully!'
        );
        setTimeout(() => {
          setShareStatus('idle');
          setShareToastText(null);
        }, 2500);
        return;
      } catch (err: any) {
        // Dismissal / abort by user is expected, don't show error
        if (err?.name === 'AbortError') {
          setShareStatus('idle');
          return;
        }
        console.warn('Native Web Share API error, showing fallback:', err);
      }
    }

    // 2. Fallback: Copy link and display social options modal
    await handleCopyLinkOnly();
    setIsShareModalOpen(true);
  };

  const handleShareAnnotatedImage = async (
    blob: Blob,
    dataUrl: string,
    notesSummary: string
  ) => {
    setAnnotatedBlob(blob);
    setAnnotatedPreviewUrl(dataUrl);
    setAnnotatedNotesSummary(notesSummary);

    const shareData = getProductShareData();
    const customTitle = `${shareData.title} (Annotated Studio Note)`;
    const customText = notesSummary
      ? `"${notesSummary}" — Check out my highlighted notes on ${shareData.title}!`
      : `${shareData.text} (Check out my custom notes & highlights!)`;

    // Try native Web Share API with files first
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const file = new File(
          [blob],
          `smartbazaar-${product?.id || 'product'}-notes.png`,
          { type: 'image/png' }
        );

        let canShareFile = false;
        if (typeof navigator.canShare === 'function') {
          try {
            canShareFile = navigator.canShare({ files: [file] });
          } catch {
            canShareFile = false;
          }
        }

        if (canShareFile) {
          setShareStatus('sharing');
          await navigator.share({
            files: [file],
            title: customTitle,
            text: customText,
            url: shareData.url
          });
          setShareStatus('shared');
          setShareToastText(
            language === 'bn'
              ? 'হাইলাইট ও নোটসহ সফলভাবে শেয়ার হয়েছে!'
              : 'Annotated image shared successfully!'
          );
          setTimeout(() => {
            setShareStatus('idle');
            setShareToastText(null);
          }, 2800);
          return;
        } else {
          // If file sharing is not supported by device browser, share text/url
          setShareStatus('sharing');
          await navigator.share({
            title: customTitle,
            text: customText,
            url: shareData.url
          });
          setShareStatus('shared');
          setShareToastText(
            language === 'bn'
              ? 'লিংক শেয়ার হয়েছে! ছবি সংরক্ষিত আছে।'
              : 'Link shared! Annotated image ready.'
          );
          setTimeout(() => {
            setShareStatus('idle');
            setShareToastText(null);
          }, 2800);
          setIsShareModalOpen(true);
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setShareStatus('idle');
          return;
        }
        console.warn('Native file share error, falling back:', err);
      }
    }

    // Fallback: Copy link, try clipboard copy of image, and open social options modal
    await handleCopyLinkOnly();
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-2 select-none">
      {/* Main Image Container */}
      <div
        id="product-image-container"
        ref={containerRef}
        onClick={() => {
          if (activeHotspotId) setActiveHotspotId(null);
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`aspect-square w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 overflow-hidden relative shadow-2xs group ${
          is360Active
            ? isDragging360
              ? 'cursor-grabbing touch-none select-none'
              : 'cursor-grab touch-none select-none'
            : touchScale > 1 || isPinching
            ? 'touch-none cursor-crosshair'
            : 'touch-pan-y cursor-crosshair'
        }`}
      >
        {/* 360 Turntable Base Platform (rendered behind the product) */}
        {is360Active && (
          <div className="absolute inset-x-6 bottom-4 sm:bottom-6 h-20 pointer-events-none flex items-center justify-center z-5">
            {/* Ambient floor shadow */}
            <div
              className="w-4/5 h-10 rounded-[100%] bg-black/25 dark:bg-black/50 blur-md transition-transform"
              style={{
                transform: `scale(${1 + Math.sin((rotationAngle * Math.PI) / 180) * 0.06})`
              }}
            />
            {/* Turntable rotating ring with compass markers */}
            <div
              className="absolute w-3/4 h-12 rounded-[100%] border-2 border-dashed border-orange-500/50 dark:border-orange-400/50 flex items-center justify-center transition-transform"
              style={{
                transform: `rotateX(68deg) rotateZ(${rotationAngle}deg)`
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#f85606] shadow-sm shadow-orange-500 ring-2 ring-white/50" />
            </div>
          </div>
        )}

        {/* Render Image with dynamic zoom or 360 transform */}
        <div
          className={`w-full h-full flex items-center justify-center relative ${
            is360Active
              ? 'transition-none will-change-transform'
              : 'transition-transform ease-out will-change-transform'
          }`}
          style={{
            transform: is360Active
              ? `perspective(1000px) rotateY(${rotationAngle}deg) scaleX(${rotationAngle > 90 && rotationAngle < 270 ? -1 : 1}) scale(0.9)`
              : touchScale > 1
              ? `translate(${touchTranslate.x}px, ${touchTranslate.y}px) scale(${touchScale})`
              : isHovering
              ? 'scale(2.25)'
              : 'scale(1)',
            transformOrigin: is360Active ? '50% 50%' : `${mousePos.x}% ${mousePos.y}%`,
            transitionDuration: is360Active ? '0ms' : isPinching ? '0ms' : isHovering ? '120ms' : '250ms'
          }}
        >
          <img
            src={
              is360Active && gallery && gallery.length > 1
                ? gallery[Math.floor(((rotationAngle % 360) / 360) * gallery.length)] || activeImage || src
                : activeImage || src
            }
            alt={alt}
            className="w-full h-full object-cover pointer-events-none select-none transition-opacity duration-150"
            style={{
              filter: activePreset.filterCss,
              transition: 'filter 250ms ease-out, opacity 150ms ease-out'
            }}
            loading="eager"
          />

          {/* Preset Ambient Studio Lighting Overlay (Studio, Warm, Cool, Vintage) */}
          {activePreset.ambientOverlay && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
              style={{ background: activePreset.ambientOverlay }}
            />
          )}

          {/* Dynamic Studio Spotlight Sheen when 360 is active */}
          {is360Active && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity z-10"
              style={{
                background: `linear-gradient(${110 + Math.sin((rotationAngle * Math.PI) / 180) * 45}deg, transparent 35%, rgba(255, 255, 255, ${0.16 + Math.cos((rotationAngle * Math.PI) / 180) * 0.1}) 50%, transparent 65%)`
              }}
            />
          )}

          {/* Interactive Feature Hotspots (hidden while 360 turntable mode is active) */}
          {!is360Active && showHotspots && resolvedHotspots.length > 0 && resolvedHotspots.map((spot, index) => {
            const isSpotActive = activeHotspotId === spot.id;
            const staggerDelay = `${index * 0.45}s`;
            return (
              <div
                key={spot.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotId(prev => (prev === spot.id ? null : spot.id));
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                  }}
                  className={`group relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    isSpotActive ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                  aria-label={`${language === 'bn' ? 'ফিচার হটস্পট' : 'Feature Hotspot'}: ${language === 'bn' ? spot.titleBn : spot.title}`}
                  title={language === 'bn' ? spot.titleBn : spot.title}
                >
                  {/* Subtle Radar Wave 1 */}
                  {!isSpotActive && (
                    <span
                      className="absolute inset-0 rounded-full bg-orange-500/30 dark:bg-orange-400/30 hotspot-pulse-ring pointer-events-none"
                      style={{ animationDelay: staggerDelay }}
                    />
                  )}

                  {/* Subtle Radar Wave 2 (layered for smooth wave depth) */}
                  {!isSpotActive && (
                    <span
                      className="absolute inset-0 rounded-full bg-white/40 dark:bg-orange-400/20 hotspot-pulse-ring-delayed pointer-events-none"
                      style={{ animationDelay: `calc(${staggerDelay} + 1.2s)` }}
                    />
                  )}

                  {/* Pulsing Core Beacon Node with Category Icon */}
                  <span
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${
                      isSpotActive
                        ? 'bg-[#f85606] text-white border-white ring-4 ring-orange-500/40 shadow-orange-500/40'
                        : 'bg-[#0b1a30]/90 dark:bg-gray-900/90 text-yellow-300 hover:text-white border-white/95 dark:border-gray-700 hover:bg-[#f85606] backdrop-blur-xs hotspot-beacon-subtle'
                    }`}
                    style={!isSpotActive ? { animationDelay: staggerDelay } : undefined}
                  >
                    {spot.category === 'spec' ? (
                      <Cpu className="w-3.5 h-3.5" />
                    ) : spot.category === 'performance' ? (
                      <Zap className="w-3.5 h-3.5" />
                    ) : spot.category === 'material' ? (
                      <Layers className="w-3.5 h-3.5" />
                    ) : spot.category === 'warranty' ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>

                {/* Modern Floating Tooltip Component with Feature Part Info & Buy Now */}
                {isSpotActive && product && (
                  <HotspotFloatingTooltip
                    hotspot={spot}
                    product={product}
                    language={language}
                    onClose={() => setActiveHotspotId(null)}
                    onBuyNow={onBuyNow}
                    onAddToCart={onAddToCart}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Top Floating Controls Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-30">
          {/* Left Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-wrap">
            {discountPercent > 0 && !isHovering && touchScale === 1 && !is360Active && (
              <div className="bg-[#f85606] text-white text-[11px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-sm">
                -{discountPercent}% OFF
              </div>
            )}
            {isDarazMall && !isHovering && touchScale === 1 && !is360Active && (
              <div className="bg-[#0b1a30] text-yellow-400 text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>SmartMall</span>
              </div>
            )}
            {is360Active && (
              <div className="bg-[#0b1a30]/90 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'bn' ? '৩৬০° ইন্টারেক্টিভ স্পিন' : '360° Studio'}</span>
              </div>
            )}
            {/* Active Filter Preset Indicator Badge (shown when filter is non-default and panel is closed) */}
            {activePreset.id !== 'original' && !isFilterPanelOpen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilterPanelOpen(true);
                }}
                className="bg-black/80 hover:bg-black/95 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-orange-500/40 backdrop-blur-md cursor-pointer transition-all hover:scale-105"
                title={language === 'bn' ? 'ফিল্টার পরিবর্তন বা বন্ধ করুন' : 'Change or reset filter'}
              >
                <SlidersHorizontal className="w-3 h-3 text-orange-400" />
                <span>{language === 'bn' ? activePreset.nameBn : activePreset.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterId('original');
                  }}
                  className="text-gray-400 hover:text-white p-0.5 rounded-full hover:bg-white/20 transition ml-0.5"
                  title={language === 'bn' ? 'ফিল্টার রিসেট' : 'Reset filter'}
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              </button>
            )}
          </div>

          {/* Right: 360° View Button, Filters Button & Hotspots Visibility Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {/* Interactive '360° View' Floating Corner Button */}
            <button
              id="product-360-toggle-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIs360Active((prev) => {
                  const next = !prev;
                  if (next) {
                    setIsAutoRotating(true);
                    setActiveHotspotId(null);
                    resetInlineZoom();
                  }
                  return next;
                });
              }}
              className={`group flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black shadow-md transition-all duration-300 cursor-pointer backdrop-blur-md border ${
                is360Active
                  ? 'bg-gradient-to-r from-orange-500 via-[#f85606] to-amber-500 text-white border-white/50 shadow-orange-500/40 ring-2 ring-orange-400/50 scale-105'
                  : 'bg-white/95 dark:bg-gray-850/95 text-gray-800 dark:text-gray-100 hover:text-[#f85606] dark:hover:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs hover:scale-105'
              }`}
              title={language === 'bn' ? '৩৬০° ভিউ টগল করুন' : 'Toggle 360° view'}
              aria-label="360° View"
              aria-pressed={is360Active}
            >
              <div
                className={`relative flex items-center justify-center transition-transform ${
                  is360Active && isAutoRotating ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '3.5s' }}
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${
                    is360Active ? 'text-white' : 'text-[#f85606] dark:text-orange-400'
                  }`}
                />
              </div>
              <span>{language === 'bn' ? '৩৬০° ভিউ' : '360° View'}</span>
              {is360Active && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Interactive 'Filters' Preset Toggle Button */}
            <button
              id="product-filters-toggle-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterPanelOpen((prev) => !prev);
                setActiveHotspotId(null);
              }}
              className={`group flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-md transition-all duration-300 cursor-pointer backdrop-blur-md border ${
                isFilterPanelOpen || activePreset.id !== 'original'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-white/50 shadow-orange-500/30 ring-2 ring-orange-400/40 scale-105'
                  : 'bg-white/95 dark:bg-gray-850/95 text-gray-800 dark:text-gray-100 hover:text-[#f85606] dark:hover:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs hover:scale-105'
              }`}
              title={language === 'bn' ? 'স্টুডিও ফিল্টার প্রিসেট পরিবর্তন করুন' : 'Adjust studio lighting & filter presets'}
              aria-label="Image Filter Presets"
              aria-pressed={isFilterPanelOpen}
            >
              <SlidersHorizontal
                className={`w-3.5 h-3.5 ${
                  isFilterPanelOpen || activePreset.id !== 'original'
                    ? 'text-white'
                    : 'text-[#f85606] dark:text-orange-400'
                }`}
              />
              <span>
                {activePreset.id !== 'original'
                  ? (language === 'bn' ? activePreset.nameBn : activePreset.name)
                  : (language === 'bn' ? 'ফিল্টার' : 'Filters')}
              </span>
              {(isFilterPanelOpen || activePreset.id !== 'original') && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Interactive Drawing & Annotation Overlay Toggle Button */}
            <button
              id="product-annotate-toggle-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateContainerDimensions();
                setIsAnnotating((prev) => !prev);
                if (!isAnnotating) {
                  setIs360Active(false);
                  setActiveHotspotId(null);
                  resetInlineZoom();
                }
              }}
              className={`group flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-md transition-all duration-300 cursor-pointer backdrop-blur-md border ${
                isAnnotating
                  ? 'bg-gradient-to-r from-orange-500 via-[#f85606] to-amber-500 text-white border-white/50 shadow-orange-500/40 ring-2 ring-orange-400/50 scale-105'
                  : 'bg-white/95 dark:bg-gray-850/95 text-gray-800 dark:text-gray-100 hover:text-[#f85606] dark:hover:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs hover:scale-105 active:scale-95'
              }`}
              title={language === 'bn' ? 'পণ্যে ড্রয়িং ও কাস্টম নোট লিখুন' : 'Highlight areas & write custom notes on image'}
              aria-label="Annotate image"
              aria-pressed={isAnnotating}
            >
              <Highlighter className={`w-3.5 h-3.5 ${isAnnotating ? 'text-white' : 'text-[#f85606] dark:text-orange-400'}`} />
              <span>{language === 'bn' ? 'নোট / ড্র' : 'Annotate'}</span>
              {isAnnotating && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Hotspots Visibility Toggle Button */}
            {resolvedHotspots.length > 0 && !is360Active && !isHovering && touchScale === 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHotspots((prev) => !prev);
                  if (showHotspots) setActiveHotspotId(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer backdrop-blur-md border ${
                  showHotspots
                    ? 'bg-white/95 dark:bg-gray-850/95 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 shadow-orange-500/10'
                    : 'bg-black/60 text-gray-300 hover:text-white border-white/20'
                }`}
                title={language === 'bn' ? 'ফিচার হটস্পট টগল করুন' : 'Toggle feature hotspots'}
              >
                <Crosshair className="w-3.5 h-3.5 text-[#f85606]" />
                <span className="hidden sm:inline">
                  {language === 'bn' ? `হটস্পট (${resolvedHotspots.length})` : `Hotspots (${resolvedHotspots.length})`}
                </span>
                <span className="sm:hidden">{resolvedHotspots.length}</span>
                {showHotspots && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f85606] animate-pulse" />
                )}
              </button>
            )}

            {/* Social Media Sharing Button (Native Web Share API) */}
            <button
              id="product-share-btn"
              type="button"
              onClick={handleShareProduct}
              className={`group flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-md transition-all duration-300 cursor-pointer backdrop-blur-md border ${
                shareStatus === 'shared' || shareStatus === 'copied'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30 ring-2 ring-emerald-400/40 scale-105'
                  : 'bg-white/95 dark:bg-gray-850/95 text-gray-800 dark:text-gray-100 hover:text-[#f85606] dark:hover:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs hover:scale-105 active:scale-95'
              }`}
              title={language === 'bn' ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share product on social media'}
              aria-label="Share product"
            >
              {shareStatus === 'shared' || shareStatus === 'copied' ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-[#f85606] dark:text-orange-400 group-hover:scale-110 transition-transform" />
              )}
              <span>
                {shareStatus === 'shared'
                  ? (language === 'bn' ? 'শেয়ার্ড!' : 'Shared!')
                  : shareStatus === 'copied'
                  ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!')
                  : (language === 'bn' ? 'শেয়ার' : 'Share')}
              </span>
            </button>
          </div>
        </div>

        {/* 360° Interactive HUD Controls (shown when 360 mode is active) */}
        {is360Active && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2.5 sm:bottom-3 inset-x-2 sm:inset-x-3 z-30 bg-black/85 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 text-white border border-orange-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              {/* Play/Pause & Direction */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAutoRotating((prev) => !prev)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isAutoRotating
                      ? 'bg-[#f85606] text-white shadow-xs'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title={
                    isAutoRotating
                      ? (language === 'bn' ? 'অটো-ঘূর্ণন বন্ধ করুন' : 'Pause auto-rotation')
                      : (language === 'bn' ? 'অটো-ঘূর্ণন চালু করুন' : 'Resume auto-rotation')
                  }
                >
                  {isAutoRotating ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRotationDirection((d) => (d === 'cw' ? 'ccw' : 'cw'))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                  title={language === 'bn' ? 'ঘূর্ণনের দিক পরিবর্তন' : 'Change rotation direction'}
                >
                  {rotationDirection === 'cw' ? (
                    <RotateCw className="w-3.5 h-3.5" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Quick Angle Presets */}
                <div className="hidden xs:flex items-center gap-1 text-[10px] font-bold">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => {
                        setRotationAngle(deg);
                        setIsAutoRotating(false);
                      }}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                        Math.round(rotationAngle) === deg
                          ? 'bg-[#f85606] text-white'
                          : 'bg-white/10 hover:bg-white/20 text-gray-300'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle Readout & Exit 360 Button */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                  {Math.round(rotationAngle)}°
                </span>
                <button
                  type="button"
                  onClick={() => setIs360Active(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  title={language === 'bn' ? '৩৬০° ভিউ বন্ধ করুন' : 'Exit 360° view'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive 360 Scrubber Range Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 shrink-0 font-medium">0°</span>
              <input
                type="range"
                min="0"
                max="359"
                value={Math.round(rotationAngle)}
                onChange={(e) => {
                  setRotationAngle(Number(e.target.value));
                  setIsAutoRotating(false);
                }}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#f85606]"
              />
              <span className="text-[10px] text-gray-400 shrink-0 font-medium">360°</span>
            </div>

            {/* Interactive drag hint */}
            <div className="mt-1.5 text-center text-[10px] text-gray-300/80 font-medium flex items-center justify-center gap-1">
              <Move className="w-3 h-3 text-[#f85606]" />
              <span>
                {language === 'bn'
                  ? 'ছবিতে আঙুল বা মাউস টেনে ঘুরিয়ে দেখুন'
                  : 'Drag across product or use slider to rotate'}
              </span>
            </div>
          </div>
        )}

        {/* Real-time Image Filter Presets Floating Dock */}
        {isFilterPanelOpen && (
          <div
            id="product-filter-presets-panel"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2.5 sm:bottom-3 inset-x-2 sm:inset-x-3 z-40 bg-black/90 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 text-white border border-orange-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
          >
            {/* Header: Title + Active Preset Badge + Reset + Close */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-5 h-5 rounded-md bg-[#f85606] flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-white tracking-tight">
                  {language === 'bn' ? 'স্টুডিও ফিল্টার প্রিসেট' : 'Studio Filter Presets'}
                </span>
                {activePreset.id !== 'original' && (
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    {language === 'bn' ? activePreset.nameBn : activePreset.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activePreset.id !== 'original' && (
                  <button
                    type="button"
                    onClick={() => setActiveFilterId('original')}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-white/10"
                    title={language === 'bn' ? 'আসল ফিল্টারে ফিরে যান' : 'Reset to original'}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'bn' ? 'আসল' : 'Reset'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  title={language === 'bn' ? 'প্যানেল বন্ধ করুন' : 'Close presets panel'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Presets Horizontal Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
              {IMAGE_FILTER_PRESETS.map((preset) => {
                const isSelected = activeFilterId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setActiveFilterId(preset.id)}
                    className={`group/preset shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/20 border-[#f85606] shadow-md shadow-orange-500/20 ring-2 ring-orange-500/50 scale-105'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:scale-105'
                    }`}
                  >
                    {/* Color Swatch Circle with Icon */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${preset.previewGradient} flex items-center justify-center shadow-inner relative transition-transform ${
                        isSelected ? 'ring-2 ring-white' : 'group-hover/preset:ring-1 group-hover/preset:ring-white/50'
                      }`}
                    >
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                          <Check className="w-3 h-3 text-orange-400 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                          {preset.iconType === 'studio' ? (
                            <Sun className="w-3 h-3 text-amber-200" />
                          ) : preset.iconType === 'warm' ? (
                            <Flame className="w-3 h-3 text-orange-300" />
                          ) : preset.iconType === 'cool' ? (
                            <Droplets className="w-3 h-3 text-sky-200" />
                          ) : preset.iconType === 'vintage' ? (
                            <Camera className="w-3 h-3 text-amber-300" />
                          ) : preset.iconType === 'vibrant' ? (
                            <Sparkles className="w-3 h-3 text-pink-300" />
                          ) : preset.iconType === 'monochrome' ? (
                            <SlidersHorizontal className="w-3 h-3 text-gray-200" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-gray-300" />
                          )}
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap ${
                        isSelected ? 'text-orange-400' : 'text-gray-300'
                      }`}
                    >
                      {language === 'bn' ? preset.nameBn : preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Description Caption of Active Preset */}
            <div className="mt-1 text-[10px] text-gray-300/90 flex items-center justify-between gap-2 px-1">
              <span className="line-clamp-1">
                {language === 'bn' ? activePreset.descriptionBn : activePreset.description}
              </span>
              <span className="text-orange-400/90 shrink-0 font-bold hidden sm:inline">
                {language === 'bn' ? 'রিয়েল-টাইম প্রিভিউ' : 'Real-time Studio FX'}
              </span>
            </div>
          </div>
        )}

        {/* Hover / Pinch Indicator Bar & Action Buttons (Hidden when active hotspot, 360 view, or filter panel is active) */}
        {!activeHotspotId && !is360Active && !isFilterPanelOpen && (
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
            {/* Zoom hint badge */}
            <div className="bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/10 transition-opacity duration-200">
              {touchScale > 1 ? (
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  {Math.round(touchScale * 100)}%
                </span>
              ) : isHovering ? (
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" />
                  {language === 'bn' ? '২.২৫ গুণ জুম' : '2.25x Zoom'}
                </span>
              ) : (
                <>
                  <ZoomIn className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="hidden sm:inline">
                    {language === 'bn' ? 'মাউস রেখে বা পিঞ্চ করে জুম করুন' : 'Hover or pinch to zoom'}
                  </span>
                  <span className="sm:hidden">
                    {language === 'bn' ? 'পিঞ্চ বা ডাবল-ট্যাপে জুম' : 'Pinch or double tap to zoom'}
                  </span>
                </>
              )}
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {touchScale > 1 && (
                <button
                  type="button"
                  onClick={resetInlineZoom}
                  className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-850/90 text-gray-700 dark:text-gray-200 hover:text-[#f85606] dark:hover:text-orange-400 flex items-center justify-center shadow-md transition cursor-pointer border border-gray-200 dark:border-gray-700"
                  title={language === 'bn' ? 'রিসেট' : 'Reset zoom'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition cursor-pointer border hover:scale-105 ${
                  activePreset.id !== 'original'
                    ? 'bg-[#f85606] text-white border-orange-400 shadow-orange-500/30'
                    : 'bg-white/90 dark:bg-gray-850/90 text-gray-700 dark:text-gray-200 hover:text-[#f85606] dark:hover:text-orange-400 border-gray-200 dark:border-gray-700'
                }`}
                title={language === 'bn' ? 'স্টুডিও ফিল্টার প্রিসেট' : 'Image filter presets'}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Quick Annotate & Highlight Button */}
              <button
                id="product-annotate-quick-btn"
                type="button"
                onClick={() => {
                  updateContainerDimensions();
                  setIsAnnotating((prev) => !prev);
                  if (!isAnnotating) {
                    setIs360Active(false);
                    setActiveHotspotId(null);
                    resetInlineZoom();
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition cursor-pointer border hover:scale-105 active:scale-95 ${
                  isAnnotating
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-orange-500/30 ring-2 ring-orange-400/40'
                    : 'bg-white/90 dark:bg-gray-850/90 text-gray-700 dark:text-gray-200 hover:text-[#f85606] dark:hover:text-orange-400 border-gray-200 dark:border-gray-700'
                }`}
                title={language === 'bn' ? 'ড্রয়িং ও নোট হাইলাইটার' : 'Annotate and write custom notes'}
                aria-label="Annotate"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>

              {/* Quick Social Share Button (triggers Web Share API) */}
              <button
                id="product-share-quick-btn"
                type="button"
                onClick={handleShareProduct}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition cursor-pointer border hover:scale-105 active:scale-95 ${
                  shareStatus === 'shared' || shareStatus === 'copied'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30'
                    : 'bg-white/90 dark:bg-gray-850/90 text-gray-700 dark:text-gray-200 hover:text-[#f85606] dark:hover:text-orange-400 border-gray-200 dark:border-gray-700'
                }`}
                title={language === 'bn' ? 'পণ্য শেয়ার করুন' : 'Share product link'}
                aria-label="Share product link"
              >
                {shareStatus === 'shared' || shareStatus === 'copied' ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenLightbox}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-850/90 text-gray-700 dark:text-gray-200 hover:text-[#f85606] dark:hover:text-orange-400 flex items-center justify-center shadow-md transition cursor-pointer border border-gray-200 dark:border-gray-700 hover:scale-105"
                title={language === 'bn' ? 'ফুলস্ক্রিন জুম ভিউ' : 'Fullscreen inspection'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Drawing & Annotation Tool Overlay */}
        {isAnnotating && (
          <ProductAnnotationCanvas
            language={language}
            containerWidth={containerDimensions.width}
            containerHeight={containerDimensions.height}
            onClose={() => setIsAnnotating(false)}
            onShareAnnotated={handleShareAnnotatedImage}
            baseImageSrc={activeImage || src}
            filterCss={activePreset.filterCss}
          />
        )}

        {/* Floating Share Feedback Toast inside #product-image-container */}
        {shareToastText && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="bg-black/90 dark:bg-gray-900/95 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border border-emerald-500/50 flex items-center gap-2 backdrop-blur-md">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
              </div>
              <span>{shareToastText}</span>
            </div>
          </div>
        )}

        {/* Social Media Sharing Modal Sheet (Fallback & Multi-Platform) */}
        {isShareModalOpen && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsShareModalOpen(false);
            }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 safe-area-modal-overlay animate-in fade-in duration-150"
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 w-full max-w-sm max-h-[90dvh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-150 text-gray-800 dark:text-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-[#f85606]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">
                      {language === 'bn' ? 'পণ্যটি শেয়ার করুন' : 'Share this product'}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {language === 'bn' ? 'সোশ্যাল মিডিয়ায় বন্ধুদের সাথে শেয়ার করুন' : 'Share with friends across social platforms'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Annotated Image Preview Card (if user annotated notes before sharing) */}
              {annotatedPreviewUrl && (
                <div className="mb-3 rounded-xl overflow-hidden border border-orange-500/40 bg-orange-50/50 dark:bg-orange-950/30 p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'কাস্টম নোটসহ ছবি' : 'Annotated Highlight'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = annotatedPreviewUrl;
                        a.download = `smartbazaar-${product?.id || 'product'}-notes.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="text-[10px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#f85606] flex items-center gap-1 cursor-pointer bg-white/80 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 shadow-2xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                    </button>
                  </div>
                  <div className="relative aspect-video max-h-32 rounded-lg overflow-hidden bg-black/5 dark:bg-black/30 flex items-center justify-center border border-gray-200 dark:border-gray-800">
                    <img src={annotatedPreviewUrl} alt="Annotated note" className="w-full h-full object-contain" />
                  </div>
                  {annotatedNotesSummary && (
                    <p className="mt-1.5 text-[10px] font-semibold text-gray-700 dark:text-gray-300 italic line-clamp-2 bg-white/60 dark:bg-gray-850/60 p-1.5 rounded-md border border-orange-200/50 dark:border-orange-900/30">
                      "{annotatedNotesSummary}"
                    </p>
                  )}
                </div>
              )}

              {/* Social Channels Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${getProductShareData().text} ${getProductShareData().url}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/40 transition group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductShareData().url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/40 transition group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs font-black text-base group-hover:scale-110 transition-transform">
                    f
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Facebook</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getProductShareData().text)}&url=${encodeURIComponent(getProductShareData().url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-750 transition group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-xs font-black text-sm group-hover:scale-110 transition-transform">
                    𝕏
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">X / Twitter</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(getProductShareData().url)}&text=${encodeURIComponent(getProductShareData().text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200/60 dark:border-sky-800/40 transition group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Telegram</span>
                </a>
              </div>

              {/* Copy Direct Link Section */}
              <div className="bg-gray-50 dark:bg-gray-850 p-2 rounded-xl border border-gray-200 dark:border-gray-750 flex items-center justify-between gap-2">
                <input
                  type="text"
                  readOnly
                  value={getProductShareData().url}
                  className="bg-transparent text-[11px] text-gray-600 dark:text-gray-300 w-full outline-hidden font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLinkOnly}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer ${
                    shareStatus === 'copied'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#f85606] hover:bg-orange-600 text-white shadow-xs'
                  }`}
                >
                  {shareStatus === 'copied' ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{language === 'bn' ? 'কপি' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-70 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200 safe-area-modal-overlay"
          onMouseMove={handleLightboxMouseMove}
          onMouseUp={handleLightboxMouseUp}
        >
          {/* Top Bar Controls */}
          <div className="p-4 safe-area-top flex items-center justify-between text-white border-b border-white/10 z-10 bg-black/40">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white/90 line-clamp-1 max-w-xs sm:max-w-md">
                {alt}
              </span>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                {Math.round(lightboxScale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Preset Cycle Button in Lightbox */}
              <button
                type="button"
                onClick={() => {
                  const currIdx = IMAGE_FILTER_PRESETS.findIndex((p) => p.id === activeFilterId);
                  const nextIdx = (currIdx + 1) % IMAGE_FILTER_PRESETS.length;
                  setActiveFilterId(IMAGE_FILTER_PRESETS[nextIdx].id);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  activePreset.id !== 'original'
                    ? 'bg-[#f85606] text-white border-orange-400'
                    : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/15'
                }`}
                title={language === 'bn' ? 'ফিল্টার প্রিসেট পরিবর্তন করুন' : 'Cycle filter preset'}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">
                  {language === 'bn' ? activePreset.nameBn : activePreset.name}
                </span>
              </button>

              {/* Zoom Out Button */}
              <button
                type="button"
                onClick={handleLightboxZoomOut}
                disabled={lightboxScale <= 1}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition cursor-pointer"
                title={language === 'bn' ? 'জুম আউট' : 'Zoom out'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Zoom In Button */}
              <button
                type="button"
                onClick={handleLightboxZoomIn}
                disabled={lightboxScale >= 4}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition cursor-pointer"
                title={language === 'bn' ? 'জুম ইন' : 'Zoom in'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleLightboxReset}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title={language === 'bn' ? 'রিসেট' : 'Reset'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Share Button in Lightbox */}
              <button
                type="button"
                onClick={handleShareProduct}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title={language === 'bn' ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share product on social media'}
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-2 rounded-xl bg-white/15 hover:bg-red-600 text-white transition cursor-pointer ml-2"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Interactive Image Canvas */}
          <div
            className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 touch-none select-none ${
              lightboxScale > 1 ? (isDraggingLightbox ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
            onMouseDown={handleLightboxMouseDown}
            onWheel={handleWheel}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {/* Gallery Previous Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#f85606] text-white flex items-center justify-center border border-white/20 transition cursor-pointer active:scale-95 shadow-lg"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Draggable/Zoomable Image */}
            <div
              className="transition-transform duration-100 ease-out will-change-transform max-w-full max-h-full flex items-center justify-center"
              style={{
                transform: `translate(${lightboxPos.x}px, ${lightboxPos.y}px) scale(${lightboxScale})`
              }}
            >
              <img
                src={activeImage || src}
                alt={alt}
                className="max-w-[85vw] max-h-[75vh] object-contain rounded-lg select-none pointer-events-none drop-shadow-2xl"
                style={{
                  filter: activePreset.filterCss,
                  transition: 'filter 250ms ease-out'
                }}
                draggable={false}
              />
            </div>

            {/* Gallery Next Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#f85606] text-white flex items-center justify-center border border-white/20 transition cursor-pointer active:scale-95 shadow-lg"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {gallery.length > 1 && (
            <div className="p-3 safe-area-bottom bg-black/50 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto z-10">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onSelectImage) onSelectImage(img);
                    setLightboxPos({ x: 0, y: 0 });
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    activeImage === img
                      ? 'border-[#f85606] ring-2 ring-orange-500/50 scale-105'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
