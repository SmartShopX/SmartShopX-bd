import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AuthState,
  CartItem,
  Category,
  CustomerSession,
  DeliveryAddress,
  Order,
  Product,
  Review,
  Voucher
} from './types';
import { MOCK_CATEGORIES } from './data/mockProducts';
import { StorageService } from './services/storageService';
import { AuthService } from './services/marketplaceService';
import { Navbar } from './components/Navbar';
import { HeroBannerSlider } from './components/HeroBannerSlider';
import { CategoryBar } from './components/CategoryBar';
import { FlashSaleSection } from './components/FlashSaleSection';
import { DarazMallSection } from './components/DarazMallSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickBuyModal } from './components/QuickBuyModal';
import { OrdersModal } from './components/OrdersModal';
import { VoucherCenterModal } from './components/VoucherCenterModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CustomerCareModal } from './components/CustomerCareModal';
import { SellerModal } from './components/SellerModal';
import { StoreProfileModal } from './components/StoreProfileModal';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { SizeGuideModal } from './components/SizeGuideModal';
import { ProductCompareModal } from './components/ProductCompareModal';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { RateDeliveryModal } from './components/RateDeliveryModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationService, AppNotification } from './services/notificationService';
import { RecommendedForYou } from './components/RecommendedForYou';
import { Footer } from './components/Footer';
import { ProfileDrawer } from './components/ProfileDrawer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { OfflineBanner } from './components/OfflineBanner';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { SmartHisabModal } from './components/SmartHisabModal';
import { InvoiceModal } from './components/InvoiceModal';
import { FloatingSMSAlert } from './components/FloatingSMSAlert';
import { PixelAnalyticsService } from './services/pixelAnalyticsService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  Home,
  Heart,
  ShoppingCart,
  Package,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowUpDown,
  Scale,
  Gift,
  Zap,
  User
} from 'lucide-react';

