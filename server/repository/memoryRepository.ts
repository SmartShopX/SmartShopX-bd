import {
  BackendCustomer,
  BackendStore,
  BackendProduct,
  BackendOrder,
  BackendVoucher
} from '../types';
import {
  CentralRepository,
  ProductQueryFilters,
  OrderCreationResult,
  IdempotencyRecord
} from './interface';

/**
 * IN-MEMORY REPOSITORY IMPLEMENTATION
 * 
 * Provides synchronized, fast execution for local development, test environments,
 * and reliable offline/standalone runtime.
 */
export class MemoryCentralRepository implements CentralRepository {
  readonly providerName = 'memory' as const;

  private customers: Map<string, BackendCustomer> = new Map();
  private stores: Map<string, BackendStore> = new Map();
  private products: Map<string, BackendProduct> = new Map();
  private orders: Map<string, BackendOrder> = new Map();
  private vouchers: Map<string, BackendVoucher> = new Map();
  private idempotencyRecords: Map<string, IdempotencyRecord> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Verified Stores
    const stores: BackendStore[] = [
      {
        id: 'STORE_001',
        ownerId: 'USER_001',
        name: 'RAHIM PHARMACY',
        nameBn: 'রহিম ফার্মেসি',
        logo: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=1200&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 1250,
        category: 'Pharmacy & Healthcare',
        categoryBn: 'ফার্মেসি ও স্বাস্থ্যসেবা',
        location: 'Dhanmondi, Dhaka',
        isVerified: true,
        status: 'active',
        joinedYear: 2019
      },
      {
        id: 'STORE_002',
        ownerId: 'USER_002',
        name: 'Anker Bangladesh Official Store',
        nameBn: 'অ্যাঙ্কার বাংলাদেশ অফিসিয়াল স্টোর',
        logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewCount: 3420,
        category: 'Electronics & Audio Gadgets',
        categoryBn: 'ইলেকট্রনিক্স ও অডিও গ্যাজেট',
        location: 'Gulshan 1, Dhaka',
        isVerified: true,
        status: 'active',
        joinedYear: 2021
      },
      {
        id: 'STORE_003',
        ownerId: 'USER_003',
        name: 'Xiaomi Authorized Flagship Store',
        nameBn: 'শাওমি অথরাইজড ফ্ল্যাগশিপ স্টোর',
        logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 4500,
        category: 'Mobiles & Smart Gadgets',
        categoryBn: 'মোবাইল ও স্মার্ট গ্যাজেট',
        location: 'Bashundhara City, Dhaka',
        isVerified: true,
        status: 'active',
        joinedYear: 2020
      }
    ];
    stores.forEach((s) => this.stores.set(s.id, s));

