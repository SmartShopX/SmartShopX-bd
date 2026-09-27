import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import {
  X,
  Package,
  Clock,
  CheckCircle,
  CheckCircle2,
  Truck,
  WifiOff,
  Wifi,
  RefreshCw,
  MapPin,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Calendar,
  Percent,
  Layers,
  PackageCheck,
  Check,
  Star
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  language: 'bn' | 'en';
  isOnline: boolean;
  onTriggerSync: () => void;
  onOpenRateDelivery?: (order: Order) => void;
  onAdvanceOrderStatus?: (orderId: string) => void;
  onSetOrderStage?: (orderId: string, stageIdx: number) => void;
}

interface StepConfig {
  key: string;
  labelEn: string;
  labelBn: string;
  descEn: string;
  descBn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ORDER_STEPS: StepConfig[] = [
  {
    key: 'confirmed',
    labelEn: 'Confirmed',
    labelBn: 'কনফার্মড (Confirmed)',
    descEn: 'Order verified & payment confirmed',
    descBn: 'অর্ডার যাচাই ও পেমেন্ট নিশ্চিত হয়েছে',
    icon: ShieldCheck
  },
  {
    key: 'packed',
    labelEn: 'Packed',
    labelBn: 'প্যাকড (Packed)',
    descEn: 'Quality inspected & bubble packed',
    descBn: 'কোয়ালিটি চেক ও প্যাকেজিং সম্পন্ন',
    icon: PackageCheck
  },
  {
    key: 'shipped',
    labelEn: 'Shipped',
    labelBn: 'শিপড (Shipped)',
    descEn: 'Handed over to RedX Express courier',
    descBn: 'রেডএক্স কুরিয়ার ডেলিভারির পথে',
    icon: Truck
  },
  {
    key: 'delivered',
    labelEn: 'Delivered',
    labelBn: 'ডেলিভার্ড (Delivered)',
    descEn: 'Successfully delivered to your address',
    descBn: 'প্যাকেজ সফলভাবে গ্রাহকের হাতে পৌঁছেছে',
    icon: CheckCircle2
  }
];

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  language,
  isOnline,
  onTriggerSync,
  onOpenRateDelivery,
  onAdvanceOrderStatus,
  onSetOrderStage
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'history' | 'analytics'>('history');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [metricType, setMetricType] = useState<'spend' | 'count'>('spend');
  const [expandedTrackingOrders, setExpandedTrackingOrders] = useState<Record<string, boolean>>({});
  const [selectedStepByOrder, setSelectedStepByOrder] = useState<Record<string, number>>({});