export default function App() {
  // 1. Language state
  const [language, setLanguage] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('smartshopx_lang') as 'bn' | 'en') || 'bn';
  });

  const handleSetLanguage = (lang: 'bn' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('smartshopx_lang', lang);
  };

  // Theme state with localStorage & html class binding
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('smartshopx_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('smartshopx_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 2. Online/Offline & Sync Pipeline (Section 7, 8, 9)
  const {
    isOnline,
    simulatedOffline,
    toggleSimulatedOffline,
    pendingSyncCount,
    triggerSync,
    justSyncedToast,
    dismissSyncedToast,
    refreshPendingCount
  } = useOnlineStatus((syncedCount) => {
    if (syncedCount > 0) {
      setOrders(StorageService.getOrders());
    }
  });

  // 3. Products & Catalog
  const [products, setProducts] = useState<Product[]>(() => {
    return StorageService.initializeCatalog();
  });
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);

  // 4. Cart & Wishlist & Viewed History
  const [cart, setCart] = useState<CartItem[]>(() => StorageService.getCart());
  const [wishlist, setWishlist] = useState<string[]>(() => StorageService.getWishlist());
  const [viewedHistory, setViewedHistory] = useState<string[]>(() => StorageService.getViewedHistory());

  // 5. Product Comparison State
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  // 6. User Account & Rewards (P1 Customer Hardened)
  const [session, setSession] = useState<CustomerSession>(() => AuthService.getSession());
  const [authState, setAuthState] = useState<AuthState>(() => AuthService.getAuthState());
  const [userAddress, setUserAddress] = useState<DeliveryAddress>(() => StorageService.getAddress());
  const [coins, setCoins] = useState<number>(() => StorageService.getCoins());
  const [vouchers, setVouchers] = useState<Voucher[]>(() => StorageService.getVouchers());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders(AuthService.getSession().customerId));
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    const last = localStorage.getItem('smartshopx_last_checkin');
    const today = new Date().toDateString();
    return last === today;
  });

  // Auth & User Account Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [userProfileInitialTab, setUserProfileInitialTab] = useState<'info' | 'addresses' | 'orders' | 'rewards' | 'security'>('info');

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenAccount = (tab: 'info' | 'addresses' | 'orders' | 'rewards' | 'security' = 'info') => {
    if (session.isAuthenticated) {
      setUserProfileInitialTab(tab);
      setIsUserProfileModalOpen(true);
    } else {
      handleOpenAuth('login');
    }
  };

  const handleAuthSuccess = (newSession: CustomerSession, isNewUser?: boolean) => {
    setSession(newSession);
    setAuthState('AUTHENTICATED');
    setOrders(StorageService.getOrders(newSession.customerId));
    setWishlist(StorageService.getWishlist(newSession.customerId));
    setUserAddress(StorageService.getAddress());
    setCoins(StorageService.getCoins());
    setVouchers(StorageService.getVouchers());

    if (isNewUser) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(
        language === 'bn'
          ? '🎉 অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং +৫০ কয়েন যোগ হয়েছে।'
          : '🎉 Welcome! Account created & +50 bonus coins added.'
      );
    } else {
      showToast(
        language === 'bn'
          ? `🌟 স্বাগতম, ${newSession.displayName || newSession.fullName}!`
          : `🌟 Welcome back, ${newSession.displayName || newSession.fullName}!`
      );
    }
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    setCart((prev) => {
      const updated = [...prev];
      order.items.forEach((it) => {
        const existingIdx = updated.findIndex((c) => c.product.id === it.product.id);
        if (existingIdx > -1) {
          updated[existingIdx].quantity += it.quantity;
        } else {
          updated.push({
            product: it.product,
            quantity: it.quantity,
            selectedColor: it.selectedColor,
            selectedSize: it.selectedSize
          });
        }
      });
      return updated;
    });
    setIsCartOpen(true);
    showToast(
      language === 'bn'
        ? '🛒 পূর্বের অর্ডারের পণ্যগুলো কার্টে যোগ করা হয়েছে!'
        : '🛒 Reorder items successfully added to cart!'
    );
  };

  const handleLogin = async (credentials?: { phone?: string; email?: string }) => {
    const res = await AuthService.login(credentials);
    if (res.success) {
      handleAuthSuccess(res.session, false);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    const guestSession: CustomerSession = {
      customerId: 'CUST-GUEST',
      displayName: 'গেস্ট ব্যবহারকারী',
      fullName: 'গেস্ট ব্যবহারকারী',
      phone: '',
      email: '',
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      mode: 'demo_session'
    };
    setSession(guestSession);
    setAuthState('LOGGED_OUT');
    showToast(
      language === 'bn'
        ? '🚪 অ্যাকাউন্ট থেকে সফলভাবে লগআউট করা হয়েছে।'
        : '🚪 Successfully logged out from your account.'
    );
  };

  // 7. Search, Filtering, and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterDarazMall, setFilterDarazMall] = useState(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');

  // 8. Modals / Drawers State
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSellerOpen, setIsSellerOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [ratingDeliveryOrder, setRatingDeliveryOrder] = useState<Order | null>(null);
  const [isRateDeliveryOpen, setIsRateDeliveryOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSmartHisabOpen, setIsSmartHisabOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return NotificationService.getStoredNotifications();
  });

  useEffect(() => {
    PixelAnalyticsService.trackPageView('SmartShopX.bd - বাংলাদেশের স্মার্ট ই-কমার্স');
  }, []);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return NotificationService.getPermission();
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Store Landing Page State & URL Query Sync (?store=STORE_001)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('store');
    }
    return null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedStoreId(params.get('store'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    const newUrl = `${window.location.pathname}?store=${encodeURIComponent(storeId)}`;
    window.history.pushState({ storeId }, '', newUrl);
  };

  const handleCloseStore = () => {
    setSelectedStoreId(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const currentStore = selectedStoreId ? StorageService.getStoreById(selectedStoreId) || null : null;

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Quick toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to storage
  useEffect(() => {
    StorageService.saveCart(cart);
  }, [cart]);

  useEffect(() => {
    StorageService.saveWishlist(wishlist);
  }, [wishlist]);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantityOrEvent?: number | React.MouseEvent,
    options?: { color?: string; size?: string }
  ) => {
    const qty = typeof quantityOrEvent === 'number' ? quantityOrEvent : 1;
    const color = options?.color;
    const size = options?.size;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      } else {
        return [...prev, { product, quantity: qty, selectedColor: color, selectedSize: size }];
      }
    });

    showToast(
      language === 'bn'
        ? `"${product.titleBn.slice(0, 20)}..." কার্টে যুক্ত হয়েছে!`
        : `Added "${product.title.slice(0, 20)}..." to cart!`
    );
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast(language === 'bn' ? 'পণ্য কার্ট থেকে সরানো হয়েছে।' : 'Item removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast(language === 'bn' ? 'কার্ট খালি করা হয়েছে।' : 'Cart cleared.');
  };

  // 1-Click Quick Buy Trigger
  const handleQuickBuy = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQuickBuyProduct(product);
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      let next: string[];
      if (prev.includes(productId)) {
        showToast(language === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে।' : 'Removed from wishlist.');
        next = prev.filter((id) => id !== productId);
      } else {
        showToast(language === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Added to wishlist!');
        next = [...prev, productId];
      }
      StorageService.saveWishlist(next);
      return next;
    });
  };

  // Open product detail & track browsing history in localStorage
  const handleOpenProductDetail = (product: Product) => {
    if (!product) return;
    setSelectedProductForModal(product);
    if (product.id) {
      const updated = StorageService.recordProductView(product.id);
      setViewedHistory(updated);
    }
  };

  // Deep Link Handling: Check URL query params on initial load to open shared product
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedProdId = urlParams.get('product');
      if (sharedProdId && products.length > 0) {
        const found = products.find((p) => p.id === sharedProdId);
        if (found) {
          setSelectedProductForModal(found);
        }
      }
    } catch {
      // ignore
    }
  }, [products]);

  // Sync URL search params with active product modal
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedProductForModal) {
        if (url.searchParams.get('product') !== selectedProductForModal.id) {
          url.searchParams.set('product', selectedProductForModal.id);
          window.history.replaceState({}, '', url.toString());
        }
      } else if (url.searchParams.has('product')) {
        url.searchParams.delete('product');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // ignore
    }
  }, [selectedProductForModal]);

  // Clear viewed history
  const handleClearHistory = () => {
    StorageService.clearViewedHistory();
    setViewedHistory([]);
    showToast(language === 'bn' ? 'ব্রাউজিং হিস্ট্রি সফলভাবে মোছা হয়েছে।' : 'Viewing history cleared.');
  };

  // Product Comparison Handlers
  const handleToggleCompare = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setComparedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        showToast(language === 'bn' ? 'তুলনা তালিকা থেকে সরানো হয়েছে।' : 'Removed from comparison.');
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        showToast(language === 'bn' ? 'সর্বোচ্চ ৪টি পণ্য তুলনা করা যাবে।' : 'You can compare up to 4 items.');
        return prev;
      }
      showToast(language === 'bn' ? 'তুলনা তালিকায় যোগ হয়েছে!' : 'Added to comparison list!');
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearCompare = () => {
    setComparedProducts([]);
    showToast(language === 'bn' ? 'তুলনা তালিকা খালি করা হয়েছে।' : 'Comparison cleared.');
  };

  // Add Review Handler
  const handleAddReview = (productId: string, review: Review) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedReviews = [review, ...p.reviews];
          const newAvg = Number(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          return {
            ...p,
            reviews: updatedReviews,
            rating: newAvg,
            reviewCount: p.reviewCount + 1
          };
        }
        return p;
      })
    );
    showToast(language === 'bn' ? 'আপনার মূল্যবান রিভিউ গৃহীত হয়েছে! ধন্যবাদ।' : 'Thank you for your verified review!');
  };

  // Lucky Spin Reward Handler
  const handleWinReward = (type: 'coins' | 'voucher', val: number, text: string) => {
    if (type === 'coins') {
      const updated = coins + val;
      setCoins(updated);
      StorageService.saveCoins(updated);
    } else {
      // Add special voucher
      const newVoucher: Voucher = {
        code: `SPIN${val}`,
        titleEn: `৳${val} OFF Lucky Spin Special`,
        titleBn: `৳${val} লাকি স্পিন স্পেশাল ভাউচার`,
        discountType: 'fixed',
        discountValue: val,
        minSpend: 500,
        expiresAt: '২০২৬-১২-৩১',
        isCollected: true,
        badge: 'LUCKY WIN',
        badgeBn: 'লাকি উইন'
      };
      setVouchers((prev) => [newVoucher, ...prev]);
    }
    showToast(text);
  };

  // Voucher collect
  const handleCollectVoucher = (code: string) => {
    const updated = vouchers.map((v) => (v.code === code ? { ...v, isCollected: true } : v));
    setVouchers(updated);
    StorageService.saveVouchers(updated);
    showToast(language === 'bn' ? 'ভাউচার সংগ্রহ সম্পন্ন হয়েছে!' : 'Voucher collected successfully!');
  };

  // Daily Coins Check-In
  const handleDailyCheckIn = () => {
    const today = new Date().toDateString();
    const newCoins = coins + 50;
    setCoins(newCoins);
    StorageService.saveCoins(newCoins);
    localStorage.setItem('smartshopx_last_checkin', today);
    setHasCheckedInToday(true);
    showToast(language === 'bn' ? 'অভিনন্দন! আপনি ৫০টি স্মার্ট কয়েন পেয়েছেন।' : 'Congrats! You received 50 Smart Coins.');
  };

  // Order placed (Online or Offline with Idempotency & Queue Protection)
  const handleOrderPlaced = (newOrder: Order, wasOffline: boolean) => {
    // 1. Place order via StorageService ensuring pending queue & idempotency
    const res = StorageService.placeOrder(newOrder, !wasOffline);
    setOrders(StorageService.getOrders());
    refreshPendingCount();

    // 2. Clear cart
    setCart([]);
    StorageService.saveCart([]);

    if (wasOffline || res.isOffline) {
      showToast(
        language === 'bn'
          ? '📱 অফলাইন অর্ডার সংরক্ষিত হয়েছে! ইন্টারনেট পেলে স্বয়ংক্রিয়ভাবে প্রসেস হবে।'
          : '📱 Order saved locally! Will sync when connection is restored.'
      );
    } else {
      showToast(
        language === 'bn'
          ? `🎉 অর্ডার #${newOrder.id} সফল হয়েছে! কুরিয়ারে পাঠানো হচ্ছে।`
          : `🎉 Order #${newOrder.id} placed successfully!`
      );
    }
  };

  // Open Rate Delivery Modal
  const handleOpenRateDelivery = (order: Order) => {
    setRatingDeliveryOrder(order);
    setIsRateDeliveryOpen(true);
  };

  // Advance Order Lifecycle (Confirmed -> Packed -> Shipped -> Delivered)
  const handleAdvanceOrderStatus = (orderId?: string) => {
    const result = StorageService.advanceOrderStatus(orderId);
    if (result.changedOrder && result.newStatus) {
      setOrders(result.updatedOrders);

      // Trigger browser notification
      NotificationService.sendOrderStatusNotification(
        result.changedOrder,
        result.newStatus,
        language,
        (ord, action) => {
          if (action === 'rate_delivery') {
            setRatingDeliveryOrder(ord);
            setIsRateDeliveryOpen(true);
          } else {
            setIsOrdersOpen(true);
          }
        }
      ).then((newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });

      // Show toast
      showToast(
        language === 'bn'
          ? `🚚 অর্ডার #${result.changedOrder.id} এর স্ট্যাটাস আপডেট হয়েছে!`
          : `🚚 Order #${result.changedOrder.id} status updated!`
      );

      // If delivered, trigger rate delivery prompt after brief delay
      if (result.newStatus === 'delivered') {
        setTimeout(() => {
          setRatingDeliveryOrder(result.changedOrder);
          setIsRateDeliveryOpen(true);
        }, 1200);
      }
    }
  };

  // Direct Jump to a specific delivery stage (0: Confirmed, 1: Packed, 2: Shipped, 3: Delivered)
  const handleSetOrderStage = (orderId: string, stageIdx: number) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const steps = [...(targetOrder.trackingSteps || [])];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    for (let i = 0; i < steps.length; i++) {
      if (i <= stageIdx) {
        steps[i] = {
          ...steps[i],
          completed: true,
          time: steps[i].time || nowStr
        };
      } else {
        steps[i] = {
          ...steps[i],
          completed: false
        };
      }
    }

    const statuses: ('processing' | 'shipped' | 'delivered')[] = ['processing', 'processing', 'shipped', 'delivered'];
    const newStatus = statuses[stageIdx] || 'processing';

    const updatedOrder: Order = {
      ...targetOrder,
      status: stageIdx === 3 ? 'confirmed' : targetOrder.status,
      trackingSteps: steps
    };

    const updatedOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o));
    StorageService.saveOrders(updatedOrders);
    setOrders(updatedOrders);

    NotificationService.sendOrderStatusNotification(
      updatedOrder,
      newStatus,
      language,
      (ord, action) => {
        if (action === 'rate_delivery') {
          setRatingDeliveryOrder(ord);
          setIsRateDeliveryOpen(true);
        } else {
          setIsOrdersOpen(true);
        }
      }
    ).then((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    if (stageIdx === 3) {
      setTimeout(() => {
        setRatingDeliveryOrder(updatedOrder);
        setIsRateDeliveryOpen(true);
      }, 1000);
    }
  };

  // Handle Delivery Rating Submission
  const handleSubmitDeliveryRating = (
    orderId: string,
    ratingData: { rating: number; comment: string; tags: string[] }
  ) => {
    const updatedOrders = StorageService.updateOrderDeliveryRating(orderId, ratingData);
    setOrders(updatedOrders);

    // Reward +10 coins
    const updatedCoins = coins + 10;
    setCoins(updatedCoins);
    StorageService.saveCoins(updatedCoins);

    showToast(
      language === 'bn'
        ? '🌟 ধন্যবাদ! আপনার ডেলিভারি রেটিং গৃহীত হয়েছে এবং +১০ কয়েন যোগ হয়েছে।'
        : '🌟 Thank you! Delivery rating submitted & +10 coins added.'
    );
  };

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q) || p.titleBn.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q) || p.categoryBn.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchCategory) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    // SmartMall filter
    if (filterDarazMall && !p.isDarazMall) {
      return false;
    }

    // Free delivery filter
    if (filterFreeDelivery && !p.isFreeDelivery) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.soldCount - a.soldCount;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0e14] text-[#111827] dark:text-[#f9fafb] flex flex-col font-sans pb-24 sm:pb-0 transition-colors">
      {/* 1. Top Header & Navbar */}
      <Navbar
        language={language}
        setLanguage={handleSetLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        session={session}
        onOpenAuth={handleOpenAuth}
        onOpenAccount={handleOpenAccount}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        compareCount={comparedProducts.length}
        unreadNotificationsCount={unreadNotificationsCount}
        coins={coins}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        allProducts={products}
        stores={StorageService.getStores()}
        onSelectProduct={handleOpenProductDetail}
        onSelectStore={(st) => handleOpenStore(st.id)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenVouchers={() => setIsVouchersOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSeller={() => setIsSellerOpen(true)}
        onOpenSpin={() => setIsSpinOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSmartHisab={() => setIsSmartHisabOpen(true)}
      />

      {/* Real-Time Online / Offline & Sync Banner (Section 6, 7, 9) */}
      <OfflineBanner
        isOnline={isOnline}
        simulatedOffline={simulatedOffline}
        toggleSimulatedOffline={toggleSimulatedOffline}
        pendingSyncCount={pendingSyncCount}
        triggerSync={triggerSync}
        justSyncedToast={justSyncedToast}
        dismissSyncedToast={dismissSyncedToast}
        language={language}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-4 z-50 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="bg-[#0b1a30] dark:bg-gray-800 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xl border border-orange-500/40 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#f85606]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 xs:px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
        {/* If no search query active: Show Hero Banners, Categories, Flash Sales, and Daraz Mall */}
        {!searchQuery && selectedCategory === 'all' && (
          <>
            {/* Hero Slider */}
            <HeroBannerSlider
              language={language}
              onCategorySelect={(catId) => setSelectedCategory(catId)}
              onOpenVouchers={() => setIsVouchersOpen(true)}
            />

            {/* Flash Sale Countdown Section */}
            <FlashSaleSection
              products={products}
              language={language}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onSelectProduct={handleOpenProductDetail}
            />

            {/* SmartMall Official Showcase */}
            <DarazMallSection
              products={products}
              language={language}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onSelectProduct={handleOpenProductDetail}
              onSelectStore={handleOpenStore}
            />
          </>
        )}

        {/* Category Filter Bar */}
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
          language={language}
          filterDarazMall={filterDarazMall}
          setFilterDarazMall={setFilterDarazMall}
          filterFreeDelivery={filterFreeDelivery}
          setFilterFreeDelivery={setFilterFreeDelivery}
        />

        {/* Main Product Showcase Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs transition-colors">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-lg font-extrabold text-gray-900 dark:text-gray-100">
                {searchQuery
                  ? (language === 'bn' ? `"${searchQuery}" এর ফলাফল:` : `Search results for "${searchQuery}":`)
                  : selectedCategory === 'all'
                  ? (language === 'bn' ? 'শুধু আপনার জন্য বাছাইকৃত পণ্য' : 'Just For You')
                  : (language === 'bn'
                      ? `${categories.find((c) => c.id === selectedCategory)?.nameBn} কালেকশন`
                      : `${categories.find((c) => c.id === selectedCategory)?.name} Collection`)}
              </h2>
              <span className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-semibold">
                ({sortedProducts.length} {language === 'bn' ? 'টি পণ্য' : 'items'})
              </span>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs self-start sm:self-auto">
              <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 text-[11px] sm:text-xs shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                {language === 'bn' ? 'সর্ট করুন:' : 'Sort By:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 font-semibold text-[11px] sm:text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-[#f85606] cursor-pointer min-h-[34px]"
              >
                <option value="popular">{language === 'bn' ? 'জনপ্রিয়তা (Best Match)' : 'Popularity'}</option>
                <option value="price_low">{language === 'bn' ? 'কম দাম থেকে বেশি' : 'Price: Low to High'}</option>
                <option value="price_high">{language === 'bn' ? 'বেশি দাম থেকে কম' : 'Price: High to Low'}</option>
                <option value="rating">{language === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Top Customer Rating'}</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-10 text-center border border-gray-100 dark:border-gray-800 shadow-2xs space-y-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#f85606] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                {language === 'bn' ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No products found'}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার সার্চ ফিল্টার পরিবর্তন করুন অথবা সকল ক্যাটাগরিতে ফিরে যান।'
                  : 'Try adjusting your filters or search keywords.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setFilterDarazMall(false);
                  setFilterFreeDelivery(false);
                }}
                className="bg-[#f85606] hover:bg-[#d84a05] text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer min-h-[38px]"
              >
                {language === 'bn' ? 'সব পণ্য দেখুন' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onSelectProduct={handleOpenProductDetail}
                  onQuickBuy={(p, e) => handleQuickBuy(p, e)}
                  isCompared={comparedProducts.some((p) => p.id === product.id)}
                  onToggleCompare={(p, e) => handleToggleCompare(p, e)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recommended for You (Based on Wishlist & Viewed History) */}
        <RecommendedForYou
          products={products}
          wishlist={wishlist}
          viewedHistory={viewedHistory}
          language={language}
          onSelectProduct={handleOpenProductDetail}
          onAddToCart={handleAddToCart}
          onQuickBuy={(p, e) => handleQuickBuy(p, e)}
          onToggleWishlist={handleToggleWishlist}
          onToggleCompare={(p, e) => handleToggleCompare(p, e)}
          comparedProductIds={comparedProducts.map((p) => p.id)}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex items-center justify-around text-[10px] font-bold text-gray-600 dark:text-gray-400">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            selectedCategory === 'all' && !searchQuery
              ? 'text-[#f85606] font-black bg-orange-50/80 dark:bg-orange-950/40'
              : 'hover:text-[#f85606] dark:hover:text-[#f85606]'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${selectedCategory === 'all' && !searchQuery ? 'scale-110' : ''}`} />
          <span className="mt-0.5">{language === 'bn' ? 'হোম' : 'Home'}</span>
        </button>

        <button
          onClick={() => setIsSpinOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-amber-500 hover:text-amber-600 dark:text-amber-400 transition-all cursor-pointer min-h-[44px]"
        >
          <Gift className="w-5 h-5 animate-bounce" />
          <span className="mt-0.5">{language === 'bn' ? 'স্পিন' : 'Spin'}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl hover:text-[#f85606] dark:hover:text-[#f85606] transition-all cursor-pointer min-h-[44px] relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#f85606] text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </div>
          <span className="mt-0.5">{language === 'bn' ? 'কার্ট' : 'Cart'}</span>
        </button>

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl hover:text-[#f85606] dark:hover:text-[#f85606] transition-all cursor-pointer min-h-[44px] relative"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="mt-0.5">{language === 'bn' ? 'পছন্দ' : 'Wishlist'}</span>
        </button>

        <button
          onClick={() => setIsOrdersOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl hover:text-[#f85606] dark:hover:text-[#f85606] transition-all cursor-pointer min-h-[44px]"
        >
          <Package className="w-5 h-5" />
          <span className="mt-0.5">{language === 'bn' ? 'অর্ডার' : 'Orders'}</span>
        </button>

        <button
          onClick={() => setIsProfileOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            isProfileOpen
              ? 'text-[#f85606] font-black bg-orange-50/80 dark:bg-orange-950/40'
              : 'hover:text-[#f85606] dark:hover:text-[#f85606]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="mt-0.5">{language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}</span>
        </button>
      </nav>

      {/* Footer */}
      <Footer language={language} />

      {/* Floating Support & WhatsApp Widget */}
      <FloatingSupportWidget
        language={language}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenCustomerCare={() => setIsHelpOpen(true)}
      />

      {/* Modals & Drawers */}
      {/* 1. Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          language={language}
          isOnline={isOnline}
          isWishlisted={wishlist.includes(selectedProductForModal.id)}
          onClose={() => setSelectedProductForModal(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={(p, qty, opts) => handleAddToCart(p, qty, opts)}
          onBuyNow={(p, qty, opts) => handleQuickBuy(p)}
          onOpenSizeGuide={(cat) => setIsSizeGuideOpen(true)}
          onOpenWriteReview={(p) => setReviewProduct(p)}
          onToggleCompare={(p) => handleToggleCompare(p)}
          isCompared={comparedProducts.some((p) => p.id === selectedProductForModal.id)}
          onViewStore={(storeId) => handleOpenStore(storeId)}
        />
      )}

      {/* 2. 1-Click Quick Buy Modal */}
      {quickBuyProduct && (
        <QuickBuyModal
          isOpen={!!quickBuyProduct}
          onClose={() => setQuickBuyProduct(null)}
          product={quickBuyProduct}
          language={language}
          isOnline={isOnline}
          userAddress={userAddress}
          onSaveAddress={(addr) => {
            setUserAddress(addr);
            StorageService.saveAddress(addr);
          }}
          onOrderPlaced={handleOrderPlaced}
          vouchers={vouchers}
        />
      )}

      {/* 3. Product Comparison Modal */}
      <ProductCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={comparedProducts}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
        onAddToCart={(p) => handleAddToCart(p)}
        onQuickBuy={(p) => handleQuickBuy(p)}
        language={language}
      />

      {/* 4. Fashion Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        language={language}
      />

      {/* 5. Daily Spin Wheel Modal */}
      <LuckyWheelModal
        isOpen={isSpinOpen}
        onClose={() => setIsSpinOpen(false)}
        coins={coins}
        onWinReward={handleWinReward}
        language={language}
      />

      {/* 6. Write Customer Review Modal */}
      {reviewProduct && (
        <WriteReviewModal
          isOpen={!!reviewProduct}
          onClose={() => setReviewProduct(null)}
          product={reviewProduct}
          onAddReview={handleAddReview}
          language={language}
        />
      )}

      {/* 7. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onOpenVouchers={() => setIsVouchersOpen(true)}
      />

      {/* 8. Full Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        language={language}
        isOnline={isOnline}
        userAddress={userAddress}
        onSaveAddress={(addr) => {
          setUserAddress(addr);
          StorageService.saveAddress(addr);
        }}
        vouchers={vouchers}
        coins={coins}
        onCoinsUsed={(used) => {
          const rem = Math.max(0, coins - used);
          setCoins(rem);
          StorageService.saveCoins(rem);
        }}
        onOrderPlaced={handleOrderPlaced}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 9. Orders Tracker Modal with Interactive Progress Tracker */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        language={language}
        isOnline={isOnline}
        onTriggerSync={triggerSync}
        onOpenRateDelivery={handleOpenRateDelivery}
        onAdvanceOrderStatus={handleAdvanceOrderStatus}
        onSetOrderStage={handleSetOrderStage}
      />

      {/* 9.5. Rate Your Delivery Modal */}
      {isRateDeliveryOpen && ratingDeliveryOrder && (
        <RateDeliveryModal
          isOpen={isRateDeliveryOpen}
          onClose={() => {
            setIsRateDeliveryOpen(false);
            setRatingDeliveryOrder(null);
          }}
          order={ratingDeliveryOrder}
          language={language}
          onSubmitRating={handleSubmitDeliveryRating}
        />
      )}

      {/* 9.6. Real-Time Order Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        permission={notificationPermission}
        onRequestPermission={async () => {
          const perm = await NotificationService.requestPermission();
          setNotificationPermission(perm);
          if (perm === 'granted') {
            showToast(
              language === 'bn'
                ? '🔔 নোটিফিকেশন সক্রিয় হয়েছে! ব্যাকগ্রাউন্ডেও ডেলিভারি আপডেট পাবেন।'
                : '🔔 Notifications enabled! You will receive background delivery updates.'
            );
          }
        }}
        onMarkAllAsRead={() => {
          const updated = NotificationService.markAllAsRead();
          setNotifications(updated);
        }}
        onSelectNotification={(notif) => {
          setIsNotificationCenterOpen(false);
          const matchedOrder = orders.find((o) => o.id === notif.orderId);
          if (notif.actionType === 'rate_delivery' && matchedOrder) {
            setRatingDeliveryOrder(matchedOrder);
            setIsRateDeliveryOpen(true);
          } else {
            setIsOrdersOpen(true);
          }
        }}
        onSimulateStatusChange={() => {
          handleAdvanceOrderStatus();
        }}
        language={language}
      />

      {/* 10. Vouchers Center Modal */}
      <VoucherCenterModal
        isOpen={isVouchersOpen}
        onClose={() => setIsVouchersOpen(false)}
        vouchers={vouchers}
        onCollectVoucher={handleCollectVoucher}
        coins={coins}
        onDailyCheckIn={handleDailyCheckIn}
        hasCheckedInToday={hasCheckedInToday}
        language={language}
      />

      {/* 11. Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        allProducts={products}
        language={language}
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={(p, e) => handleAddToCart(p, e)}
        onSelectProduct={handleOpenProductDetail}
      />

      {/* 12. Customer Care Modal */}
      <CustomerCareModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={language}
      />

      {/* 13. Sell on SmartShopX Modal */}
      <SellerModal
        isOpen={isSellerOpen}
        onClose={() => setIsSellerOpen(false)}
        language={language}
      />

      {/* 14. User Profile & Settings Drawer (with Dedicated Theme Switcher & Customer Authentication) */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        setLanguage={handleSetLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSetTheme={(t) => setTheme(t)}
        coins={coins}
        vouchers={vouchers}
        orders={orders}
        wishlistCount={wishlist.length}
        compareCount={comparedProducts.length}
        unreadNotificationsCount={unreadNotificationsCount}
        userAddress={userAddress}
        authState={authState}
        session={session}
        onLogin={() => handleOpenAuth('login')}
        onLogout={handleLogout}
        onOpenAccountModal={(tab) => handleOpenAccount(tab)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenVouchers={() => setIsVouchersOpen(true)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenSpin={() => setIsSpinOpen(true)}
        onOpenSeller={() => setIsSellerOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 15. User Authentication Modal (Registration / Login / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalInitialMode}
      />

      {/* 16. Customer User Profile & Address Book Management Modal */}
      {session.isAuthenticated && (
        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          language={language}
          session={session}
          orders={orders}
          vouchers={vouchers}
          coins={coins}
          userAddress={userAddress}
          onUpdateSession={(updated) => setSession(updated)}
          onUpdateAddress={(updated) => setUserAddress(updated)}
          onLogout={handleLogout}
          onReorder={handleReorder}
          onOpenRateDelivery={(ord) => {
            setIsUserProfileModalOpen(false);
            setRatingDeliveryOrder(ord);
            setIsRateDeliveryOpen(true);
          }}
          initialTab={userProfileInitialTab}
        />
      )}

      {/* 17. Dedicated Store Landing Page Modal */}
      {currentStore && (
        <StoreProfileModal
          isOpen={!!currentStore}
          onClose={handleCloseStore}
          store={currentStore}
          products={products}
          language={language}
          onSelectProduct={handleOpenProductDetail}
          onAddToCart={(p, qty) => handleAddToCart(p, qty)}
          onQuickBuy={(p) => handleQuickBuy(p)}
          onCollectVoucher={(code) => handleCollectVoucher(code)}
        />
      )}

      {/* 18. Business & Merchant Admin Dashboard Suite */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={(updated) => setProducts(updated)}
        orders={orders}
        onUpdateOrders={(updated) => setOrders(updated)}
        language={language}
        onOpenInvoice={(ord) => {
          setSelectedInvoiceOrder(ord);
          setIsInvoiceOpen(true);
        }}
      />

      {/* 19. Smart Hisab (হিসাব খাতা ও ক্যাশ ম্যানেজমেন্ট) Suite */}
      <SmartHisabModal
        isOpen={isSmartHisabOpen}
        onClose={() => setIsSmartHisabOpen(false)}
        orders={orders}
        language={language}
      />

      {/* 20. Printable Money Receipt & Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setSelectedInvoiceOrder(null);
        }}
        order={selectedInvoiceOrder}
        language={language}
      />

      {/* 20. Live SMS Notification Simulator Floating Banner */}
      <FloatingSMSAlert />
    </div>
  );
}
