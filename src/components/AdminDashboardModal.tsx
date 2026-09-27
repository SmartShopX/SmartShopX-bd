import React, { useState } from 'react';
import {
  Product,
  Order,
  Store,
  Category,
  CartItem
} from '../types';
import { SMSService, SMSGatewayConfig, SMSLog } from '../services/smsService';
import { PixelAnalyticsService, PixelConfig, TrackingEventLog } from '../services/pixelAnalyticsService';
import { StorageService } from '../services/storageService';
import { SupabaseService } from '../services/supabaseService';
import {
  X,
  TrendingUp,
  Package,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Store as StoreIcon,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  FileText,
  Smartphone,
  ShieldCheck,
  Zap,
  Globe,
  RefreshCw,
  Search,
  Sliders,
  DollarSign,
  Database
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (updated: Order[]) => void;
  language: 'bn' | 'en';
  onOpenInvoice: (order: Order) => void;
}

type TabType = 'overview' | 'products' | 'orders' | 'payments' | 'sms' | 'pixel' | 'multivendor' | 'supabase';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  language,
  onOpenInvoice
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment settings state
  const [paymentConfig, setPaymentConfig] = useState(() => {
    const saved = localStorage.getItem('smartshopx_payment_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      bkashNumber: '01700-112233',
      bkashType: 'Merchant',
      bkashQR: 'https://images.unsplash.com/photo-1595079672139-5470805086ae?w=300&auto=format&fit=crop&q=80',
      nagadNumber: '01800-445566',
      nagadType: 'Merchant',
      rocketNumber: '01900-778899',
      isAutoVerifyEnabled: true,
      codEnabled: true
    };
  });

  // SMS Gateway config state
  const [smsConfig, setSmsConfig] = useState<SMSGatewayConfig>(() => SMSService.getConfig());
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>(() => SMSService.getLogs());
  const [testPhone, setTestPhone] = useState('01700000000');
  const [testName, setTestName] = useState('আহমেদ হাসান');

  // Pixel Config state
  const [pixelConfig, setPixelConfig] = useState<PixelConfig>(() => PixelAnalyticsService.getConfig());
  const [pixelLogs, setPixelLogs] = useState<TrackingEventLog[]>(() => PixelAnalyticsService.getLogs());

  // Multi-vendor applicants mock
  const [vendorApplicants, setVendorApplicants] = useState([
    { id: 'VND-01', shopName: 'ঢাকা গ্যাজেট মার্ট', owner: 'রাকিব আহমেদ', phone: '01711223344', category: 'গ্যাজেট', status: 'approved', commission: '8%' },
    { id: 'VND-02', shopName: 'আড়ং ক্লথিং কালেকশন', owner: 'তানজিলা হক', phone: '01822334455', category: 'ফ্যাশন', status: 'pending', commission: '10%' },
    { id: 'VND-03', shopName: 'সিলেট অর্গানিক বাজার', owner: 'মাহমুদ করিম', phone: '01933445566', category: 'গ্রোসারি', status: 'pending', commission: '6%' }
  ]);

  // New Product Form state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdTitleBn, setNewProdTitleBn] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(1200);
  const [newProdOrigPrice, setNewProdOrigPrice] = useState(1800);
  const [newProdCategory, setNewProdCategory] = useState('smartphones');
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  // Stats calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  const handleSavePaymentConfig = () => {
    localStorage.setItem('smartshopx_payment_config', JSON.stringify(paymentConfig));
    alert(language === 'bn' ? 'পেমেন্ট গেটওয়ে সেটিংস সংরক্ষিত হয়েছে!' : 'Payment gateway settings saved successfully!');
  };

  const handleSaveSmsConfig = () => {
    SMSService.saveConfig(smsConfig);
    alert(language === 'bn' ? 'বাল্ক এসএমএস গেটওয়ে সেটিংস সংরক্ষিত হয়েছে!' : 'SMS gateway configuration saved!');
  };

  const handleSendTestSms = () => {
    const log = SMSService.sendSMS({
      phone: testPhone,
      name: testName,
      orderId: 'DARAZ-TEST99',
      type: 'placed',
      amount: 2500
    });
    setSmsLogs(SMSService.getLogs());
  };

  const handleSavePixelConfig = () => {
    PixelAnalyticsService.saveConfig(pixelConfig);
    alert(language === 'bn' ? 'ফেসবুক পিক্সেল ও GA4 ট্র্যাকিং কনফিগারেশন সেভ হয়েছে!' : 'Pixel & GA4 configurations saved!');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdTitleBn) return;

    const discountPercent = Math.round(((newProdOrigPrice - newProdPrice) / newProdOrigPrice) * 100);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: newProdTitle,
      titleBn: newProdTitleBn,
      description: 'প্রিমিয়াম কোয়ালিটি পণ্য, দ্রুত হোম ডেলিভারি ও মানিব্যাক গ্যারান্টি।',
      descriptionBn: 'প্রিমিয়াম কোয়ালিটি পণ্য, দ্রুত হোম ডেলিভারি ও মানিব্যাক গ্যারান্টি।',
      price: Number(newProdPrice),
      originalPrice: Number(newProdOrigPrice),
      discountPercent: discountPercent > 0 ? discountPercent : 0,
      rating: 5.0,
      reviewCount: 1,
      category: newProdCategory,
      categoryBn: newProdCategory,
      image: newProdImage,
      gallery: [newProdImage],
      brand: 'SmartShopX Premium',
      isDarazMall: true,
      isFreeDelivery: true,
      isFlashSale: true,
      stock: Number(newProdStock),
      soldCount: 0,
      soldPercent: 5,
      tags: ['New', 'Trending', 'Hot'],
      seller: {
        name: 'SmartShopX Official Mall',
        rating: 99,
        responseRate: '100%',
        location: 'ঢাকা',
        joinedYear: 2026
      },
      reviews: []
    };

    const updated = [newProduct, ...products];
    onUpdateProducts(updated);
    StorageService.saveProducts(updated);
    setIsAddProductOpen(false);
    alert(language === 'bn' ? 'নতুন পণ্য সফলভাবে স্টোরে যুক্ত হয়েছে!' : 'New product created successfully!');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত এই পণ্যটি ডিলিট করতে চান?' : 'Are you sure to delete this product?')) {
      const updated = products.filter((p) => p.id !== id);
      onUpdateProducts(updated);
      StorageService.saveProducts(updated);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          trackingSteps: o.trackingSteps.map((step, idx) => {
            if (newStatus === 'confirmed' && idx <= 1) return { ...step, completed: true };
            if (newStatus === 'shipped' && idx <= 2) return { ...step, completed: true };
            if (newStatus === 'delivered') return { ...step, completed: true };
            return step;
          })
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    StorageService.saveOrders(updated);

    // Auto send Bangla SMS
    const matched = orders.find((o) => o.id === orderId);
    if (matched) {
      if (newStatus === 'confirmed') {
        SMSService.sendSMS({ phone: matched.address.phone, name: matched.address.fullName, orderId: matched.id, type: 'confirmed', amount: matched.finalAmount });
      } else if (newStatus === 'shipped') {
        SMSService.sendSMS({ phone: matched.address.phone, name: matched.address.fullName, orderId: matched.id, type: 'shipped', amount: matched.finalAmount });
      } else if (newStatus === 'delivered') {
        SMSService.sendSMS({ phone: matched.address.phone, name: matched.address.fullName, orderId: matched.id, type: 'delivered', amount: matched.finalAmount });
      }
      setSmsLogs(SMSService.getLogs());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[94vh] rounded-3xl bg-slate-900 text-slate-100 shadow-2xl flex flex-col border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a3871] via-[#0b1a30] to-[#f85606] p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <StoreIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  SmartShopX.bd Business & Merchant Control Center
                </h3>
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Admin PRO
                </span>
              </div>
              <p className="text-xs text-white/80">
                পেমেন্ট গেটওয়ে • বাল্ক এসএমএস • ফেসবুক পিক্সেল • প্রোডাক্ট ও মাল্টি-ভেন্ডর হাব
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0 text-xs">
          {[
            { id: 'overview', label: '📊 ওভারভিউ ও রিপোর্ট', icon: BarChart3 },
            { id: 'products', label: '📦 প্রোডাক্ট ও স্টক', icon: Package },
            { id: 'orders', label: '🚚 অর্ডার ও ডেলিভারি', icon: ShoppingCart },
            { id: 'payments', label: '💳 বিকাশ/নগদ পেমেন্ট', icon: CreditCard },
            { id: 'sms', label: '📱 বাল্ক এসএমএস গেটওয়ে', icon: Smartphone },
            { id: 'pixel', label: '📈 ফেসবুক পিক্সেল ও GA4', icon: TrendingUp },
            { id: 'multivendor', label: '🏬 মাল্টি-ভেন্ডর হাব', icon: StoreIcon },
            { id: 'supabase', label: '🗄️ Supabase ক্লাউড ডাটাবেজ', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-[#f85606] text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/90 text-slate-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">মোট বিক্রয় রেভিনিউ</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    ৳{totalRevenue.toLocaleString('en-US')}
                  </h3>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                    <TrendingUp className="w-3 h-3" /> +18.4% এই মাসে
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">মোট অর্ডার সংখ্যা</span>
                    <ShoppingCart className="w-4 h-4 text-[#f85606]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">{orders.length} টি</h3>
                  <p className="text-[10px] text-slate-400 mt-1">পেন্ডিং: {pendingOrders} টি</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">মোট লাইভ প্রোডাক্ট</span>
                    <Package className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">{products.length} টি</h3>
                  <p className="text-[10px] text-cyan-400 mt-1">সব ক্যাটাগরি সক্রিয়</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">এসএমএস ডেলিভারি</span>
                    <Smartphone className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">{smsLogs.length} টি</h3>
                  <p className="text-[10px] text-purple-400 mt-1">100% অটোমেটেড</p>
                </div>
              </div>

              {/* Quick Actions & Live Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> কুইক বিজনেস ম্যানেজমেন্ট
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => { setActiveTab('products'); setIsAddProductOpen(true); }}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left font-bold transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-[#f85606]" /> নতুন প্রোডাক্ট যোগ করুন
                    </button>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left font-bold transition flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-pink-400" /> বিকাশ/নগদ নাম্বার চেঞ্জ
                    </button>
                    <button
                      onClick={() => setActiveTab('sms')}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left font-bold transition flex items-center gap-2"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" /> SMS টেমপ্লেট সেট করুন
                    </button>
                    <button
                      onClick={() => setActiveTab('pixel')}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left font-bold transition flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4 text-blue-400" /> Facebook Pixel ID বসান
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="font-bold text-sm text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" /> সাম্প্রতিক অর্ডার নোটিফিকেশন
                    </span>
                    <span className="text-[10px] text-slate-400">{orders.length} টি রেকর্ড</span>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {orders.slice(0, 4).map((o) => (
                      <div key={o.id} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{o.id} • {o.address.fullName}</p>
                          <p className="text-[11px] text-slate-400">{o.address.phone} • {o.items.length} টি পণ্য</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-[#f85606]">৳{o.finalAmount}</span>
                          <span className="block text-[9px] uppercase font-bold text-slate-400">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-base text-white">প্রোডাক্ট ও ইনভেন্টরি ক্যাটালগ</h4>
                  <p className="text-xs text-slate-400">দোকানের সব পণ্যের দাম, ছবি, স্টক ও তথ্য ম্যানেজ করুন</p>
                </div>
                <button
                  onClick={() => setIsAddProductOpen(!isAddProductOpen)}
                  className="bg-[#f85606] hover:bg-[#e04d05] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start"
                >
                  <Plus className="w-4 h-4" /> {isAddProductOpen ? 'ফর্ম লুকান' : 'নতুন পণ্য যোগ করুন'}
                </button>
              </div>

              {/* Add Product Inline Form */}
              {isAddProductOpen && (
                <form onSubmit={handleCreateProduct} className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-4 animate-in slide-in-from-top-3">
                  <h5 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-700 pb-2">
                    <Plus className="w-4 h-4 text-[#f85606]" /> নতুন প্রোডাক্টের তথ্য পূরণ করুন
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">প্রোডাক্টের নাম (বাংলায়) *</label>
                      <input
                        type="text"
                        required
                        value={newProdTitleBn}
                        onChange={(e) => setNewProdTitleBn(e.target.value)}
                        placeholder="যেমন: স্মার্ট নয়েজ ক্যানসেলিং ইয়ারবাডস"
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-[#f85606]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Product Title (English) *</label>
                      <input
                        type="text"
                        required
                        value={newProdTitle}
                        onChange={(e) => setNewProdTitle(e.target.value)}
                        placeholder="e.g. Wireless Noise Cancelling Earbuds"
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-[#f85606]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">বিক্রয় মূল্য (৳) *</label>
                      <input
                        type="number"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-[#f85606]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">পূর্বের মূল্য (অরিজিনাল রেগুলার প্রাইজ) (৳)</label>
                      <input
                        type="number"
                        value={newProdOrigPrice}
                        onChange={(e) => setNewProdOrigPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-[#f85606]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">ক্যাটাগরি</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-[#f85606]"
                      >
                        <option value="smartphones">স্মার্টফোন ও গ্যাজেট</option>
                        <option value="fashion">ফ্যাশন ও পোশাক</option>
                        <option value="appliances">হোম অ্যাপ্লায়েন্স</option>
                        <option value="groceries">গ্রোসারি ও হেলথ</option>
                        <option value="watches">ঘড়ি ও এক্সেসরিজ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">স্টক পরিমাণ (ইনভেন্টরি)</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-[#f85606]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-semibold mb-1">পণ্যের ছবির লিংক (Image URL)</label>
                      <input
                        type="url"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-[#f85606]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-xs"
                  >
                    সেভ ও পাবলিশ করুন
                  </button>
                </form>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">পণ্য</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">মূল্য</th>
                      <th className="p-3">স্টক</th>
                      <th className="p-3">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="p-3 flex items-center gap-2.5">
                          <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0" />
                          <div>
                            <p className="font-bold text-white line-clamp-1">{p.titleBn || p.title}</p>
                            <p className="text-[10px] text-slate-400">{p.brand} • {p.id}</p>
                          </div>
                        </td>
                        <td className="p-3 text-slate-300">{p.categoryBn || p.category}</td>
                        <td className="p-3 font-mono font-bold text-[#f85606]">৳{p.price.toLocaleString('en-US')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock > 10 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {p.stock} টি
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & AUTOMATIC SMS TRACKER */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-base text-white">অর্ডার ম্যানেজমেন্ট ও লাইভ এসএমএস অটোমেশন</h4>
                <p className="text-xs text-slate-400">
                  অর্ডারের স্ট্যাটাস পরিবর্তন করলেই গ্রাহকের নম্বরে সরাসরি বাংলা এসএমএস চলে যাবে
                </p>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-white text-sm">#{ord.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ord.status === 'delivered' ? 'bg-emerald-900 text-emerald-300' :
                            ord.status === 'shipped' ? 'bg-blue-900 text-blue-300' :
                            ord.status === 'confirmed' ? 'bg-purple-900 text-purple-300' : 'bg-amber-900 text-amber-300'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          গ্রাহক: <span className="font-bold text-white">{ord.address.fullName}</span> ({ord.address.phone}) • {ord.address.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenInvoice(ord)}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>ইনভয়েস / প্রিন্ট</span>
                        </button>
                        <span className="font-mono text-base font-black text-[#f85606]">
                          ৳{ord.finalAmount.toLocaleString('en-US')}
                        </span>
                      </div>
                    </div>

                    {/* Status change actions with auto SMS */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <span className="text-slate-400 text-[11px]">স্ট্যাটাস পরিবর্তন ও গ্রাহককে অটো SMS পাঠান:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'confirmed')}
                          className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl border border-purple-700 font-bold transition cursor-pointer"
                        >
                          ✓ কনফার্ম করুন (SMS যাবে)
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'shipped')}
                          className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded-xl border border-blue-700 font-bold transition cursor-pointer"
                        >
                          🚚 কুরিয়ারে হস্তান্তর (SMS যাবে)
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                          className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded-xl border border-emerald-700 font-bold transition cursor-pointer"
                        >
                          🎁 ডেলিভারি সম্পন্ন (SMS যাবে)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS CONFIG (BKASH, NAGAD, ROCKET, COD) */}
          {activeTab === 'payments' && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h4 className="font-bold text-base text-white">বিকাশ ও নগদ পেমেন্ট গেটওয়ে সেটিংস</h4>
                <p className="text-xs text-slate-400">
                  চেকআউটে গ্রাহকদের আপনার যে বিকাশ ও নগদ একাউন্টে টাকা পাঠানোর তথ্য দেওয়া হবে তা এখানে লিখুন
                </p>
              </div>

              <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
                {/* bKash Configuration */}
                <div className="p-4 rounded-xl bg-slate-900 border border-pink-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-400 text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> bKash (বিকাশ) একাউন্ট কনফিগারেশন
                    </span>
                    <span className="bg-pink-950 text-pink-300 text-[10px] font-black px-2 py-0.5 rounded border border-pink-800">
                      সক্রিয়
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">বিকাশ মার্চেন্ট / পার্সোনাল নম্বর *</label>
                      <input
                        type="text"
                        value={paymentConfig.bkashNumber}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, bkashNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 text-white rounded-xl border border-slate-700 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">একাউন্টের ধরন</label>
                      <select
                        value={paymentConfig.bkashType}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, bkashType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs"
                      >
                        <option value="Merchant">বিকাশ মার্চেন্ট (Make Payment)</option>
                        <option value="Personal">বিকাশ পার্সোনাল (Send Money)</option>
                        <option value="Agent">বিকাশ এজেন্ট (Cash Out)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Nagad Configuration */}
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Nagad (নগদ) একাউন্ট কনফিগারেশন
                    </span>
                    <span className="bg-amber-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded border border-amber-800">
                      সক্রিয়
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">নগদ নম্বর *</label>
                      <input
                        type="text"
                        value={paymentConfig.nagadNumber}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, nagadNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 text-white rounded-xl border border-slate-700 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">একাউন্টের ধরন</label>
                      <select
                        value={paymentConfig.nagadType}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, nagadType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs"
                      >
                        <option value="Merchant">মার্চেন্ট পে</option>
                        <option value="Personal">পার্সোনাল সেন্ড মানি</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rocket and COD switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Rocket (রকেট) নম্বর</label>
                    <input
                      type="text"
                      value={paymentConfig.rocketNumber}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, rocketNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700 mt-4">
                    <span className="text-slate-300 font-semibold">ক্যাশ অন ডেলিভারি (COD) চালু রাখুন</span>
                    <input
                      type="checkbox"
                      checked={paymentConfig.codEnabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, codEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#f85606] rounded"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePaymentConfig}
                  className="bg-[#f85606] hover:bg-[#e04d05] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  পেমেন্ট সেটিংস সেভ করুন
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: BULK SMS GATEWAY */}
          {activeTab === 'sms' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-base text-white">বাল্ক এসএমএস গেটওয়ে ইন্টিগ্রেশন (Greenweb / Reve / Onnorokom)</h4>
                <p className="text-xs text-slate-400">
                  বাংলাদেশের যেকোনো বাল্ক এসএমএস এপিআই যুক্ত করে গ্রাহকদের ইনস্ট্যান্ট বাংলা এসএমএস পাঠান
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Configuration form */}
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
                  <h5 className="font-bold text-sm text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" /> গেটওয়ে এপিআই সেটিংস
                  </h5>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">এসএমএস প্রোভাইডার নির্বাচন করুন</label>
                      <select
                        value={smsConfig.provider}
                        onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700"
                      >
                        <option value="greenweb">Greenweb SMS Gateway (Bangladesh)</option>
                        <option value="reve">REVE SMS Gateway</option>
                        <option value="onnorokom">Onnorokom SMS</option>
                        <option value="alpha">Alpha SMS BD</option>
                        <option value="twilio">Twilio Global SMS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Gateway API Token / Key</label>
                      <input
                        type="text"
                        value={smsConfig.apiKey}
                        onChange={(e) => setSmsConfig({ ...smsConfig, apiKey: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Sender ID (মাস্কিং বা নন-মাস্কিং নাম)</label>
                      <input
                        type="text"
                        value={smsConfig.senderId}
                        onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">অর্ডার তৈরির পর বাংলা SMS টেমপ্লেট</label>
                      <textarea
                        rows={2}
                        value={smsConfig.orderPlacedTemplate}
                        onChange={(e) => setSmsConfig({ ...smsConfig, orderPlacedTemplate: e.target.value })}
                        className="w-full p-2.5 bg-slate-900 text-white rounded-xl border border-slate-700"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSaveSmsConfig}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition cursor-pointer"
                      >
                        সেটিংস সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test SMS Sender & Live Logs */}
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
                  <h5 className="font-bold text-sm text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-purple-400" /> টেস্ট SMS পাঠান
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">গ্রাহকের ফোন নম্বর</label>
                      <input
                        type="text"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">গ্রাহকের নাম</label>
                      <input
                        type="text"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendTestSms}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    এখনই টেস্ট SMS পাঠান
                  </button>

                  <h6 className="font-bold text-xs text-slate-300 pt-2 border-t border-slate-700">
                    সাম্প্রতিক পাঠানো SMS লগস ({smsLogs.length} টি)
                  </h6>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {smsLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-emerald-400">{log.recipientPhone}</span>
                          <span className="text-slate-500">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FACEBOOK PIXEL & GA4 */}
          {activeTab === 'pixel' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-base text-white">ফেসবুক পিক্সেল ও গুগল অ্যানালিটিক্স ৪ (GA4) ট্র্যাকিং</h4>
                <p className="text-xs text-slate-400">
                  ফেসবুক বুস্টিং এবং ক্যাম্পেইনের রিয়েল-টাইম কনভার্সন ট্র্যাক করতে পিক্সেল আইডি বসান
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
                  <h5 className="font-bold text-sm text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" /> পিক্সেল ও GA4 আইডি বসান
                  </h5>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-semibold">Meta Pixel ID (Facebook)</label>
                        <input
                          type="checkbox"
                          checked={pixelConfig.isPixelEnabled}
                          onChange={(e) => setPixelConfig({ ...pixelConfig, isPixelEnabled: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </div>
                      <input
                        type="text"
                        value={pixelConfig.pixelId}
                        onChange={(e) => setPixelConfig({ ...pixelConfig, pixelId: e.target.value })}
                        placeholder="e.g. 849201948271034"
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-semibold">Google Analytics 4 Measurement ID</label>
                        <input
                          type="checkbox"
                          checked={pixelConfig.isGa4Enabled}
                          onChange={(e) => setPixelConfig({ ...pixelConfig, isGa4Enabled: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </div>
                      <input
                        type="text"
                        value={pixelConfig.ga4MeasurementId}
                        onChange={(e) => setPixelConfig({ ...pixelConfig, ga4MeasurementId: e.target.value })}
                        placeholder="e.g. G-SX8492019"
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Conversions API Access Token (CAPI)</label>
                      <input
                        type="password"
                        value={pixelConfig.conversionsApiToken}
                        onChange={(e) => setPixelConfig({ ...pixelConfig, conversionsApiToken: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 font-mono text-xs"
                      />
                    </div>

                    <button
                      onClick={handleSavePixelConfig}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      পিক্সেল কনফিগারেশন সেভ করুন
                    </button>
                  </div>
                </div>

                {/* Real-time event log */}
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-3">
                  <h5 className="font-bold text-sm text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" /> লাইভ পিক্সেল ইভেন্ট স্ট্রিম
                    </span>
                    <button
                      onClick={() => {
                        PixelAnalyticsService.logEvent('TestEvent', { time: Date.now() });
                        setPixelLogs(PixelAnalyticsService.getLogs());
                      }}
                      className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300 font-bold"
                    >
                      টেস্ট ইভেন্ট ফায়ার
                    </button>
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    ব্যবহারকারীরা পেজ দেখলে, কার্টে নিলে বা অর্ডার দিলে স্বয়ংক্রিয়ভাবে ইভেন্ট রেকর্ড হবে
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {pixelLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-400">{log.eventName}</span>
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">{log.source}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {JSON.stringify(log.params)}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MULTI-VENDOR MARKETPLACE */}
          {activeTab === 'multivendor' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-base text-white">মাল্টি-ভেন্ডর মার্কেটপ্লেস ও সেলার ম্যানেজমেন্ট</h4>
                <p className="text-xs text-slate-400">দারাজের মতো বিভিন্ন বিক্রেতাদের দোকান অনুমোদন ও কমিশন নির্ধারণ করুন</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">দোকানের নাম</th>
                      <th className="p-3">মালিকের নাম ও ফোন</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">মার্কেটপ্লেস কমিশন</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {vendorApplicants.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-white">{v.shopName}</td>
                        <td className="p-3">
                          <p>{v.owner}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{v.phone}</p>
                        </td>
                        <td className="p-3">{v.category}</td>
                        <td className="p-3 font-bold text-[#f85606]">{v.commission}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {v.status === 'approved' ? 'অনুমোদিত' : 'পেন্ডিং'}
                          </span>
                        </td>
                        <td className="p-3">
                          {v.status !== 'approved' ? (
                            <button
                              onClick={() => {
                                setVendorApplicants(vendorApplicants.map((item) => item.id === v.id ? { ...item, status: 'approved' } : item));
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition cursor-pointer"
                            >
                              অনুমোদন দিন
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> সক্রিয় স্টোর
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: SUPABASE CLOUD DATABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/50">
                <div>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-base text-white">Supabase PostgreSQL ক্লাউড ডাটাবেজ ইন্টিগ্রেশন</h4>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      LIVE CONNECTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    স্মার্ট শপ, স্মার্ট হিসাব এবং মার্কেটিং হাবের সকল কাস্টমার, অর্ডার এবং হিসাব-নিকাশের সেন্ট্রাল হাব
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const res = await SupabaseService.checkConnection();
                      if (res.isConnected) {
                        alert(`✅ Supabase ক্লাউড ডাটাবেজ সফলভাবে কানেক্টেড আছে! (${res.lastChecked})`);
                      } else {
                        alert(`⚠️ কানেকশন চেক: ${res.error || 'Failed'}`);
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    কানেকশন টেস্ট করুন
                  </button>
                </div>
              </div>

              {/* Database Credentials & Config Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h5 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    কানেকশন ক্রেডেনশিয়াল (Credentials)
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Supabase Project URL:</span>
                      <code className="text-emerald-300 bg-slate-900 px-2 py-1 rounded block mt-0.5 break-all font-mono text-[11px]">
                        https://ffqwfrtpscivirlvvxol.supabase.co
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Publishable / Anon API Key:</span>
                      <code className="text-emerald-300 bg-slate-900 px-2 py-1 rounded block mt-0.5 break-all font-mono text-[11px]">
                        sb_publishable_PFs2IrWeSMbBotqwDa8jTw_rtEora1F
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Region:</span>
                      <span className="text-white font-bold">Southeast Asia (Singapore)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h5 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#f85606]" />
                    সাবডোমেন সেন্ট্রাল ডাটাবেজ সুবিধা
                  </h5>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li><strong className="text-white">SmartShopX (Main):</strong> সব নতুন অর্ডার ক্লাউড ডাটাবেজে সাথে সাথে সেভ হবে।</li>
                    <li><strong className="text-white">Smart Hisab (হিসাব খাতা):</strong> প্রতিটি বিক্রয়ের প্রফিট/লস ও ক্যাশ-ফ্লো সরাসরি এই ডাটাবেজ থেকে তৈরি হবে।</li>
                    <li><strong className="text-white">Marketing Hub:</strong> ক্যাম্পেইন ও কাস্টমার লিড সেন্ট্রালি ট্র্যাক হবে।</li>
                  </ul>
                </div>
              </div>

              {/* Quick Sync Orders Button */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-white">বর্তমান সব অর্ডার ক্লাউডে ব্যাকআপ নিন</h5>
                  <p className="text-xs text-slate-400">আপনার বর্তমান {orders.length} টি অর্ডার Supabase PostgreSQL টেবিলে সিঙ্ক করুন।</p>
                </div>
                <button
                  onClick={async () => {
                    let count = 0;
                    for (const ord of orders) {
                      await SupabaseService.syncOrderToCloud(ord);
                      count++;
                    }
                    alert(`🎉 মোট ${count} টি অর্ডার সফলভাবে Supabase ক্লাউডে সিঙ্ক করা হয়েছে!`);
                  }}
                  className="px-4 py-2 bg-[#f85606] hover:bg-[#e04d05] text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  সব অর্ডার সিঙ্ক করুন ({orders.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
