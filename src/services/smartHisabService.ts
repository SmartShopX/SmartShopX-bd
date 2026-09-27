import { HisabTransaction, CustomerDueRecord, DailyHisabSummary, Order } from '../types';
import { supabase } from './supabaseService';

const STORAGE_KEYS = {
  TRANSACTIONS: 'smarthissab_transactions',
  DUES: 'smarthissab_customer_dues',
  DAILY_SUMMARIES: 'smarthissab_daily_summaries',
};

const INITIAL_TRANSACTIONS: HisabTransaction[] = [
  {
    id: 'TXN-101',
    type: 'income',
    category: 'sale',
    categoryBn: 'পণ্য বিক্রয়',
    amount: 5940,
    customerOrSupplierName: 'মো. তানভীর আহমেদ',
    phone: '01712345678',
    note: 'অর্ডার ORD-2026-9821 পেমেন্ট (bKash)',
    date: '2026-09-26',
    paymentMethod: 'bkash',
    orderId: 'ORD-2026-9821',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TXN-102',
    type: 'expense',
    category: 'delivery',
    categoryBn: 'কুরিয়ার ও ডেলিভারি বিল',
    amount: 450,
    customerOrSupplierName: 'Steadfast Courier',
    phone: '01900000000',
    note: '৫টি পার্সেল হ্যান্ডওভার ডেলিভারি চার্জ',
    date: '2026-09-26',
    paymentMethod: 'cash',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TXN-103',
    type: 'expense',
    category: 'packaging',
    categoryBn: 'প্যাকেজিং ও বক্স',
    amount: 800,
    customerOrSupplierName: 'কাগজের হাট চকবাজার',
    phone: '01811223344',
    note: '৫০টি বাবল র‍্যাপার এবং ডেলিভারি বক্স ক্রয়',
    date: '2026-09-25',
    paymentMethod: 'cash',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TXN-104',
    type: 'income',
    category: 'sale',
    categoryBn: 'পণ্য বিক্রয়',
    amount: 4060,
    customerOrSupplierName: 'সাদিয়া রহমান',
    phone: '01812345678',
    note: 'অর্ডার ORD-2026-8432 পেমেন্ট (Nagad)',
    date: '2026-09-25',
    paymentMethod: 'nagad',
    orderId: 'ORD-2026-8432',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TXN-105',
    type: 'expense',
    category: 'ad_marketing',
    categoryBn: 'ফেসবুক ও ডিজিটাল বুস্টিং',
    amount: 1500,
    customerOrSupplierName: 'Meta Ads Manager',
    note: 'ঈদ মেগা ক্যাম্পেইন ফেসবুক বুস্টিং ডলার পেমেন্ট',
    date: '2026-09-24',
    paymentMethod: 'bank',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_DUES: CustomerDueRecord[] = [
  {
    id: 'DUE-01',
    customerName: 'মো. রফিকুল ইসলাম',
    phone: '01711998877',
    address: 'মিরপুর ১০, ঢাকা',
    totalPurchased: 8500,
    totalPaid: 6000,
    dueAmount: 2500,
    lastPaymentDate: '2026-09-20',
    lastOrderDate: '2026-09-20',
    notes: 'আগামী মাসের ৫ তারিখে বাকি টাকা পরিশোধ করবে।',
    status: 'active'
  },
  {
    id: 'DUE-02',
    customerName: 'খন্দকার এন্টারপ্রাইজ (হোলসেল)',
    phone: '01822887766',
    address: 'আগ্রাবাদ, চট্টগ্রাম',
    totalPurchased: 45000,
    totalPaid: 35000,
    dueAmount: 10000,
    lastPaymentDate: '2026-09-15',
    lastOrderDate: '2026-09-18',
    notes: 'চেক জমা দিয়েছে। ক্লিয়ারেন্স বাকি।',
    status: 'active'
  }
];

export class SmartHisabService {
  // Get all transactions
  static getTransactions(): HisabTransaction[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  // Save transactions
  static saveTransactions(transactions: HisabTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions', e);
    }
  }

  // Add a new transaction (Income/Expense/Due)
  static async addTransaction(txn: Omit<HisabTransaction, 'id' | 'createdAt'>): Promise<HisabTransaction> {
    const list = this.getTransactions();
    const newTxn: HisabTransaction = {
      ...txn,
      id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newTxn);
    this.saveTransactions(list);

    // Sync to Supabase in background
    try {
      await supabase.from('transactions').insert({
        id: newTxn.id,
        type: newTxn.type,
        category: newTxn.category,
        amount: newTxn.amount,
        order_id: newTxn.orderId || null,
        description: `${newTxn.categoryBn}: ${newTxn.note || ''} (${newTxn.customerOrSupplierName})`,
        date: newTxn.date
      });
    } catch (err) {
      console.warn('Supabase transaction insert notice:', err);
    }

    return newTxn;
  }

  // Delete transaction
  static deleteTransaction(id: string): boolean {
    try {
      const list = this.getTransactions().filter((t) => t.id !== id);
      this.saveTransactions(list);
      return true;
    } catch {
      return false;
    }
  }

  // Get Customer Dues (বাকি খাতা)
  static getCustomerDues(): CustomerDueRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DUES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_KEYS.DUES, JSON.stringify(INITIAL_DUES));
      return INITIAL_DUES;
    } catch {
      return INITIAL_DUES;
    }
  }

  // Save Customer Dues
  static saveCustomerDues(dues: CustomerDueRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DUES, JSON.stringify(dues));
    } catch (e) {
      console.error('Error saving customer dues', e);
    }
  }

  // Add or Update Customer Due
  static upsertCustomerDue(due: Omit<CustomerDueRecord, 'id'> & { id?: string }): CustomerDueRecord {
    const list = this.getCustomerDues();
    if (due.id) {
      const idx = list.findIndex((d) => d.id === due.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...due } as CustomerDueRecord;
        this.saveCustomerDues(list);
        return list[idx];
      }
    }

    const newDue: CustomerDueRecord = {
      ...due,
      id: `DUE-${Date.now()}`
    };
    list.unshift(newDue);
    this.saveCustomerDues(list);
    return newDue;
  }

  // Record a payment towards a customer due
  static recordDuePayment(dueId: string, paidAmount: number, paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank', note?: string): boolean {
    const dues = this.getCustomerDues();
    const idx = dues.findIndex((d) => d.id === dueId);
    if (idx === -1) return false;

    const customer = dues[idx];
    const newPaid = customer.totalPaid + paidAmount;
    const newDue = Math.max(0, customer.dueAmount - paidAmount);

    dues[idx] = {
      ...customer,
      totalPaid: newPaid,
      dueAmount: newDue,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      status: newDue === 0 ? 'cleared' : 'active'
    };
    this.saveCustomerDues(dues);

    // Also record this as an income transaction
    this.addTransaction({
      type: 'due_payment',
      category: 'sale',
      categoryBn: 'বাকি আদায় (Due Collection)',
      amount: paidAmount,
      customerOrSupplierName: customer.customerName,
      phone: customer.phone,
      note: note || `বাকি টাকা পরিশোধ: ${customer.customerName}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod
    });

    return true;
  }

  // Calculate Comprehensive Financial Summary
  static getFinancialSummary(orders: Order[]) {
    const transactions = this.getTransactions();
    const dues = this.getCustomerDues();

    // 1. Order-based direct metrics
    const totalOrderSales = orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
      .reduce((acc, o) => acc + (o.finalAmount || 0), 0);

    const successfulDeliveries = orders.filter((o) => o.status === 'delivered').length;

    // 2. Transaction book metrics
    const totalIncome = transactions
      .filter((t) => t.type === 'income' || t.type === 'due_payment')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const netProfit = totalIncome - totalExpense;

    // 3. Due metrics
    const totalCustomerDueOutstanding = dues
      .filter((d) => d.status !== 'cleared')
      .reduce((acc, d) => acc + d.dueAmount, 0);

    const totalDueCollected = dues.reduce((acc, d) => acc + d.totalPaid, 0);

    // 4. Expense Breakdowns
    const expenseBreakdown = {
      delivery: transactions.filter((t) => t.category === 'delivery').reduce((a, b) => a + b.amount, 0),
      packaging: transactions.filter((t) => t.category === 'packaging').reduce((a, b) => a + b.amount, 0),
      marketing: transactions.filter((t) => t.category === 'ad_marketing').reduce((a, b) => a + b.amount, 0),
      salary: transactions.filter((t) => t.category === 'salary').reduce((a, b) => a + b.amount, 0),
      purchase: transactions.filter((t) => t.category === 'purchase').reduce((a, b) => a + b.amount, 0),
      other: transactions.filter((t) => t.category === 'utility' || t.category === 'other' || t.category === 'office_rent').reduce((a, b) => a + b.amount, 0)
    };

    return {
      totalOrderSales,
      totalIncome,
      totalExpense,
      netProfit,
      totalCustomerDueOutstanding,
      totalDueCollected,
      successfulDeliveries,
      expenseBreakdown
    };
  }
}
