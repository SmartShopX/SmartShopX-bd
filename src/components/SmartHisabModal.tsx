import React, { useState, useEffect } from 'react';
import { Order, HisabTransaction, CustomerDueRecord, Language } from '../types';
import { SmartHisabService } from '../services/smartHisabService';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PlusCircle,
  FileText,
  Users,
  CreditCard,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Trash2,
  PieChart,
  BookOpen,
  Filter
} from 'lucide-react';

interface SmartHisabModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  language: Language;
}

export const SmartHisabModal: React.FC<SmartHisabModalProps> = ({
  isOpen,
  onClose,
  orders,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily_cash' | 'dues' | 'expenses' | 'reports'>('dashboard');
  const [transactions, setTransactions] = useState<HisabTransaction[]>([]);
  const [dues, setDues] = useState<CustomerDueRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Add Transaction Modal State
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
  const [txnType, setTxnType] = useState<'income' | 'expense'>('expense');
  const [txnCategory, setTxnCategory] = useState<HisabTransaction['category']>('delivery');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnParty, setTxnParty] = useState('');
  const [txnPhone, setTxnPhone] = useState('');
  const [txnNote, setTxnNote] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [txnPaymentMethod, setTxnPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');

  // Add/Pay Due Modal State
  const [isPayDueOpen, setIsPayDueOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<CustomerDueRecord | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('bkash');
  const [payNote, setPayNote] = useState('');

  // New Due customer modal
  const [isNewDueOpen, setIsNewDueOpen] = useState(false);
  const [newDueName, setNewDueName] = useState('');
  const [newDuePhone, setNewDuePhone] = useState('');
  const [newDueAddress, setNewDueAddress] = useState('');
  const [newDueTotal, setNewDueTotal] = useState('');
  const [newDuePaid, setNewDuePaid] = useState('');
  const [newDueNote, setNewDueNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTransactions(SmartHisabService.getTransactions());
      setDues(SmartHisabService.getCustomerDues());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const summary = SmartHisabService.getFinancialSummary(orders);

  const getCategoryBn = (cat: string) => {
    switch (cat) {
      case 'sale': return 'পণ্য বিক্রয় (Sale)';
      case 'purchase': return 'পণ্য ক্রয় / স্টক ইন';
      case 'packaging': return 'প্যাকেজিং ও বক্স';
      case 'delivery': return 'কুরিয়ার ও ডেলিভারি';
      case 'salary': return 'কর্মচারী বেতন';
      case 'ad_marketing': return 'ফেসবুক বুস্টিং ও বিজ্ঞাপন';
      case 'office_rent': return 'অফিস / দোকান ভাড়া';
      case 'utility': return 'বিদ্যুৎ ও ইন্টারনেট বিল';
      default: return 'অন্যান্য সাধারণ খরচ';
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount || Number(txnAmount) <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন!');
      return;
    }

    await SmartHisabService.addTransaction({
      type: txnType,
      category: txnCategory,
      categoryBn: getCategoryBn(txnCategory),
      amount: Number(txnAmount),
      customerOrSupplierName: txnParty || (txnType === 'income' ? 'কাস্টমার' : 'ভেন্ডর / সার্ভিস'),
      phone: txnPhone,
      note: txnNote,
      date: txnDate,
      paymentMethod: txnPaymentMethod
    });

    setTransactions(SmartHisabService.getTransactions());
    setIsAddTxnOpen(false);
    setTxnAmount('');
    setTxnParty('');
    setTxnPhone('');
    setTxnNote('');
    alert('✅ সফলভাবে এন্ট্রি সেভ হয়েছে এবং ক্লাউড ডাটাবেজে সিঙ্ক হয়েছে!');
  };

  const handlePayDueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDue || !payAmount || Number(payAmount) <= 0) {
      alert('সঠিক পরিশোধের পরিমাণ দিন!');
      return;
    }

    SmartHisabService.recordDuePayment(selectedDue.id, Number(payAmount), payMethod, payNote);
    setDues(SmartHisabService.getCustomerDues());
    setTransactions(SmartHisabService.getTransactions());
    setIsPayDueOpen(false);
    setSelectedDue(null);
    setPayAmount('');
    setPayNote('');
    alert('🎉 বাকি আদায় সফলভাবে রেকর্ড হয়েছে!');
  };

  const handleCreateNewDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueName || !newDuePhone || !newDueTotal) {
      alert('দয়া করে নাম, মোবাইল নম্বর এবং মোট টাকার পরিমাণ পূরণ করুন!');
      return;
    }

    const total = Number(newDueTotal);
    const paid = Number(newDuePaid || 0);
    const due = Math.max(0, total - paid);

    SmartHisabService.upsertCustomerDue({
      customerName: newDueName,
      phone: newDuePhone,
      address: newDueAddress,
      totalPurchased: total,
      totalPaid: paid,
      dueAmount: due,
      lastPaymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      lastOrderDate: new Date().toISOString().split('T')[0],
      notes: newDueNote,
      status: due === 0 ? 'cleared' : 'active'
    });

    setDues(SmartHisabService.getCustomerDues());
    setIsNewDueOpen(false);
    setNewDueName('');
    setNewDuePhone('');
    setNewDueAddress('');
    setNewDueTotal('');
    setNewDuePaid('');
    setNewDueNote('');
    alert('✅ নতুন গ্রাহকের বাকি খাতা যুক্ত হয়েছে!');
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.customerOrSupplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.phone && t.phone.includes(searchTerm)) ||
      (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'income') return matchesSearch && (t.type === 'income' || t.type === 'due_payment');
    if (filterType === 'expense') return matchesSearch && t.type === 'expense';
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[96vh] rounded-3xl bg-slate-900 text-slate-100 shadow-2xl flex flex-col border border-slate-800 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-[#f85606]/80 p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-white">
                  Smart Hisab • ডিজিটাল হিসাব খাতা ও ক্যাশ ম্যানেজমেন্ট
                </h3>
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  PostgreSQL Cloud
                </span>
              </div>
              <p className="text-xs text-slate-300">
                দৈনিক আয়-ব্যয় • কাস্টমার বাকি খাতা • লাভ-ক্ষতি ক্যালকুলেটর • ক্যাশ-ইন-হ্যান্ড
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          {[
            { id: 'dashboard', label: '📊 ড্যাশবোর্ড ও লাভ-ক্ষতি', icon: PieChart },
            { id: 'daily_cash', label: '💰 দৈনিক আয়-ব্যয় এন্ট্রি', icon: DollarSign },
            { id: 'dues', label: '📒 কাস্টমার বাকি খাতা', icon: Users },
            { id: 'expenses', label: '📉 খরচ ক্যাটাগরি রিপোর্ট', icon: TrendingDown }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/90 text-slate-200">
          
          {/* TAB 1: FINANCIAL OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Financial Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-bold">মোট আয় (Total Cash In)</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    ৳{summary.totalIncome.toLocaleString('en-US')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">অর্ডার বিক্রয় ও বাকি আদায়সহ</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/60 to-slate-900 border border-rose-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-400 font-bold">মোট খরচ (Total Expense)</span>
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    ৳{summary.totalExpense.toLocaleString('en-US')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">কুরিয়ার, বুস্টিং, প্যাকেজিং</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-bold">মোট কাস্টমার বাকি</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    ৳{summary.totalCustomerDueOutstanding.toLocaleString('en-US')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">অনাদায়ী কাস্টমার বকেয়া</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-bold">খাঁটি লাভ (Net Profit)</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-black mt-2 ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ৳{summary.netProfit.toLocaleString('en-US')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {summary.netProfit >= 0 ? '✅ লাভজনক অবস্থানে আছেন' : '⚠️ লসের মুখে'}
                  </p>
                </div>
              </div>

              {/* Quick Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">দৈনিক ক্যাশ হিসাব আপডেট রাখুন</h4>
                    <p className="text-xs text-slate-400">প্রতিটি খরচের ভাউচার বা বিক্রয়ের টাকা সাথে সাথে এন্ট্রি দিন</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTxnType('income');
                      setTxnCategory('sale');
                      setIsAddTxnOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + নতুন আয় যোগ করুন
                  </button>
                  <button
                    onClick={() => {
                      setTxnType('expense');
                      setTxnCategory('delivery');
                      setIsAddTxnOpen(true);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + নতুন খরচ যোগ করুন
                  </button>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    সাম্প্রতিক হিসাব লেনদেন (Recent Transactions)
                  </h4>
                  <span className="text-xs text-slate-400">মোট {transactions.length} টি রেকর্ড</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">ধরন</th>
                        <th className="p-3">খাত / বিবরণ</th>
                        <th className="p-3">গ্রাহক / প্রাপক</th>
                        <th className="p-3">মাধ্যম</th>
                        <th className="p-3 text-right">টাকার পরিমাণ</th>
                        <th className="p-3 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {transactions.slice(0, 7).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-900/50">
                          <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{t.date}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.type === 'income' || t.type === 'due_payment'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {t.type === 'income' || t.type === 'due_payment' ? 'আয় (In)' : 'খরচ (Out)'}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-white">{t.categoryBn}</p>
                            {t.note && <p className="text-[11px] text-slate-400 truncate max-w-xs">{t.note}</p>}
                          </td>
                          <td className="p-3 font-medium text-slate-200">
                            {t.customerOrSupplierName}
                            {t.phone && <span className="block text-[10px] text-slate-400 font-mono">{t.phone}</span>}
                          </td>
                          <td className="p-3 uppercase font-mono text-[10px] text-amber-400 font-bold">
                            {t.paymentMethod}
                          </td>
                          <td className={`p-3 text-right font-black text-sm ${
                            t.type === 'income' || t.type === 'due_payment' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {t.type === 'income' || t.type === 'due_payment' ? '+' : '-'}৳{t.amount.toLocaleString('en-US')}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm('আপনি কি এই হিসাব এন্ট্রিটি মুছে ফেলতে চান?')) {
                                  SmartHisabService.deleteTransaction(t.id);
                                  setTransactions(SmartHisabService.getTransactions());
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 transition p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY CASHBOOK (আয়-ব্যয় খাতা) */}
          {activeTab === 'daily_cash' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="নাম, ফোন বা বিবরণ খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-hidden"
                  >
                    <option value="all">সব লেনদেন</option>
                    <option value="income">শুধু আয় (+)</option>
                    <option value="expense">শুধু খরচ (-)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setTxnType('expense');
                      setIsAddTxnOpen(true);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    নতুন লেনদেন যোগ করুন
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">ধরন</th>
                      <th className="p-3">খাত / উদ্দেশ্য</th>
                      <th className="p-3">পার্টি / নাম</th>
                      <th className="p-3">পেমেন্ট মাধ্যম</th>
                      <th className="p-3 text-right">টাকা</th>
                      <th className="p-3 text-center">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{t.date}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.type === 'income' || t.type === 'due_payment'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {t.type === 'income' || t.type === 'due_payment' ? 'আয়' : 'ব্যয়'}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-white">{t.categoryBn}</p>
                          {t.note && <p className="text-[11px] text-slate-400">{t.note}</p>}
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-200">{t.customerOrSupplierName}</p>
                          {t.phone && <p className="text-[10px] text-slate-400 font-mono">{t.phone}</p>}
                        </td>
                        <td className="p-3 font-mono uppercase text-[10px] text-amber-400 font-bold">
                          {t.paymentMethod}
                        </td>
                        <td className={`p-3 text-right font-black text-sm ${
                          t.type === 'income' || t.type === 'due_payment' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {t.type === 'income' || t.type === 'due_payment' ? '+' : '-'}৳{t.amount.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm('আপনি কি এই হিসাব মুছে ফেলতে চান?')) {
                                SmartHisabService.deleteTransaction(t.id);
                                setTransactions(SmartHisabService.getTransactions());
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 transition p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER DUES (বাকি খাতা) */}
          {activeTab === 'dues' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-white">কাস্টমার বাকি খাতা (Customer Due Management)</h4>
                  <p className="text-xs text-slate-400">কার কাছে কত টাকা বকেয়া আছে এবং কত টাকা আদায় হলো তার নির্ভুল হিসাব</p>
                </div>
                <button
                  onClick={() => setIsNewDueOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  + নতুন বাকি গ্রাহক যোগ করুন
                </button>
              </div>

              {/* Dues Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">গ্রাহকের নাম ও ফোন</th>
                      <th className="p-3">ঠিকানা</th>
                      <th className="p-3 text-right">মোট কেনাকাটা</th>
                      <th className="p-3 text-right">মোট জমা/পরিশোধ</th>
                      <th className="p-3 text-right">বর্তমান বাকি</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dues.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-900/50">
                        <td className="p-3">
                          <p className="font-bold text-white text-sm">{d.customerName}</p>
                          <p className="text-[11px] text-emerald-400 font-mono">{d.phone}</p>
                        </td>
                        <td className="p-3 text-slate-400 max-w-xs">{d.address || '—'}</td>
                        <td className="p-3 text-right font-bold text-slate-200">
                          ৳{d.totalPurchased.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          ৳{d.totalPaid.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-right font-black text-sm text-rose-400">
                          ৳{d.dueAmount.toLocaleString('en-US')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            d.dueAmount === 0
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {d.dueAmount === 0 ? 'পরিশোধিত (Cleared)' : 'বাকি সক্রিয়'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {d.dueAmount > 0 && (
                            <button
                              onClick={() => {
                                setSelectedDue(d);
                                setPayAmount(d.dueAmount.toString());
                                setIsPayDueOpen(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              বাকি জমা নিন
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSE BREAKDOWNS */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-base text-white">খরচ অ্যানালাইসিস ও বিভাজন (Expense Breakdown)</h4>
                <p className="text-xs text-slate-400">আপনার ব্যবসার প্রধান খরচের খাতগুলো দেখে খরচ কমানোর পরিকল্পনা করুন</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: '🚚 কুরিয়ার ও ডেলিভারি বিল', amount: summary.expenseBreakdown.delivery, color: 'from-blue-600 to-blue-800' },
                  { label: '📦 প্যাকেজিং ও বক্স খরচ', amount: summary.expenseBreakdown.packaging, color: 'from-amber-600 to-amber-800' },
                  { label: '📣 ফেসবুক বুস্টিং ও মার্কেটিং', amount: summary.expenseBreakdown.marketing, color: 'from-pink-600 to-rose-800' },
                  { label: '👔 কর্মচারী বেতন ও ভাতাদি', amount: summary.expenseBreakdown.salary, color: 'from-emerald-600 to-teal-800' },
                  { label: '🛒 প্রোডাক্ট ক্রয় / স্টক ইনভেস্ট', amount: summary.expenseBreakdown.purchase, color: 'from-purple-600 to-indigo-800' },
                  { label: '💡 অফিস ভাড়া ও অন্যান্য বিল', amount: summary.expenseBreakdown.other, color: 'from-slate-600 to-slate-800' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-bold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {summary.totalExpense > 0 ? ((item.amount / summary.totalExpense) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-2">
                      ৳{item.amount.toLocaleString('en-US')}
                    </h3>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${summary.totalExpense > 0 ? (item.amount / summary.totalExpense) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MODAL 1: ADD TRANSACTION */}
        {isAddTxnOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-base">
                  {txnType === 'income' ? '🟢 নতুন আয় এন্ট্রি' : '🔴 নতুন খরচ এন্ট্রি'}
                </h4>
                <button onClick={() => setIsAddTxnOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">লেনদেনের ধরন:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxnType('income')}
                      className={`py-2 rounded-xl font-bold transition cursor-pointer ${
                        txnType === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      + আয় (Income)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxnType('expense')}
                      className={`py-2 rounded-xl font-bold transition cursor-pointer ${
                        txnType === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      - খরচ (Expense)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">খাত বা ক্যাটাগরি:</label>
                  <select
                    value={txnCategory}
                    onChange={(e) => setTxnCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {txnType === 'income' ? (
                      <>
                        <option value="sale">পণ্য বিক্রয় (Product Sale)</option>
                        <option value="other">অন্যান্য প্রাপ্তি</option>
                      </>
                    ) : (
                      <>
                        <option value="delivery">কুরিয়ার ও ডেলিভারি চার্জ</option>
                        <option value="packaging">প্যাকেজিং ও বক্স</option>
                        <option value="ad_marketing">ফেসবুক বুস্টিং / বিজ্ঞাপন</option>
                        <option value="purchase">পণ্য পাইকারি ক্রয় (Stock In)</option>
                        <option value="salary">কর্মচারী বেতন</option>
                        <option value="office_rent">অফিস / গুদাম ভাড়া</option>
                        <option value="utility">বিদ্যুৎ / ইন্টারনেট বিল</option>
                        <option value="other">অন্যান্য বিবিধ খরচ</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">টাকার পরিমাণ (৳):</label>
                  <input
                    type="number"
                    required
                    placeholder="যেমন: 1500"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">পার্টি / নাম:</label>
                    <input
                      type="text"
                      placeholder="কাস্টমার বা ভেন্ডর নাম"
                      value={txnParty}
                      onChange={(e) => setTxnParty(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">পেমেন্ট মাধ্যম:</label>
                    <select
                      value={txnPaymentMethod}
                      onChange={(e) => setTxnPaymentMethod(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="cash">ক্যাশ (Cash)</option>
                      <option value="bkash">বিকাশ (bKash)</option>
                      <option value="nagad">নগদ (Nagad)</option>
                      <option value="bank">ব্যাংক ট্রান্সফার</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">নোট / বিবরণ (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    placeholder="যেমন: চালান নং বা মেমো বিবরণ"
                    value={txnNote}
                    onChange={(e) => setTxnNote(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTxnOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    সেভ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: PAY CUSTOMER DUE */}
        {isPayDueOpen && selectedDue && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-white text-base">বাকি টাকা আদায় (Due Collection)</h4>
                  <p className="text-xs text-emerald-400 font-bold">{selectedDue.customerName} ({selectedDue.phone})</p>
                </div>
                <button onClick={() => setIsPayDueOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePayDueSubmit} className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">বর্তমান মোট বকেয়া:</span>
                  <span className="font-black text-rose-400 text-sm">৳{selectedDue.dueAmount.toLocaleString('en-US')}</span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">পরিশোধের পরিমাণ (৳):</label>
                  <input
                    type="number"
                    required
                    max={selectedDue.dueAmount}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">পেমেন্ট মাধ্যম:</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="cash">ক্যাশ (Cash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="bank">ব্যাংক</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">নোট (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    placeholder="যেমন: ক্যাশ রিসিট বা রেফারেন্স"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayDueOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    জমা নিশ্চিত করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD NEW DUE CUSTOMER */}
        {isNewDueOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-base">+ নতুন কাস্টমার বাকি এন্ট্রি</h4>
                <button onClick={() => setIsNewDueOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewDue} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">গ্রাহকের নাম:</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মো. রফিকুল ইসলাম"
                    value={newDueName}
                    onChange={(e) => setNewDueName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">মোবাইল নম্বর:</label>
                  <input
                    type="text"
                    required
                    placeholder="017xxxxxxxx"
                    value={newDuePhone}
                    onChange={(e) => setNewDuePhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">মোট কেনাকাটা (৳):</label>
                    <input
                      type="number"
                      required
                      placeholder="5000"
                      value={newDueTotal}
                      onChange={(e) => setNewDueTotal(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">অগ্রিম পরিশোধ (৳):</label>
                    <input
                      type="number"
                      placeholder="2000"
                      value={newDuePaid}
                      onChange={(e) => setNewDuePaid(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">ঠিকানা (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    placeholder="যেমন: মিরপুর ১০, ঢাকা"
                    value={newDueAddress}
                    onChange={(e) => setNewDueAddress(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">মন্তব্য / শর্ত:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ৫ তারিখে পরিশোধের প্রতিশ্রুতি"
                    value={newDueNote}
                    onChange={(e) => setNewDueNote(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewDueOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    বাকি খাতা যুক্ত করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
