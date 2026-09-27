import React from 'react';
import { AppNotification } from '../services/notificationService';
import {
  X,
  Bell,
  BellRing,
  CheckCircle2,
  Truck,
  PackageCheck,
  Clock,
  ExternalLink,
  Star,
  Sparkles,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';
import { Order } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  permission: NotificationPermission;
  onRequestPermission: () => void;
  onMarkAllAsRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
  onSimulateStatusChange: () => void;
  language: 'bn' | 'en';
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  permission,
  onRequestPermission,
  onMarkAllAsRead,
  onSelectNotification,
  onSimulateStatusChange,
  language
}) => {
  if (!isOpen) return null;

  const getStatusIcon = (status: AppNotification['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <PackageCheck className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0a3871] via-[#0b1a30] to-[#f85606] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold shadow-inner">
              <BellRing className="w-5 h-5 text-yellow-300 animate-wiggle" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {language === 'bn' ? 'অর্ডার নোটিফিকেশন সেন্টার' : 'Order Notification Center'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? 'রিয়েল-টাইম লাইভ ডেলিভারি অ্যালার্ট ও ট্র্যাকিং' : 'Real-time delivery status updates & alerts'}
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

        {/* Browser Permission Banner */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 shrink-0">
          {permission === 'granted' ? (
            <div className="flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  {language === 'bn'
                    ? 'ব্রাউজার নোটিফিকেশন সক্রিয় রয়েছে (ব্যাকগ্রাউন্ডেও এলার্ট পাবেন)'
                    : 'Real-time browser notifications are active (enabled for background updates)'}
                </span>
              </div>
              <button
                onClick={onSimulateStatusChange}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Zap className="w-3 h-3 text-yellow-300" />
                <span>{language === 'bn' ? 'টেস্ট অ্যালার্ট' : 'Test Alert'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-orange-50 dark:bg-orange-950/40 p-3 rounded-2xl border border-orange-200 dark:border-orange-800 text-xs">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Bell className="w-4 h-4 text-[#f85606] shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'অ্যাপ ব্যাকগ্রাউন্ডে থাকলেও ডেলিভারি স্ট্যাটাস নোটিফিকেশন পান।'
                    : 'Get live updates when your order moves to Shipped or Delivered!'}
                </span>
              </div>
              <button
                onClick={onRequestPermission}
                className="bg-[#f85606] hover:bg-[#e04d05] text-white px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নোটিফিকেশন চালু করুন' : 'Enable Notifications'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3 pb-20 sm:pb-5">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              {language === 'bn' ? 'সাম্প্রতিক অর্ডার আপডেট' : 'Recent Status Updates'} ({notifications.length})
            </span>
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[#f85606] dark:text-orange-400 hover:underline font-bold text-[11px] cursor-pointer"
              >
                {language === 'bn' ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark all as read'}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                {language === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No notifications yet'}
              </p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                {language === 'bn'
                  ? 'অর্ডার প্রসেসিং, শিপিং বা ডেলিভারি হলে এখানে লাইভ আপডেট দেখতে পাবেন।'
                  : 'Live status changes (Processing, Shipped, Delivered) will trigger alerts here.'}
              </p>
              <button
                onClick={onSimulateStatusChange}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-950/60 text-[#f85606] dark:text-orange-400 rounded-xl text-xs font-bold hover:bg-orange-200 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'একটি ডেমো অর্ডার আপডেট টেস্ট করুন' : 'Simulate Status Update'}</span>
              </button>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onSelectNotification(notif)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 relative ${
                  notif.isRead
                    ? 'bg-white dark:bg-gray-850 border-gray-100 dark:border-gray-800 hover:border-orange-200'
                    : 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/60 hover:border-orange-300'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#f85606]" />
                )}
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  {getStatusIcon(notif.status)}
                </div>
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className="font-bold text-xs text-gray-900 dark:text-gray-100 line-clamp-1">
                      {language === 'bn' ? notif.titleBn : notif.titleEn}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {language === 'bn' ? notif.messageBn : notif.messageEn}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                    <span>{notif.timestamp}</span>
                    {notif.actionType === 'rate_delivery' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {language === 'bn' ? 'রেট দিয়ে ১০ কয়েন পান' : 'Rate & get +10 coins'}
                      </span>
                    ) : (
                      <span className="text-[#f85606] font-bold flex items-center gap-0.5">
                        {language === 'bn' ? 'ট্র্যাকিং দেখুন' : 'Track Order'}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Simulation Controls */}
        <div className="p-3.5 bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
          <button
            onClick={onSimulateStatusChange}
            className="text-xs text-gray-700 dark:text-gray-300 hover:text-[#f85606] font-bold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Zap className="w-3.5 h-3.5 text-[#f85606]" />
            <span>{language === 'bn' ? 'লাইভ স্ট্যাটাস আপডেট পরিবর্তন করুন' : 'Advance Order Delivery Step'}</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