  const toggleExpandTracking = (orderId: string) => {
    setExpandedTrackingOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleSelectStep = (orderId: string, stepIdx: number) => {
    setSelectedStepByOrder((prev) => ({
      ...prev,
      [orderId]: stepIdx
    }));
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending_offline_sync');

  // Helper to calculate order status stage & progress
  const getOrderProgressInfo = (order: Order) => {
    if (order.status === 'pending_offline_sync') {
      return {
        stageIndex: 0,
        isPendingSync: true,
        percent: 0,
        statusLabelEn: 'Pending Offline Sync',
        statusLabelBn: 'পেন্ডিং অফলাইন সিঙ্ক',
        statusColor: 'amber'
      };
    }

    const completedCount = order.trackingSteps?.filter((s) => s.completed).length || 0;
    
    // Map completed tracking steps to the 4 canonical stages (0: Pending, 1: Processing, 2: Shipped, 3: Delivered)
    let stageIndex = Math.max(0, Math.min(3, completedCount - 1));
    if (completedCount === 0) stageIndex = 0;

    const isAllDelivered = completedCount >= 4 || stageIndex === 3;
    const percent = Math.min(100, Math.max(0, (stageIndex / 3) * 100));

    let statusLabelEn = 'Pending';
    let statusLabelBn = 'গৃহীত';
    let statusColor = 'blue';

    if (isAllDelivered) {
      statusLabelEn = 'Delivered';
      statusLabelBn = 'ডেলিভারি সম্পন্ন';
      statusColor = 'emerald';
    } else if (stageIndex === 2) {
      statusLabelEn = 'Shipped / In Transit';
      statusLabelBn = 'ডেলিভারির পথে (শিপড)';
      statusColor = 'blue';
    } else if (stageIndex === 1) {
      statusLabelEn = 'Processing';
      statusLabelBn = 'প্যাকেজিং ও প্রসেসিং';
      statusColor = 'orange';
    } else {
      statusLabelEn = 'Order Placed';
      statusLabelBn = 'অর্ডার গৃহীত হয়েছে';
      statusColor = 'amber';
    }

    return {
      stageIndex,
      isPendingSync: false,
      isAllDelivered,
      percent,
      statusLabelEn,
      statusLabelBn,
      statusColor
    };
  };

  // Generate the last 6 months list relative to recent date
  const last6Months = useMemo(() => {
    const months = [];
    const now = new Date();
    // Use 2026 as target year baseline if now is earlier
    const baseDate = new Date(Math.max(now.getTime(), new Date('2026-09-22').getTime()));

    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const key = `${yr}-${String(mIdx + 1).padStart(2, '0')}`;
      months.push({
        key,
        year: yr,
        monthIndex: mIdx,
        labelEn: `${monthNamesEn[mIdx]} '${String(yr).slice(-2)}`,
        labelBn: `${monthNamesBn[mIdx]} '${String(yr).slice(-2)}`,
        fullLabelEn: `${monthNamesEn[mIdx]} ${yr}`,
        fullLabelBn: `${monthNamesBn[mIdx]} ${yr}`
      });
    }
    return months;
  }, []);

  // Compute 6-month spending and order stats
  const spendingData = useMemo(() => {
    const monthlyMap: Record<
      string,
      {
        totalSpend: number;
        orderCount: number;
        totalSavings: number;
        itemsCount: number;
      }
    > = {};

    last6Months.forEach((m) => {
      monthlyMap[m.key] = {
        totalSpend: 0,
        orderCount: 0,
        totalSavings: 0,
        itemsCount: 0
      };
    });

    const categoryMap: Record<string, { nameEn: string; nameBn: string; amount: number; count: number; color: string }> = {
      electronics: { nameEn: 'Electronics & Gadgets', nameBn: 'স্মার্টফোন ও গ্যাজেট', amount: 0, count: 0, color: '#f85606' },
      fashion: { nameEn: 'Fashion & Apparel', nameBn: 'ফ্যাশন ও পোশাক', amount: 0, count: 0, color: '#3b82f6' },
      home: { nameEn: 'Home & Kitchen', nameBn: 'গৃহস্থালি ও রান্নাঘর', amount: 0, count: 0, color: '#10b981' },
      beauty: { nameEn: 'Beauty & Care', nameBn: 'রূপচর্চা ও স্বাস্থ্য', amount: 0, count: 0, color: '#ec4899' },
      computers: { nameEn: 'Computers & Accessories', nameBn: 'কম্পিউটার ও এক্সেসরিজ', amount: 0, count: 0, color: '#8b5cf6' },
      other: { nameEn: 'Others', nameBn: 'অন্যান্য পণ্য', amount: 0, count: 0, color: '#f59e0b' }
    };

    let grandTotalSpend = 0;
    let grandTotalOrders = 0;
    let grandTotalSavings = 0;

    orders.forEach((order) => {
      let orderMonthKey = '';
      try {
        const d = new Date(order.orderDate.replace(' ', 'T'));
        if (!isNaN(d.getTime())) {
          orderMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
      } catch {
        // fallback
      }

      const amount = order.finalAmount || 0;
      const savings = (order.discountAmount || 0) + (order.coinsDiscount || 0);

      grandTotalSpend += amount;
      grandTotalOrders += 1;
      grandTotalSavings += savings;

      if (monthlyMap[orderMonthKey]) {
        monthlyMap[orderMonthKey].totalSpend += amount;
        monthlyMap[orderMonthKey].orderCount += 1;
        monthlyMap[orderMonthKey].totalSavings += savings;
        monthlyMap[orderMonthKey].itemsCount += order.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;
      } else {
        const latestMonthKey = last6Months[last6Months.length - 1].key;
        monthlyMap[latestMonthKey].totalSpend += amount;
        monthlyMap[latestMonthKey].orderCount += 1;
        monthlyMap[latestMonthKey].totalSavings += savings;
      }

      order.items?.forEach((item) => {
        const catId = item.product?.category || 'other';
        const itemSpend = (item.product?.price || 0) * (item.quantity || 1);
        if (categoryMap[catId]) {
          categoryMap[catId].amount += itemSpend;
          categoryMap[catId].count += item.quantity;
        } else {
          categoryMap['other'].amount += itemSpend;
          categoryMap['other'].count += item.quantity;
        }
      });
    });

    const chartSeries = last6Months.map((m) => {
      const stats = monthlyMap[m.key] || { totalSpend: 0, orderCount: 0, totalSavings: 0, itemsCount: 0 };
      return {
        monthKey: m.key,
        name: language === 'bn' ? m.labelBn : m.labelEn,
        fullName: language === 'bn' ? m.fullLabelBn : m.fullLabelEn,
        spend: stats.totalSpend,
        orders: stats.orderCount,
        savings: stats.totalSavings,
        items: stats.itemsCount
      };
    });

    const pieSeries = Object.keys(categoryMap)
      .map((key) => ({
        id: key,
        name: language === 'bn' ? categoryMap[key].nameBn : categoryMap[key].nameEn,
        value: categoryMap[key].amount,
        count: categoryMap[key].count,
        color: categoryMap[key].color
      }))
      .filter((c) => c.value > 0);

    const averageOrderSpend = grandTotalOrders > 0 ? Math.round(grandTotalSpend / grandTotalOrders) : 0;
    const monthlyAverageSpend = Math.round(grandTotalSpend / 6);
    const highestMonth = [...chartSeries].sort((a, b) => b.spend - a.spend)[0];

    return {
      chartSeries,
      pieSeries,
      grandTotalSpend,
      grandTotalOrders,
      grandTotalSavings,
      averageOrderSpend,
      monthlyAverageSpend,
      highestMonth
    };
  }, [orders, last6Months, language]);

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-xs min-w-[170px] space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-1">
            <Calendar className="w-3.5 h-3.5 text-[#f85606]" />
            <span>{data.fullName}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-orange-500" />
                {language === 'bn' ? 'মোট খরচ:' : 'Total Spent:'}
              </span>
              <span className="font-extrabold text-[#f85606] dark:text-orange-400">
                ৳{data.spend.toLocaleString('en-US')}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-blue-500" />
                {language === 'bn' ? 'অর্ডার সংখ্যা:' : 'Orders Count:'}
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {data.orders} {language === 'bn' ? 'টি' : 'orders'}
              </span>
            </div>
            {data.savings > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {language === 'bn' ? 'মোট সাশ্রয়:' : 'Total Saved:'}
                </span>
                <span className="font-bold">৳{data.savings.toLocaleString('en-US')}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Category Pie Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = spendingData.grandTotalSpend > 0
        ? ((data.value / spendingData.grandTotalSpend) * 100).toFixed(1)
        : 0;
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
          <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'bn' ? 'খরচ:' : 'Spend:'}{' '}
            <strong className="text-gray-900 dark:text-gray-100 font-extrabold">
              ৳{data.value.toLocaleString('en-US')}
            </strong>{' '}
            ({percent}%)
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            {language === 'bn' ? 'পণ্য সংখ্যা:' : 'Items bought:'} {data.count} {language === 'bn' ? 'টি' : 'items'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-[#0a3871] via-[#0b1a30] to-[#f85606] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {language === 'bn' ? 'আমার অর্ডার ও ডেলিভারি ট্র্যাকিং' : 'My Orders & Order Progress'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? `${orders.length}টি অর্ডারের রিয়েল-টাইম স্ট্যাটাস ও প্রগ্রেস বার` : `${orders.length} orders with live status progress`}
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

        {/* Sync alert banner if offline orders pending */}
        {pendingOrders.length > 0 && (
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>
                {language === 'bn'
                  ? `${pendingOrders.length}টি অফলাইন অর্ডার সার্ভারে পাঠানোর অপেক্ষায় রয়েছে।`
                  : `${pendingOrders.length} offline orders queued on device.`}
              </span>
            </div>
            {isOnline && (
              <button
                onClick={onTriggerSync}
                className="bg-white text-gray-900 px-3 py-1 rounded-lg font-bold text-xs hover:bg-yellow-100 flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{language === 'bn' ? 'এখনই সিঙ্ক করুন' : 'Sync Now'}</span>
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-gray-200/80 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#f85606]" />
              <span>{language === 'bn' ? 'অর্ডার তালিকা' : 'Orders'}</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-orange-100 dark:bg-orange-950/60 text-[#f85606] dark:text-orange-400 rounded-full text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer relative ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'bn' ? '৬ মাসের খরচ' : 'Spend Analytics'}</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
          </div>

          {activeTab === 'analytics' && (
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    chartType === 'area'
                      ? 'bg-[#f85606] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {language === 'bn' ? 'এরিয়া' : 'Area'}
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    chartType === 'bar'
                      ? 'bg-[#f85606] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {language === 'bn' ? 'বার' : 'Bar'}
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setMetricType('spend')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    metricType === 'spend'
                      ? 'bg-[#0a3871] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {language === 'bn' ? 'টাকা (৳)' : 'Spend (৳)'}
                </button>
                <button
                  onClick={() => setMetricType('count')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    metricType === 'count'
                      ? 'bg-[#0a3871] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {language === 'bn' ? 'সংখ্যা' : 'Count'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-6 space-y-4 pb-20 sm:pb-6">
          {activeTab === 'analytics' ? (
            /* Spending Overview Dashboard using Recharts */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3.5 bg-gradient-to-br from-orange-500/10 to-orange-500/5 dark:from-orange-950/40 dark:to-gray-900 border border-orange-200 dark:border-orange-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                    <span className="text-[11px] font-bold">{language === 'bn' ? 'মোট খরচ (৬ মাস)' : 'Total Spend (6M)'}</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                    ৳{spendingData.grandTotalSpend.toLocaleString('en-US')}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'গড়ে ৳' + spendingData.monthlyAverageSpend.toLocaleString('en-US') + '/মাস' : `Avg ৳${spendingData.monthlyAverageSpend}/mo`}
                  </p>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-950/40 dark:to-gray-900 border border-blue-200 dark:border-blue-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                    <span className="text-[11px] font-bold">{language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}</span>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                    {spendingData.grandTotalOrders} {language === 'bn' ? 'টি' : 'orders'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'সফল ডেলিভারি সম্পন্ন' : 'Across 6 months'}
                  </p>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:to-gray-900 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="text-[11px] font-bold">{language === 'bn' ? 'মোট সাশ্রয় / ছাড়' : 'Total Savings'}</span>
                    <Percent className="w-4 h-4" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ৳{spendingData.grandTotalSavings.toLocaleString('en-US')}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'ভাউচার ও কয়েন রিওয়ার্ড' : 'Via Vouchers & Coins'}
                  </p>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-950/40 dark:to-gray-900 border border-purple-200 dark:border-purple-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                    <span className="text-[11px] font-bold">{language === 'bn' ? 'গড় অর্ডার মূল্য' : 'Avg Order Value'}</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                    ৳{spendingData.averageOrderSpend.toLocaleString('en-US')}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'প্রতি অর্ডারে খরচ' : 'Per transaction'}
                  </p>
                </div>
              </div>

              {/* Main Spending Trend Chart */}
              <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#f85606]" />
                      <span>{language === 'bn' ? 'মাসিক খরচ ও অর্ডার ট্রেন্ড (গত ৬ মাস)' : 'Monthly Spending & Order Trend (Last 6 Months)'}</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'bn' ? 'প্রতি মাসে মোট ব্যয়ের পরিসংখ্যান ও গ্রাফ' : 'Monthly aggregated spend over the past 6 months'}
                    </p>
                  </div>

                  {spendingData.highestMonth && (
                    <div className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#f85606] dark:text-orange-400">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>
                        {language === 'bn'
                          ? `সর্বোচ্চ খরচ: ${spendingData.highestMonth.name} (৳${spendingData.highestMonth.spend.toLocaleString('en-US')})`
                          : `Peak: ${spendingData.highestMonth.name} (৳${spendingData.highestMonth.spend.toLocaleString('en-US')})`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recharts Area / Bar Chart */}
                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart
                        data={spendingData.chartSeries}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f85606" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#f85606" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0a3871" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#0a3871" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#888888' }}
                          tickLine={false}
                          axisLine={{ stroke: '#e5e7eb', opacity: 0.5 }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#888888' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => (metricType === 'spend' ? `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : `${v}`)}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                          formatter={(value) => {
                            if (value === 'spend') return language === 'bn' ? 'মোট খরচ (৳)' : 'Total Spend (৳)';
                            if (value === 'orders') return language === 'bn' ? 'অর্ডার সংখ্যা' : 'Order Count';
                            return value;
                          }}
                        />
                        {metricType === 'spend' ? (
                          <Area
                            type="monotone"
                            dataKey="spend"
                            stroke="#f85606"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#spendGradient)"
                            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                          />
                        ) : (
                          <Area
                            type="monotone"
                            dataKey="orders"
                            stroke="#0a3871"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#orderGradient)"
                            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                          />
                        )}
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={spendingData.chartSeries}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#888888' }}
                          tickLine={false}
                          axisLine={{ stroke: '#e5e7eb', opacity: 0.5 }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#888888' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => (metricType === 'spend' ? `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : `${v}`)}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                          formatter={(value) => {
                            if (value === 'spend') return language === 'bn' ? 'মোট খরচ (৳)' : 'Total Spend (৳)';
                            if (value === 'orders') return language === 'bn' ? 'অর্ডার সংখ্যা' : 'Order Count';
                            return value;
                          }}
                        />
                        <Bar
                          dataKey={metricType === 'spend' ? 'spend' : 'orders'}
                          fill={metricType === 'spend' ? '#f85606' : '#0a3871'}
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Section: Category Breakdown + Monthly Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Breakdown Pie */}
                <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <PieIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{language === 'bn' ? 'ক্যাটাগরি ভিত্তিক খরচের অনুপাত' : 'Category Spending Breakdown'}</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'bn' ? 'কোন খাতে বেশি শপিং করেছেন' : 'Distribution of purchases by category'}
                    </p>
                  </div>

                  <div className="h-44 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Pie
                          data={spendingData.pieSeries}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {spendingData.pieSeries.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">{language === 'bn' ? 'মোট' : 'Total'}</span>
                      <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                        ৳{(spendingData.grandTotalSpend / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>

                  {/* Category Legend List */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
                    {spendingData.pieSeries.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-gray-700 dark:text-gray-300 truncate text-[11px] font-medium">{cat.name}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-auto shrink-0 font-bold">
                          ৳{cat.value.toLocaleString('en-US')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Breakdown Table */}
                <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'bn' ? 'মাস ভিত্তিক খরচের তালিকা' : 'Monthly Breakdown Summary'}</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500 font-bold">
                          <th className="pb-2">{language === 'bn' ? 'মাস' : 'Month'}</th>
                          <th className="pb-2 text-center">{language === 'bn' ? 'অর্ডার' : 'Orders'}</th>
                          <th className="pb-2 text-right">{language === 'bn' ? 'খরচ (৳)' : 'Spend'}</th>
                          <th className="pb-2 text-right">{language === 'bn' ? 'সাশ্রয় (৳)' : 'Saved'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                        {spendingData.chartSeries.slice().reverse().map((row) => (
                          <tr key={row.monthKey} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                            <td className="py-2.5 font-bold text-gray-900 dark:text-gray-100">{row.name}</td>
                            <td className="py-2.5 text-center text-gray-600 dark:text-gray-300">
                              {row.orders > 0 ? (
                                <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                  {row.orders}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-2.5 text-right font-extrabold text-[#f85606] dark:text-orange-400">
                              ৳{row.spend.toLocaleString('en-US')}
                            </td>
                            <td className="py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              {row.savings > 0 ? `৳${row.savings.toLocaleString('en-US')}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Orders List (Order History with Visual Progress Bar) */
            orders.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-gray-800 text-[#f85606] dark:text-orange-400 flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  {language === 'bn' ? 'কোনো পূর্ববর্তী অর্ডার পাওয়া যায়নি' : 'No orders placed yet'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                  {language === 'bn'
                    ? 'SmartShopX.bd-এ পছন্দের পণ্য কার্টে যোগ করে অর্ডার সম্পন্ন করুন।'
                    : 'Start shopping on SmartShopX.bd and experience quick, seamless checkout.'}
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const progressInfo = getOrderProgressInfo(order);
                const isPendingSync = order.status === 'pending_offline_sync';

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition shadow-2xs space-y-4 ${
                      isPendingSync
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 hover:border-orange-200 dark:hover:border-gray-700'
                    }`}
                  >
                    {/* Order Top Bar with ID, Date and Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm tracking-wide">
                          {order.id}
                        </span>
                        
                        {/* Dynamic Status Badge */}
                        {isPendingSync ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                              <Clock className="w-3 h-3" />
                              <span>{language === 'bn' ? 'অফলাইনে সংরক্ষিত (পেন্ডিং)' : 'Pending Offline Sync'}</span>
                            </span>
                            {isOnline && onTriggerSync && (
                              <button
                                type="button"
                                onClick={onTriggerSync}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                                <span>{language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Sync'}</span>
                              </button>
                            )}
                          </div>
                        ) : progressInfo.isAllDelivered ? (
                          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{language === 'bn' ? 'ডেলিভার্ড (Delivered)' : 'Delivered'}</span>
                          </span>
                        ) : progressInfo.stageIndex === 2 ? (
                          <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                            <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>{language === 'bn' ? 'শিপড (পথে আছে)' : 'Shipped'}</span>
                          </span>
                        ) : (
                          <span className="bg-orange-100 dark:bg-orange-950/60 text-[#f85606] dark:text-orange-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-orange-200 dark:border-orange-800">
                            <PackageCheck className="w-3 h-3" />
                            <span>{language === 'bn' ? 'প্রসেসিং (Processing)' : 'Processing'}</span>
                          </span>
                        )}
                      </div>

                      <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {order.orderDate}
                      </span>
                    </div>

                    {/* Interactive 'Order Delivery Progress' Tracker */}
                    <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-800/90 dark:via-gray-850 dark:to-orange-950/20 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
                      {/* Top Header of Progress Box */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-[#f85606]">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                              {language === 'bn' ? 'লাইভ ডেলিভারি ট্র্যাকার' : 'Live Delivery Tracker'}
                            </span>
                            <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                              {language === 'bn' ? 'প্রতিটি স্টেপে ক্লিক করে বিস্তারিত দেখুন' : 'Click any step node to inspect details'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-[#f85606] dark:text-orange-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-orange-200 dark:border-gray-700 shadow-2xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#f85606] animate-ping" />
                            {language === 'bn' ? progressInfo.statusLabelBn : progressInfo.statusLabelEn}
                          </span>
                        </div>
                      </div>

                      {/* Stepper Progress Bar & 4 Nodes (Confirmed -> Packed -> Shipped -> Delivered) */}
                      <div className="relative px-2 sm:px-6 pt-2 pb-1">
                        {/* Background track line */}
                        <div className="absolute top-6.5 left-8 right-8 sm:left-14 sm:right-14 h-2 bg-gray-200 dark:bg-gray-700 rounded-full z-0" />

                        {/* Active filled gradient line */}
                        <div
                          className="absolute top-6.5 left-8 sm:left-14 h-2 bg-gradient-to-r from-emerald-500 via-[#f85606] to-amber-500 rounded-full z-0 transition-all duration-700 ease-out shadow-xs"
                          style={{
                            width: `calc(${progressInfo.percent}% * ((100% - 4rem) / 100))`
                          }}
                        />

                        {/* 4 Interactive Canonical Step Nodes */}
                        <div className="relative z-10 flex items-start justify-between">
                          {ORDER_STEPS.map((step, sIdx) => {
                            const StepIcon = step.icon;
                            const isCompleted = sIdx < progressInfo.stageIndex || (sIdx === 3 && progressInfo.isAllDelivered);
                            const isCurrent = sIdx === progressInfo.stageIndex && !progressInfo.isAllDelivered;
                            const isSelected = selectedStepByOrder[order.id] === sIdx;
                            const trackingTime = order.trackingSteps?.[sIdx]?.time || (isCompleted || isCurrent ? 'Just Now' : null);

                            return (
                              <button
                                key={step.key}
                                type="button"
                                onClick={() => handleSelectStep(order.id, sIdx)}
                                className={`flex flex-col items-center text-center max-w-[76px] sm:max-w-[110px] group cursor-pointer transition-transform ${
                                  isSelected ? 'scale-105' : 'hover:scale-102'
                                }`}
                              >
                                {/* Step Icon Node */}
                                <div
                                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                                    isCompleted
                                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                                      : isCurrent
                                      ? 'bg-[#f85606] text-white shadow-lg shadow-orange-500/35 ring-4 ring-orange-200 dark:ring-orange-950/80 animate-pulse'
                                      : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-gray-400'
                                  } ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2' : ''}`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-5 h-5 stroke-[2.5]" />
                                  ) : (
                                    <StepIcon className="w-5 h-5" />
                                  )}

                                  {/* Small step number index badge */}
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black flex items-center justify-center shadow-xs">
                                    {sIdx + 1}
                                  </span>
                                </div>

                                {/* Step Name Label */}
                                <p
                                  className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight transition-colors ${
                                    isCompleted || isCurrent
                                      ? 'text-gray-900 dark:text-gray-100'
                                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600'
                                  }`}
                                >
                                  {language === 'bn' ? step.labelBn : step.labelEn}
                                </p>

                                {/* Timestamp */}
                                {trackingTime ? (
                                  <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 line-clamp-1 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded-md">
                                    {trackingTime}
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-gray-400 dark:text-gray-600 mt-0.5">
                                    {language === 'bn' ? 'আসন্ন' : 'Pending'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Step Details Card (When a user clicks any stage node) */}
                      {typeof selectedStepByOrder[order.id] === 'number' && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 dark:border-blue-900/60 shadow-xs animate-in fade-in duration-150">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                {React.createElement(ORDER_STEPS[selectedStepByOrder[order.id]].icon, {
                                  className: 'w-4 h-4'
                                })}
                              </div>
                              <div>
                                <h6 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                  {language === 'bn'
                                    ? ORDER_STEPS[selectedStepByOrder[order.id]].labelBn
                                    : ORDER_STEPS[selectedStepByOrder[order.id]].labelEn}
                                </h6>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {language === 'bn'
                                    ? ORDER_STEPS[selectedStepByOrder[order.id]].descBn
                                    : ORDER_STEPS[selectedStepByOrder[order.id]].descEn}
                                </p>
                              </div>
                            </div>

                            {onSetOrderStage && (
                              <button
                                onClick={() => onSetOrderStage(order.id, selectedStepByOrder[order.id])}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition cursor-pointer shrink-0 shadow-xs"
                              >
                                {language === 'bn' ? 'এই ধাপে সেট করুন' : 'Set to This Stage'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interactive Stage Jump & Advance Controls Bar */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {language === 'bn' ? 'দ্রুত স্টেজ টেস্ট:' : 'Quick Stage Jump:'}
                          </span>
                          {onSetOrderStage && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {ORDER_STEPS.map((step, idx) => (
                                <button
                                  key={step.key}
                                  onClick={() => onSetOrderStage(order.id, idx)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                    idx <= progressInfo.stageIndex
                                      ? 'bg-orange-100 dark:bg-orange-950/60 text-[#f85606] dark:text-orange-400 hover:bg-orange-200'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                  }`}
                                >
                                  {idx + 1}. {language === 'bn' ? step.labelBn.split(' ')[0] : step.labelEn}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          {/* Expand/Collapse Timeline Button */}
                          <button
                            onClick={() => toggleExpandTracking(order.id)}
                            className="text-[11px] font-bold text-[#0a3871] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>
                              {expandedTrackingOrders[order.id]
                                ? (language === 'bn' ? 'টাইমলাইন লুকান' : 'Hide Timeline')
                                : (language === 'bn' ? 'বিস্তারিত টাইমলাইন' : 'Detailed Timeline')}
                            </span>
                          </button>

                          {/* Advance Step Button */}
                          {!progressInfo.isAllDelivered && onAdvanceOrderStatus && (
                            <button
                              onClick={() => onAdvanceOrderStatus(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#f85606] hover:bg-[#e04d05] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                            >
                              <Sparkles className="w-3 h-3 text-yellow-300" />
                              <span>{language === 'bn' ? 'পরবর্তী ধাপে এগিয়ে দিন ⚡' : 'Advance Stage ⚡'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Courier Milestones & Hub Scans Timeline */}
                      {expandedTrackingOrders[order.id] && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/70 p-3.5 rounded-xl space-y-3 animate-in fade-in duration-200">
                          {/* Courier Partner Info */}
                          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-black text-xs">
                                RedX
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100">
                                  {language === 'bn' ? 'রেডএক্স এক্সপ্রেস কুরিয়ার' : 'RedX Express Courier'}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  Tracking ID: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">RDX-{order.id}</span>
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                              Verified Courier
                            </span>
                          </div>

                          {/* Vertical Stepper Log */}
                          <div className="space-y-2.5 pl-2 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                            {ORDER_STEPS.map((step, idx) => {
                              const isPastOrCurrent = idx <= progressInfo.stageIndex;
                              const timeVal = order.trackingSteps?.[idx]?.time || (isPastOrCurrent ? 'Completed' : 'Pending');
                              return (
                                <div key={step.key} className="flex items-start gap-3 relative z-10 text-xs">
                                  <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                                      isPastOrCurrent
                                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-100 dark:ring-emerald-950'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                  >
                                    {isPastOrCurrent ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`font-bold ${isPastOrCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                                        {language === 'bn' ? step.labelBn : step.labelEn}
                                      </p>
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                        {timeVal}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                      {language === 'bn' ? step.descBn : step.descEn}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="py-2 space-y-2">
                      {order.items?.map((item, idx) => {
                        const prod = item?.product;
                        const fallbackImg = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80';
                        const imgSrc = prod?.image || fallbackImg;
                        const title = language === 'bn' ? (prod?.titleBn || prod?.title || 'পণ্য') : (prod?.title || 'Product');
                        const price = prod?.price || 0;
                        const qty = item?.quantity || 1;

                        return (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                            <img
                              src={imgSrc}
                              alt={title}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800"
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                                {title}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                                {language === 'bn' ? 'পরিমাণ:' : 'Qty:'} {qty} × ৳{price.toLocaleString('en-US')}
                                {item?.selectedSize && ` • Size: ${item.selectedSize}`}
                                {item?.selectedColor && ` • Color: ${item.selectedColor}`}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#f85606] dark:text-orange-400 shrink-0">
                              ৳{(price * qty).toLocaleString('en-US')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary footer */}
                    <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{order.address.city}, {order.address.division.toUpperCase()}</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                          <CreditCard className="w-3 h-3 text-gray-400" />
                          <span className="uppercase">{order.paymentMethod}</span>
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span>{language === 'bn' ? 'মোট পরিশোধিত/প্রদেয়:' : 'Total Payable:'}</span>
                        <span className="text-sm font-black text-[#f85606] dark:text-orange-400">
                          ৳{order.finalAmount.toLocaleString('en-US')}
                        </span>
                      </div>
                    </div>

                    {/* In-Progress Order Live Advance Simulation Button */}
                    {!progressInfo.isAllDelivered && onAdvanceOrderStatus && (
                      <div className="pt-2 mt-1 border-t border-dashed border-gray-200 dark:border-gray-700/80 flex items-center justify-between gap-2 bg-blue-50/40 dark:bg-blue-950/20 p-2.5 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 text-[11px] font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>
                            {language === 'bn'
                              ? 'লাইভ ট্র্যাকিং আপডেট টেস্ট করতে পরবর্তী ধাপে এগিয়ে দিন:'
                              : 'Test live real-time notification on next delivery step:'}
                          </span>
                        </div>
                        <button
                          onClick={() => onAdvanceOrderStatus(order.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0a3871] hover:bg-[#072952] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer ml-auto shrink-0"
                        >
                          <TrendingUp className="w-3 h-3 text-yellow-300" />
                          <span>
                            {language === 'bn' ? 'স্ট্যাটাস এগিয়ে দিন ⚡' : 'Advance Step ⚡'}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Delivery Rating Action Section for Delivered Orders */}
                    {progressInfo.isAllDelivered && onOpenRateDelivery && (
                      <div className="pt-2.5 mt-1 border-t border-dashed border-gray-200 dark:border-gray-700/80 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 p-2.5 rounded-xl">
                        {order.deliveryRating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < order.deliveryRating!.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                              {language === 'bn' ? 'ডেলিভারি রিভিউ সম্পন্ন' : 'Delivery Rated'} ({order.deliveryRating.rating}/5)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="font-semibold text-[11px]">
                              {language === 'bn'
                                ? 'ডেলিভারি কেমন ছিল? রেটিং দিয়ে ১০ কয়েন জিতুন!'
                                : 'How was the delivery? Rate & get +10 coins!'}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => onOpenRateDelivery(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#f85606] hover:bg-[#e04d05] text-white text-[11px] font-black transition flex items-center gap-1.5 shadow-2xs hover:shadow-sm cursor-pointer ml-auto"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>
                            {order.deliveryRating
                              ? (language === 'bn' ? 'রেটিং এডিট করুন' : 'Edit Review')
                              : (language === 'bn' ? 'ডেলিভারি রেট করুন' : 'Rate Delivery')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
};