    // 2. Seed Authoritative Products with Sensitive Fields
    const now = new Date().toISOString();
    const products: BackendProduct[] = [
      {
        id: 'p1',
        storeId: 'STORE_002',
        title: 'Anker Soundcore Life P2i True Wireless Earbuds',
        titleBn: 'অ্যাঙ্কার সাউন্ডকোর লাইফ পি২আই ওয়্যারলেস এয়ারবাডস',
        description: '10mm Drivers, 28-Hour Playtime, Fast Charging, 2-Mic AI Clear Calls, IPX5 Waterproof.',
        descriptionBn: '১০ মিমি শক্তিশালী ড্রাইভ ও ২৮ ঘণ্টার প্লেটাইম। আইপিএক্স৫ ওয়াটারপ্রুফ রেটিং।',
        price: 2450,
        originalPrice: 3200,
        discountPercent: 23,
        stock: 45,
        soldCount: 412,
        category: 'electronics',
        categoryBn: 'ইলেকট্রনিক্স',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80'
        ],
        brand: 'Anker',
        isPublished: true,
        rating: 4.8,
        reviewCount: 312,
        isDarazMall: true,
        isFreeDelivery: true,
        isFlashSale: true,
        supplierCost: 1750,
        internalMargin: 700,
        privateNotes: 'Direct distributor consignment from Anker HQ',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'p2',
        storeId: 'STORE_001',
        title: 'Mens Premium Cotton Semi-Fitted Panjabi - Black',
        titleBn: 'পুরুষদের প্রিমিয়াম সুতি সেমি-ফিটেড পাঞ্জাবি - কালো',
        description: '100% Cotton, Breathable and lightweight fabric with elegant embroidery on chest and collar.',
        descriptionBn: '১০০% খাঁটি কটন ফ্যাব্রিক ও সূক্ষ্ম সুতার হাতের কাজ করা।',
        price: 3490,
        originalPrice: 4500,
        discountPercent: 22,
        stock: 30,
        soldCount: 184,
        category: 'fashion',
        categoryBn: 'ফ্যাশন',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
        gallery: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'],
        brand: 'Aarong Fabric',
        isPublished: true,
        rating: 4.7,
        reviewCount: 145,
        isDarazMall: true,
        isFreeDelivery: false,
        supplierCost: 2200,
        internalMargin: 1290,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'p3',
        storeId: 'STORE_003',
        title: 'Xiaomi Smart Band 8 Active - 1.47" Display',
        titleBn: 'শাওমি স্মার্ট ব্যান্ড ৮ অ্যাক্টিভ - ১.৪৭ ইঞ্চি ডিসপ্লে',
        description: '50+ Sports Modes, 14-Day Battery Life, 5ATM Water Resistant, SpO2 & Heart Rate Monitoring.',
        descriptionBn: '৫০টিরও বেশি স্পোর্টস মোড ও ১৪ দিনের দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ।',
        price: 2890,
        originalPrice: 3800,
        discountPercent: 24,
        stock: 60,
        soldCount: 520,
        category: 'smartphones',
        categoryBn: 'স্মার্টফোন ও গ্যাজেট',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=80',
        gallery: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80'],
        brand: 'Xiaomi',
        isPublished: true,
        rating: 4.6,
        reviewCount: 420,
        isDarazMall: true,
        isFreeDelivery: true,
        supplierCost: 2100,
        internalMargin: 790,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'p4',
        storeId: 'STORE_001',
        title: 'Napa Extend 665mg Paracetamol Tablet (Box of 100)',
        titleBn: 'নাপা এক্সটেন্ড ৬৬৫মিগ্রা প্যারাসিটামল ট্যাবলেট (১০০টি)',
        description: 'Original Beximco Pharmaceuticals Fever & Pain Relief tablets. 100% Authentic.',
        descriptionBn: 'বেক্সিমকো ফার্মাসিউটিক্যালসের অরিজিনাল ব্যথানাশক ওষুধ।',
        price: 200,
        originalPrice: 200,
        discountPercent: 0,
        stock: 150,
        soldCount: 890,
        category: 'health_beauty',
        categoryBn: 'ফার্মেসি ও স্বাস্থ্যসেবা',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
        gallery: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'],
        brand: 'Beximco Pharma',
        isPublished: true,
        rating: 4.9,
        reviewCount: 230,
        supplierCost: 175,
        internalMargin: 25,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'p-unpublished-99',
        storeId: 'STORE_001',
        title: 'Unpublished Internal Draft Item',
        titleBn: 'ড্রাফট আইটেম (পাবলিশড নয়)',
        description: 'Internal testing product, should never appear on marketplace API.',
        descriptionBn: 'অভ্যন্তরীণ টেস্টিং পণ্য।',
        price: 9999,
        originalPrice: 9999,
        discountPercent: 0,
        stock: 5,
        soldCount: 0,
        category: 'electronics',
        categoryBn: 'ইলেকট্রনিক্স',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80',
        gallery: [],
        brand: 'Internal',
        isPublished: false,
        rating: 0,
        reviewCount: 0,
        supplierCost: 5000,
        internalMargin: 4999,
        createdAt: now,
        updatedAt: now
      }
    ];
    products.forEach((p) => this.products.set(p.id, p));

    // 3. Seed Valid Authoritative Vouchers
    const vouchers: BackendVoucher[] = [
      {
        code: 'DARAZMEGA',
        titleEn: 'Mega Shopping Fest ৳300 OFF',
        titleBn: 'মেগা শপিং ফেস্টিভ্যাল ৳৩০০ ছাড়',
        discountType: 'fixed',
        discountValue: 300,
        minSpend: 2000,
        expiresAt: '2026-12-31',
        isActive: true
      },
      {
        code: 'SMART2026',
        titleEn: 'Smart Shopping Welcome ৳200 OFF',
        titleBn: 'স্মার্ট শপিং ওয়েলকাম ৳২০০ ছাড়',
        discountType: 'fixed',
        discountValue: 200,
        minSpend: 1500,
        expiresAt: '2026-12-31',
        isActive: true
      },
      {
        code: 'FREESHIP',
        titleEn: 'Free Delivery on Orders Over ৳1000',
        titleBn: '১০০০ টাকার উপরে ফ্রি ডেলিভারি',
        discountType: 'fixed',
        discountValue: 60,
        minSpend: 1000,
        expiresAt: '2026-12-31',
        isActive: true
      }
    ];
    vouchers.forEach((v) => this.vouchers.set(v.code.toUpperCase(), v));

    // 4. Seed Default Customers
    const defaultCustomer: BackendCustomer = {
      id: 'CUST-DEMO-01712',
      phone: '01712345678',
      email: 'tanvir.ahmed@example.com',
      fullName: 'মো. তানভীর আহমেদ',
      displayName: 'তানভীর আহমেদ',
      roles: ['customer'],
      status: 'active',
      coins: 250,
      createdAt: now
    };
    this.customers.set(defaultCustomer.id, defaultCustomer);
  }

  async getPublishedProducts(filters?: ProductQueryFilters): Promise<BackendProduct[]> {
    let result = Array.from(this.products.values()).filter((p) => {
      if (!p.isPublished) return false;
      const store = this.stores.get(p.storeId);
      if (store && store.status !== 'active') return false;
      return true;
    });

    if (filters?.category && filters.category !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters?.storeId) {
      result = result.filter((p) => p.storeId === filters.storeId);
    }

    return result;
  }

  async getProductById(productId: string): Promise<BackendProduct | undefined> {
    return this.products.get(productId);
  }

  async getStore(storeId: string): Promise<BackendStore | undefined> {
    return this.stores.get(storeId);
  }

  async getVoucher(code: string): Promise<BackendVoucher | undefined> {
    return this.vouchers.get(code.trim().toUpperCase());
  }

  async getCustomer(customerId: string): Promise<BackendCustomer | undefined> {
    return this.customers.get(customerId);
  }

  async saveCustomer(customer: BackendCustomer): Promise<void> {
    this.customers.set(customer.id, customer);
  }

  async getIdempotencyRecord(key: string): Promise<IdempotencyRecord | undefined> {
    return this.idempotencyRecords.get(key);
  }

  async saveIdempotencyRecord(key: string, orderId: string, response: any): Promise<void> {
    this.idempotencyRecords.set(key, {
      orderId,
      response,
      createdAt: Date.now()
    });
  }

  async getOrder(orderId: string): Promise<BackendOrder | undefined> {
    return this.orders.get(orderId);
  }

  async getOrdersByCustomer(customerId: string): Promise<BackendOrder[]> {
    return Array.from(this.orders.values())
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrderTransaction(order: BackendOrder): Promise<OrderCreationResult> {
    // 1. Transactional pre-validation: Verify stock for all items
    for (const item of order.items) {
      const product = this.products.get(item.productId);
      if (!product) {
        return {
          success: false,
          code: 'PRODUCT_NOT_FOUND',
          error: `Product with ID ${item.productId} does not exist.`
        };
      }
      if (!product.isPublished) {
        return {
          success: false,
          code: 'PRODUCT_UNPUBLISHED',
          error: `Product "${product.title}" is currently unpublished.`
        };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          code: 'INSUFFICIENT_STOCK',
          error: `Insufficient stock for product "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}`
        };
      }
    }

    // 2. Decrement stock atomically (simulating BEGIN TRANSACTION / COMMIT)
    for (const item of order.items) {
      const product = this.products.get(item.productId)!;
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      product.updatedAt = new Date().toISOString();
      this.products.set(product.id, product);
    }

    // 3. Save Order
    this.orders.set(order.id, order);

    return { success: true, order };
  }
}
