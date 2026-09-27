import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Package,
  Coins,
  Tag,
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  Home,
  Briefcase,
  Clock,
  Truck,
  RotateCcw,
  Printer,
  ChevronRight,
  LogOut,
  KeyRound,
  Check
} from 'lucide-react';
import { CustomerSession, DeliveryAddress, Order, SavedAddress, UserAccount, Voucher } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/mockProducts';
import { StorageService } from '../services/storageService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  session: CustomerSession;
  orders: Order[];
  vouchers: Voucher[];
  coins: number;
  userAddress: DeliveryAddress;
  onUpdateSession: (session: CustomerSession) => void;
  onUpdateAddress: (address: DeliveryAddress) => void;
  onLogout: () => void;
  onReorder?: (order: Order) => void;
  onOpenRateDelivery?: (order: Order) => void;
  initialTab?: 'info' | 'addresses' | 'orders' | 'rewards' | 'security';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  language,
  session,
  orders,
  vouchers,
  coins,
  userAddress,
  onUpdateSession,
  onUpdateAddress,
  onLogout,
  onReorder,
  onOpenRateDelivery,
  initialTab = 'info'
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders' | 'rewards' | 'security'>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load full user data
  const [currentUser, setCurrentUser] = useState<UserAccount | undefined>(() => {
    return StorageService.getUserById(session.customerId) || StorageService.getUserByPhoneOrEmail(session.phone);
  });

  // Addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    return StorageService.getUserAddresses(session.customerId);
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // New Address Form State
  const [addrFullName, setAddrFullName] = useState(session.fullName || userAddress.fullName);
  const [addrPhone, setAddrPhone] = useState(session.phone || userAddress.phone);
  const [addrDivision, setAddrDivision] = useState(userAddress.division || 'dhaka');
  const [addrCity, setAddrCity] = useState(userAddress.city || 'Dhaka - North');
  const [addrZone, setAddrZone] = useState(userAddress.zone || 'Gulshan / Banani');
  const [addrDetails, setAddrDetails] = useState(userAddress.addressDetails || '');
  const [addrLabel, setAddrLabel] = useState<'home' | 'office' | 'other'>('home');
  const [addrIsDefault, setAddrIsDefault] = useState(true);

  // Profile Edit State
  const [editFullName, setEditFullName] = useState(session.fullName || 'মো. তানভীর আহমেদ');
  const [editDisplayName, setEditDisplayName] = useState(session.displayName || 'তানভীর আহমেদ');
  const [editEmail, setEditEmail] = useState(session.email || 'tanvir.ahmed@example.com');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>(currentUser?.gender || 'male');
  const [editBirthDate, setEditBirthDate] = useState(currentUser?.birthDate || '1994-05-12');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Orders Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = StorageService.updateUserProfile(session.customerId, {
      fullName: editFullName,
      displayName: editDisplayName,
      email: editEmail,
      gender: editGender,
      birthDate: editBirthDate
    });

    if (res.success && res.user) {
      setCurrentUser(res.user);
      onUpdateSession({
        ...session,
        fullName: res.user.fullName,
        displayName: res.user.displayName,
        email: res.user.email,
        gender: res.user.gender,
        birthDate: res.user.birthDate
      });
      showToast(
        language === 'bn'
          ? '✅ প্রোফাইলের তথ্য সফলভাবে আপডেট হয়েছে!'
          : '✅ Profile information successfully updated!'
      );
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName.trim() || !addrPhone.trim() || !addrDetails.trim()) {
      showToast(
        language === 'bn' ? '⚠️ সব প্রয়োজনীয় তথ্য পূরণ করুন।' : '⚠️ Please fill all required fields.'
      );
      return;
    }

    if (editingAddressId) {
      // Update existing address
      const res = StorageService.updateUserAddress(session.customerId, editingAddressId, {
        fullName: addrFullName,
        phone: addrPhone,
        division: addrDivision,
        city: addrCity,
        zone: addrZone,
        addressDetails: addrDetails,
        label: addrLabel,
        isDefault: addrIsDefault
      });
      if (res.success) {
        setSavedAddresses(res.addresses);
        if (addrIsDefault) {
          onUpdateAddress({
            fullName: addrFullName,
            phone: addrPhone,
            division: addrDivision,
            city: addrCity,
            zone: addrZone,
            addressDetails: addrDetails,
            label: addrLabel === 'office' ? 'office' : 'home'
          });
        }
        setIsAddingAddress(false);
        setEditingAddressId(null);
        showToast(
          language === 'bn'
            ? '✅ ঠিকানা সফলভাবে আপডেট করা হয়েছে!'
            : '✅ Address successfully updated!'
        );
      }
    } else {
      // Add new address
      const res = StorageService.addUserAddress(session.customerId, {
        fullName: addrFullName,
        phone: addrPhone,
        division: addrDivision,
        city: addrCity,
        zone: addrZone,
        addressDetails: addrDetails,
        label: addrLabel,
        isDefault: addrIsDefault
      });
      if (res.success) {
        setSavedAddresses(res.addresses);
        if (addrIsDefault) {
          onUpdateAddress({
            fullName: addrFullName,
            phone: addrPhone,
            division: addrDivision,
            city: addrCity,
            zone: addrZone,
            addressDetails: addrDetails,
            label: addrLabel === 'office' ? 'office' : 'home'
          });
        }
        setIsAddingAddress(false);
        showToast(
          language === 'bn'
            ? '✅ নতুন ডেলিভারি ঠিকানা যুক্ত হয়েছে!'
            : '✅ New delivery address added!'
        );
      }
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    if (savedAddresses.length <= 1) {
      showToast(
        language === 'bn'
          ? '⚠️ কমপক্ষে একটি সক্রিয় ঠিকানা থাকা প্রয়োজন।'
          : '⚠️ You must keep at least one delivery address.'
      );
      return;
    }
    const res = StorageService.deleteUserAddress(session.customerId, addressId);
    if (res.success) {
      setSavedAddresses(res.addresses);
      showToast(
        language === 'bn' ? '🗑️ ঠিকানা মুছে ফেলা হয়েছে।' : '🗑️ Address deleted successfully.'
      );
    }
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const res = StorageService.setDefaultUserAddress(session.customerId, addressId);
    if (res.success) {
      setSavedAddresses(res.addresses);
      const def = res.addresses.find((a) => a.id === addressId);
      if (def) {
        onUpdateAddress({
          fullName: def.fullName,
          phone: def.phone,
          division: def.division,
          city: def.city,
          zone: def.zone,
          addressDetails: def.addressDetails,
          label: def.label === 'office' ? 'office' : 'home'
        });
      }
      showToast(
        language === 'bn'
          ? '🌟 প্রধান ডেলিভারি ঠিকানা হিসেবে সেট করা হয়েছে।'
          : '🌟 Set as default delivery address.'
      );
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast(
        language === 'bn'
          ? '⚠️ নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : '⚠️ New password must be at least 6 characters.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(
        language === 'bn' ? '⚠️ উভয় পাসওয়ার্ড মিলছে না।' : '⚠️ Passwords do not match.'
      );
      return;
    }

    const res = StorageService.changeUserPassword(session.customerId, oldPassword, newPassword);
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(language === 'bn' ? res.messageBn : res.message);
    } else {
      showToast(language === 'bn' ? res.messageBn : res.message);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    if (orderStatusFilter === 'all') return true;
    if (orderStatusFilter === 'delivered') return ord.status === 'delivered' || ord.status === 'synced';
    if (orderStatusFilter === 'processing') return ord.status === 'processing' || ord.status === 'pending';
    if (orderStatusFilter === 'shipped') return ord.status === 'shipped';
    if (orderStatusFilter === 'cancelled') return ord.status === 'cancelled';
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[90vh] max-h-[820px] animate-in zoom-in-95 duration-200"
      >
        {/* Header with VIP Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 dark:from-orange-950/40 dark:via-gray-850 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f85606] to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white dark:border-gray-800">
              {session.fullName ? session.fullName.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 truncate">
                  {session.fullName || (language === 'bn' ? 'গ্রাহক অ্যাকাউন্ট' : 'Customer Account')}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#f85606] text-white shadow-2xs">
                  <Sparkles className="w-3 h-3" />
                  {currentUser?.membershipLevel || 'Gold'} VIP
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session.phone} • {session.email || 'tanvir.ahmed@example.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="flex items-center px-4 sm:px-6 border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar gap-1 sm:gap-2 bg-gray-50/70 dark:bg-gray-850">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'info'
                ? 'border-[#f85606] text-[#f85606] dark:text-orange-400 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Info'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'addresses'
                ? 'border-[#f85606] text-[#f85606] dark:text-orange-400 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{language === 'bn' ? 'ঠিকানা খাতা' : 'Address Book'}</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] px-1.5 py-0.2 rounded-full">
              {savedAddresses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#f85606] text-[#f85606] dark:text-orange-400 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{language === 'bn' ? 'অর্ডার হিস্টোরি' : 'Past Orders'}</span>
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'rewards'
                ? 'border-[#f85606] text-[#f85606] dark:text-orange-400 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>{language === 'bn' ? 'কয়েন ও ভাউচার' : 'Coins & Vouchers'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'security'
                ? 'border-[#f85606] text-[#f85606] dark:text-orange-400 font-extrabold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{language === 'bn' ? 'নিরাপত্তা' : 'Security'}</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-between animate-in fade-in">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: PERSONAL INFORMATION                              */}
          {/* ======================================================== */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Membership & Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-850 p-4 rounded-2xl border border-amber-200/80 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {language === 'bn' ? 'মেম্বারশিপ লেভেল' : 'Membership Level'}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {currentUser?.membershipLevel || 'Gold VIP'}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'bn' ? 'প্রতি অর্ডারে ডাবল কয়েন সুবিধা' : 'Earn 2x coins on all orders'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850 p-4 rounded-2xl border border-blue-200/80 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {language === 'bn' ? 'মোট সম্পন্ন অর্ডার' : 'Completed Orders'}
                    </span>
                    <Package className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {orders.length} {language === 'bn' ? 'টি' : 'orders'}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'bn' ? '১০০% সফল ডেলিভারি রেকর্ড' : '100% successful delivery rate'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-850 p-4 rounded-2xl border border-emerald-200/80 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {language === 'bn' ? 'স্মার্টকয়েন ব্যালেন্স' : 'SmartCoins Balance'}
                    </span>
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    🪙 {coins} ({language === 'bn' ? `৳${Math.floor(coins / 10)} সমমূল্য` : `৳${Math.floor(coins / 10)} value`})
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'bn' ? 'চেকআউটে সরাসরি ক্যাশ ছাড়' : 'Usable on checkout discounts'}
                  </div>
                </div>
              </div>

              {/* Edit Personal Information Form */}
              <form onSubmit={handleSaveProfile} className="bg-gray-50 dark:bg-gray-850 p-4 sm:p-5 rounded-3xl border border-gray-200/80 dark:border-gray-750 space-y-4">
                <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#f85606]" />
                  <span>{language === 'bn' ? 'ব্যক্তিগত তথ্য সম্পাদনা করুন' : 'Edit Personal Information'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'সম্পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'ডিসপ্লে নেম' : 'Display Name'}
                    </label>
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর (স্থায়ী)' : 'Mobile Phone (Primary)'}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={session.phone}
                      className="w-full px-3.5 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-750 rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'লিঙ্গ (Gender)' : 'Gender'}
                    </label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                    >
                      <option value="male">{language === 'bn' ? 'পুরুষ (Male)' : 'Male'}</option>
                      <option value="female">{language === 'bn' ? 'মহিলা (Female)' : 'Female'}</option>
                      <option value="other">{language === 'bn' ? 'অন্যান্য (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'জন্মতারিখ (Birthday)' : 'Date of Birth'}
                    </label>
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-[#f85606] hover:bg-[#d84a05] text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ADDRESS BOOK                                      */}
          {/* ======================================================== */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">
                    {language === 'bn' ? 'সংরক্ষিত ডেলিভারি ঠিকানাসমূহ' : 'Saved Delivery Addresses'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'bn'
                      ? 'অর্ডার দ্রুত করতে আপনার বাসা, অফিস বা প্রিয়জনের ঠিকানা সেভ রাখুন।'
                      : 'Manage multiple shipping addresses for 1-click checkout.'}
                  </p>
                </div>

                {!isAddingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(true);
                      setEditingAddressId(null);
                      setAddrFullName(session.fullName);
                      setAddrPhone(session.phone);
                      setAddrDetails('');
                      setAddrLabel('home');
                    }}
                    className="py-2 px-3.5 bg-[#f85606] hover:bg-[#d84a05] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'bn' ? '+ নতুন ঠিকানা' : '+ Add Address'}</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Address Form Modal */}
              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} className="bg-orange-50/50 dark:bg-gray-850 p-4 sm:p-5 rounded-3xl border border-orange-200 dark:border-gray-700 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-orange-100 dark:border-gray-800 pb-2">
                    <h5 className="text-xs font-black uppercase text-[#f85606] dark:text-orange-400">
                      {editingAddressId
                        ? language === 'bn'
                          ? 'ঠিকানা সম্পাদনা করুন'
                          : 'Edit Address'
                        : language === 'bn'
                        ? 'নতুন ডেলিভারি ঠিকানা যোগ করুন'
                        : 'Add New Delivery Address'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      {language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {language === 'bn' ? 'প্রাপকের নাম *' : 'Recipient Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={addrFullName}
                        onChange={(e) => setAddrFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {language === 'bn' ? 'বিভাগ (Division) *' : 'Division *'}
                      </label>
                      <select
                        value={addrDivision}
                        onChange={(e) => {
                          setAddrDivision(e.target.value);
                          const div = BANGLADESH_DIVISIONS.find((d) => d.id === e.target.value);
                          if (div) setAddrCity(div.name);
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      >
                        {BANGLADESH_DIVISIONS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {language === 'bn' ? d.nameBn : d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {language === 'bn' ? 'এরিয়া / থানা *' : 'Area / Thana *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={addrZone}
                        onChange={(e) => setAddrZone(e.target.value)}
                        placeholder="e.g. Gulshan 2, Dhanmondi 27"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'বিস্তারিত ঠিকানা (বাড়ি নং, রোড নং, ফ্ল্যাট) *' : 'Street Address Details *'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={addrDetails}
                      onChange={(e) => setAddrDetails(e.target.value)}
                      placeholder="e.g. House 42, Road 11, Block D, Flat 4B"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'ঠিকানার ধরন:' : 'Label:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAddrLabel('home')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            addrLabel === 'home'
                              ? 'bg-[#f85606] text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {language === 'bn' ? 'বাসা' : 'Home'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddrLabel('office')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            addrLabel === 'office'
                              ? 'bg-[#f85606] text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {language === 'bn' ? 'অফিস' : 'Office'}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs cursor-pointer text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        className="rounded border-gray-300 text-[#f85606]"
                      />
                      <span>{language === 'bn' ? 'প্রধান ঠিকানা হিসেবে রাখুন' : 'Set as default'}</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      {language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#f85606] hover:bg-[#d84a05] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {editingAddressId
                        ? language === 'bn'
                          ? 'আপডেট করুন'
                          : 'Update'
                        : language === 'bn'
                        ? 'ঠিকানা সেভ করুন'
                        : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-3xl border transition relative ${
                      addr.isDefault
                        ? 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800 shadow-xs'
                        : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-750'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${
                          addr.label === 'office'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        }`}>
                          {addr.label === 'office' ? <Briefcase className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                        </span>
                        <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                          {addr.fullName}
                        </span>
                      </div>

                      {addr.isDefault ? (
                        <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full uppercase">
                          {language === 'bn' ? 'প্রধান' : 'Default'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[10px] font-bold text-[#f85606] hover:underline cursor-pointer"
                        >
                          {language === 'bn' ? 'ডিফল্ট করুন' : 'Make Default'}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">
                      {addr.addressDetails}, {addr.zone}, {addr.city}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      📞 {addr.phone}
                    </p>

                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(addr.id);
                          setAddrFullName(addr.fullName);
                          setAddrPhone(addr.phone);
                          setAddrDivision(addr.division);
                          setAddrCity(addr.city);
                          setAddrZone(addr.zone);
                          setAddrDetails(addr.addressDetails);
                          setAddrLabel(addr.label);
                          setAddrIsDefault(addr.isDefault);
                          setIsAddingAddress(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#f85606] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer text-xs flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PAST ORDERS & TRACKING                            */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
                {[
                  { id: 'all', label: language === 'bn' ? 'সকল অর্ডার' : 'All Orders' },
                  { id: 'delivered', label: language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered' },
                  { id: 'processing', label: language === 'bn' ? 'প্রক্রিয়াধীন' : 'Processing' },
                  { id: 'shipped', label: language === 'bn' ? 'ডেলিভারির পথে' : 'Shipped' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                      orderStatusFilter === st.id
                        ? 'bg-[#f85606] text-white shadow-2xs font-extrabold'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-850 rounded-3xl border border-dashed border-gray-200 dark:border-gray-750">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {language === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'bn' ? 'আপনার প্রয়োজনীয় পণ্যগুলো কার্টে যোগ করে অর্ডার করুন।' : 'Start shopping to place your first order.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-200/90 dark:border-gray-750 p-4 sm:p-5 shadow-2xs space-y-3.5"
                    >
                      {/* Order Head Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                            #{ord.id}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {ord.orderDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            ord.status === 'delivered' || ord.status === 'synced'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                          }`}>
                            {ord.status === 'delivered' || ord.status === 'synced'
                              ? (language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered')
                              : (language === 'bn' ? 'প্রক্রিয়াধীন' : 'Processing')}
                          </span>

                          <span className="text-xs font-black text-[#f85606]">
                            ৳{ord.finalAmount}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={it.product.image}
                                alt={it.product.title}
                                className="w-12 h-12 rounded-xl object-cover bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-700"
                              />
                              <div className="min-w-0">
                                <h6 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                  {language === 'bn' ? it.product.titleBn : it.product.title}
                                </h6>
                                <p className="text-[11px] text-gray-400">
                                  {language === 'bn' ? 'পরিমাণ:' : 'Qty:'} {it.quantity} {it.selectedColor ? `• ${it.selectedColor}` : ''} {it.selectedSize ? `• ${it.selectedSize}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 shrink-0">
                              ৳{it.product.price * it.quantity}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Live Tracking Progress Bar */}
                      {ord.trackingSteps && ord.trackingSteps.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                          <div className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#f85606]" />
                            <span>{language === 'bn' ? 'লাইভ কুরিয়ার ট্র্যাকিং' : 'Live Delivery Tracking'}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 text-center">
                            {ord.trackingSteps.map((step, sIdx) => (
                              <div key={sIdx} className="space-y-1">
                                <div className={`h-1.5 rounded-full ${step.completed ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">
                                  {language === 'bn' ? step.stepBn : step.step}
                                </div>
                                {step.time && <div className="text-[9px] text-gray-400 truncate">{step.time}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="font-semibold">{language === 'bn' ? 'পেমেন্ট:' : 'Payment:'}</span>
                          <span className="uppercase font-bold text-gray-800 dark:text-gray-200">{ord.paymentMethod}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'চালান / রিসিট' : 'Invoice'}</span>
                          </button>

                          {onReorder && (
                            <button
                              type="button"
                              onClick={() => onReorder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#f85606] dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold hover:bg-[#f85606] hover:text-white transition flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'পুনরায় অর্ডার' : 'Reorder'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: REWARDS & VOUCHERS                                */}
          {/* ======================================================== */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {/* Coin Balance Card */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                    {language === 'bn' ? 'আপনার মোট স্মার্টকয়েন' : 'SmartCoins Reward Balance'}
                  </span>
                  <div className="text-3xl font-black mt-0.5">
                    🪙 {coins}
                  </div>
                  <p className="text-xs text-amber-100 mt-1">
                    {language === 'bn' ? `বর্তমান ক্যাশ সমমূল্য: ৳${Math.floor(coins / 10)}` : `Current redeemable cash value: ৳${Math.floor(coins / 10)}`}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
                  🎁
                </div>
              </div>

              {/* Coin History */}
              <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-750 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'কয়েন অর্জনের ইতিহাস' : 'SmartCoins History'}</span>
                </h4>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(currentUser?.coinHistory || []).map((t) => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {language === 'bn' ? t.reasonBn : t.reason}
                        </div>
                        <div className="text-[10px] text-gray-400">{t.date}</div>
                      </div>
                      <div className={`text-xs font-black ${t.type === 'earned' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'earned' ? `+${t.amount}` : `-${t.amount}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Vouchers */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#f85606]" />
                  <span>{language === 'bn' ? 'সংগৃহীত ভাউচারসমূহ' : 'Available Vouchers'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vouchers.map((v) => (
                    <div
                      key={v.code}
                      className="p-3.5 bg-orange-50/40 dark:bg-gray-800 rounded-2xl border border-orange-200 dark:border-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] bg-orange-500 text-white font-black px-2 py-0.5 rounded-full uppercase">
                          {v.code}
                        </span>
                        <h6 className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-1">
                          {language === 'bn' ? v.titleBn : v.titleEn}
                        </h6>
                        <p className="text-[10px] text-gray-400">
                          {language === 'bn' ? `মেয়াদ: ${v.expiresAt}` : `Expires: ${v.expiresAt}`}
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#f85606]">
                        {v.discountType === 'percent' ? `${v.discountValue}%` : `৳${v.discountValue}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SECURITY & PASSWORD                               */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Form */}
              <form onSubmit={handleChangePasswordSubmit} className="bg-gray-50 dark:bg-gray-850 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-750 space-y-4">
                <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#f85606]" />
                  <span>{language === 'bn' ? 'অ্যাকাউন্ট পাসওয়ার্ড পরিবর্তন' : 'Change Account Password'}</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'বর্তমান পাসওয়ার্ড *' : 'Current Password *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'New Password (min 6 chars) *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm New Password *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-[#f85606] hover:bg-[#d84a05] text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* Logout Area */}
              <div className="bg-red-50/50 dark:bg-red-950/20 p-4 sm:p-5 rounded-3xl border border-red-200 dark:border-red-900/40 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-red-700 dark:text-red-400">
                    {language === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট' : 'Sign Out of Account'}
                  </h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'লগআউট করলে আপনি গেস্ট মোডে ফিরে যাবেন।' : 'You will be switched to guest mode.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Invoice Modal Popup */}
      {selectedInvoiceOrder && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs"
          onClick={() => setSelectedInvoiceOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white text-gray-900 rounded-3xl shadow-2xl p-6 space-y-4 border border-gray-200 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-lg text-[#f85606]">SmartShopX</h4>
                <div className="text-[10px] text-gray-500">Official Customer Invoice / চালান</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice No:</span>
                <span className="font-bold">INV-{selectedInvoiceOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{selectedInvoiceOrder.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-bold">{selectedInvoiceOrder.address?.fullName || session.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span>{selectedInvoiceOrder.address?.phone || session.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address:</span>
                <span className="text-right max-w-[200px]">{selectedInvoiceOrder.address?.addressDetails}, {selectedInvoiceOrder.address?.zone}</span>
              </div>
            </div>

            <div className="border-t border-b py-2 divide-y divide-gray-100 text-xs">
              {selectedInvoiceOrder.items.map((it, i) => (
                <div key={i} className="py-1.5 flex justify-between">
                  <span className="truncate max-w-[240px] font-medium">{it.product.title} x {it.quantity}</span>
                  <span className="font-bold">৳{it.product.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1 font-bold">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>৳{selectedInvoiceOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-৳{selectedInvoiceOrder.discountAmount}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#f85606] pt-1 border-t">
                <span>Total Paid ({selectedInvoiceOrder.paymentMethod.toUpperCase()}):</span>
                <span>৳{selectedInvoiceOrder.finalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="w-full py-2.5 bg-[#f85606] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print or Save PDF Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
