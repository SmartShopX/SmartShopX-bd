import { AuthState, CartItem, CustomerSession, DeliveryAddress, Order, Product, Voucher, Store, StoreReview, UserAccount, SavedAddress, CoinTransaction } from '../types';
import { MOCK_PRODUCTS, MOCK_VOUCHERS, MOCK_STORES, MOCK_STORE_REVIEWS } from '../data/mockProducts';
import { SupabaseService } from './supabaseService';

const STORAGE_KEYS = {
  PRODUCTS_CACHE: 'daraz_pwa_cached_products',
  STORES_CACHE: 'smartshopx_cached_stores',
  STORE_REVIEWS: 'smartshopx_cached_store_reviews',
  CART: 'daraz_pwa_cart',
  WISHLIST: 'daraz_pwa_wishlist',
  VIEWED_HISTORY: 'daraz_pwa_viewed_history',
  VOUCHERS: 'daraz_pwa_vouchers',
  ORDERS: 'daraz_pwa_orders',
  PENDING_OFFLINE_ORDERS: 'daraz_pwa_pending_orders_queue',
  ADDRESS: 'daraz_pwa_user_address',
  COINS: 'daraz_pwa_coins',
  LANGUAGE: 'daraz_pwa_lang',
  LAST_CHECKIN: 'daraz_pwa_last_checkin',
  SESSION: 'smartshopx_customer_session',
  AUTH_STATE: 'smartshopx_auth_state',
  USERS_DB: 'smartshopx_users_database'
};

export const INITIAL_MOCK_USERS: UserAccount[] = [
  {
    id: 'USER-01712345678',
    fullName: 'মো. তানভীর আহমেদ',
    displayName: 'তানভীর আহমেদ',
    phone: '01712345678',
    email: 'tanvir.ahmed@example.com',
    password: 'password123',
    gender: 'male',
    birthDate: '1994-05-12',
    membershipLevel: 'Gold',
    joinedDate: '২০২৪-০১-১৫',
    coins: 250,
    vouchers: ['SMART2026', 'FREESHIP', 'SMART10'],
    isVerified: true,
    addresses: [
      {
        id: 'ADDR-1',
        fullName: 'মো. তানভীর আহমেদ',
        phone: '01712345678',
        division: 'dhaka',
        city: 'Dhaka - North',
        zone: 'Gulshan / Banani',
        addressDetails: 'House 42, Road 11, Block D',
        label: 'home',
        isDefault: true,
        postalCode: '1212'
      },
      {
        id: 'ADDR-2',
        fullName: 'তানভীর আহমেদ (অফিস)',
        phone: '01712345678',
        division: 'dhaka',
        city: 'Dhaka - South',
        zone: 'Motijheel C/A',
        addressDetails: 'Level 7, City Centre, Motijheel',
        label: 'office',
        isDefault: false,
        postalCode: '1000'
      }
    ],
    coinHistory: [
      { id: 'COIN-1', type: 'earned', amount: 50, reason: 'Registration Bonus', reasonBn: 'নতুন অ্যাকাউন্ট খোলার বোনাস', date: '২০২৪-০১-১৫' },
      { id: 'COIN-2', type: 'earned', amount: 150, reason: 'Eid Shopping Reward', reasonBn: 'ঈদের কেনাকাটার রিওয়ার্ড', date: '২০২৬-০৮-১৫' },
      { id: 'COIN-3', type: 'spent', amount: 50, reason: 'Discount on ORD-2026-9821', reasonBn: 'অর্ডার ৯৮২১ এ ডিসকাউন্ট', date: '২০২৬-০৯-১৫' },
      { id: 'COIN-4', type: 'earned', amount: 100, reason: 'Daily Check-in & Reviews', reasonBn: 'প্রতিদিনের চেক-ইন ও পণ্যের রিভিউ', date: '২০২৬-০৯-২০' }
    ]
  },
  {
    id: 'USER-01812345678',
    fullName: 'সাদিয়া রহমান',
    displayName: 'সাদিয়া রহমান',
    phone: '01812345678',
    email: 'sadia.rahman@example.com',
    password: 'password123',
    gender: 'female',
    birthDate: '1998-11-24',
    membershipLevel: 'Silver',
    joinedDate: '২০২৪-০৬-২০',
    coins: 180,
    vouchers: ['FREESHIP', 'SMART10'],
    isVerified: true,
    addresses: [
      {
        id: 'ADDR-3',
        fullName: 'সাদিয়া রহমান',
        phone: '01812345678',
        division: 'chattogram',
        city: 'Chattogram Metro',
        zone: 'Nasirabad Housing Society',
        addressDetails: 'Flat 4B, Green Villa, Road 2',
        label: 'home',
        isDefault: true,
        postalCode: '4000'
      },
      {
        id: 'ADDR-4',
        fullName: 'সাদিয়া রহমান (অফিস)',
        phone: '01812345678',
        division: 'chattogram',
        city: 'Chattogram Metro',
        zone: 'Agrabad C/A',
        addressDetails: 'World Trade Center, Agrabad',
        label: 'office',
        isDefault: false,
        postalCode: '4100'
      }
    ],
    coinHistory: [
      { id: 'COIN-5', type: 'earned', amount: 50, reason: 'Sign-up Bonus', reasonBn: 'নতুন ইউজার বোনাস', date: '২০২৪-০৬-২০' },
      { id: 'COIN-6', type: 'earned', amount: 130, reason: 'Order Cashback', reasonBn: 'অর্ডার ক্যাশব্যাক পয়েন্ট', date: '২০২৬-০৭-১০' }
    ]
  },
  {
    id: 'USER-01912345678',
    fullName: 'রহিম উদ্দিন',
    displayName: 'রহিম উদ্দিন',
    phone: '01912345678',
    email: 'rahim.uddin@example.com',
    password: 'password123',
    gender: 'male',
    birthDate: '1989-02-18',
    membershipLevel: 'VIP Diamond',
    joinedDate: '২০২৩-০৯-১০',
    coins: 500,
    vouchers: ['SMART2026', 'FREESHIP', 'SMART10'],
    isVerified: true,
    addresses: [
      {
        id: 'ADDR-5',
        fullName: 'রহিম উদ্দিন',
        phone: '01912345678',
        division: 'sylhet',
        city: 'Sylhet Sadar',
        zone: 'Zindabazar',
        addressDetails: 'House 14, VIP Road, Zindabazar',
        label: 'home',
        isDefault: true,
        postalCode: '3100'
      }
    ],
    coinHistory: [
      { id: 'COIN-7', type: 'earned', amount: 500, reason: 'VIP Diamond Milestone', reasonBn: 'ভিআইপি ডায়মন্ড বোনাস', date: '২০২৬-০১-০১' }
    ]
  }
];

export class StorageService {
  // Initialize and ensure products are cached locally with store associations
  static initializeCatalog(): Product[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasStores = parsed.some((p: any) => p.storeId);
          const hasNapa = parsed.some((p: any) => p.id === 'napa-500');
          if (hasStores && hasNapa) {
            return parsed;
          }
        }
      }
      localStorage.setItem(STORAGE_KEYS.PRODUCTS_CACHE, JSON.stringify(MOCK_PRODUCTS));
      return MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  }

  static getStores(): Store[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STORES_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_KEYS.STORES_CACHE, JSON.stringify(MOCK_STORES));
      return MOCK_STORES;
    } catch {
      return MOCK_STORES;
    }
  }

  static getStoreById(storeId: string): Store | undefined {
    const stores = this.getStores();
    return stores.find((s) => s.id === storeId);
  }

  static getProductsByStore(storeId: string): Product[] {
    const products = this.getProducts();
    return products.filter((p) => p.storeId === storeId || p.seller?.name === storeId);
  }

  static getStoreReviews(storeId: string): StoreReview[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STORE_REVIEWS);
      const allReviews: StoreReview[] = cached ? JSON.parse(cached) : MOCK_STORE_REVIEWS;
      return allReviews.filter((r) => r.storeId === storeId);
    } catch {
      return MOCK_STORE_REVIEWS.filter((r) => r.storeId === storeId);
    }
  }

  static addStoreReview(review: StoreReview): void {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STORE_REVIEWS);
      const allReviews: StoreReview[] = cached ? JSON.parse(cached) : [...MOCK_STORE_REVIEWS];
      allReviews.unshift(review);
      localStorage.setItem(STORAGE_KEYS.STORE_REVIEWS, JSON.stringify(allReviews));
    } catch (e) {
      console.error('Error adding store review', e);
    }
  }

  static getProducts(): Product[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
      return cached ? JSON.parse(cached) : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  }

  static saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS_CACHE, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products catalog', e);
    }
  }

  static getCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: any) => item && item.product && item.product.image);
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  static saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to storage', e);
    }
  }

  // Customer Session & Auth State Management (P1 Hardened)
  static getSession(): CustomerSession | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  static saveSession(session: CustomerSession | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'AUTHENTICATED');
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'LOGGED_OUT');
      }
    } catch (e) {
      console.error('Error saving customer session', e);
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'LOGGED_OUT');
    } catch (e) {
      console.error('Error clearing customer session', e);
    }
  }

  static getAuthState(): AuthState {
    try {
      const state = localStorage.getItem(STORAGE_KEYS.AUTH_STATE) as AuthState | null;
      if (state) return state;
      const session = this.getSession();
      return session?.isAuthenticated ? 'AUTHENTICATED' : 'LOGGED_OUT';
    } catch {
      return 'LOGGED_OUT';
    }
  }

  static saveAuthState(state: AuthState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, state);
    } catch (e) {
      console.error('Error saving auth state', e);
    }
  }

  // ==========================================
  // USER ACCOUNT DATABASE & MANAGEMENT
  // ==========================================
  static getUsers(): UserAccount[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(INITIAL_MOCK_USERS));
      return INITIAL_MOCK_USERS;
    } catch {
      return INITIAL_MOCK_USERS;
    }
  }

  static saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users database', e);
    }
  }

  static getUserById(id: string): UserAccount | undefined {
    const users = this.getUsers();
    return users.find((u) => u.id === id || u.phone === id || `CUST-${u.phone.slice(-6)}` === id);
  }

  static getUserByPhoneOrEmail(query: string): UserAccount | undefined {
    const q = query.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(
      (u) =>
        u.phone.trim() === q ||
        u.phone.replace(/\D/g, '').endsWith(q.replace(/\D/g, '')) ||
        (u.email && u.email.toLowerCase().trim() === q)
    );
  }

  static registerUser(data: {
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    division?: string;
    city?: string;
    zone?: string;
    addressDetails?: string;
  }): { success: boolean; user?: UserAccount; message: string; messageBn: string } {
    try {
      const users = this.getUsers();
      const cleanPhone = data.phone.trim();
      const existing = users.find(
        (u) => u.phone === cleanPhone || (data.email && u.email.toLowerCase() === data.email.toLowerCase())
      );

      if (existing) {
        return {
          success: false,
          message: 'This mobile number or email is already registered. Please login.',
          messageBn: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।'
        };
      }

      const userId = `USER-${cleanPhone.slice(-11)}`;
      const defaultAddress: SavedAddress = {
        id: `ADDR-${Date.now()}`,
        fullName: data.fullName,
        phone: cleanPhone,
        division: data.division || 'dhaka',
        city: data.city || 'Dhaka - North',
        zone: data.zone || 'Gulshan / Banani',
        addressDetails: data.addressDetails || 'House 42, Road 11',
        label: 'home',
        isDefault: true,
        postalCode: '1200'
      };

      const newUser: UserAccount = {
        id: userId,
        fullName: data.fullName,
        displayName: data.fullName.split(' ')[0] || data.fullName,
        phone: cleanPhone,
        email: data.email || `${cleanPhone}@smartshopx.bd`,
        password: data.password || 'password123',
        gender: 'other',
        birthDate: '2000-01-01',
        membershipLevel: 'Bronze',
        joinedDate: new Date().toISOString().split('T')[0],
        coins: 200, // 150 base + 50 signup bonus
        vouchers: ['SMART2026', 'FREESHIP'],
        isVerified: true,
        addresses: [defaultAddress],
        coinHistory: [
          {
            id: `COIN-REG-${Date.now()}`,
            type: 'earned',
            amount: 50,
            reason: 'New Account Welcome Gift (+50 SmartCoins)',
            reasonBn: 'নতুন গ্রাহক রেজিস্ট্রেশন উপহার (+৫০ কয়েন)',
            date: new Date().toISOString().split('T')[0]
          }
        ]
      };

      users.unshift(newUser);
      this.saveUsers(users);

      // Create session
      const session: CustomerSession = {
        customerId: `CUST-${cleanPhone.slice(-6)}`,
        displayName: newUser.displayName,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        gender: newUser.gender,
        birthDate: newUser.birthDate,
        membershipLevel: newUser.membershipLevel,
        coins: newUser.coins,
        isAuthenticated: true,
        accessToken: `demo-token-${Date.now()}`,
        refreshToken: null,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        mode: 'demo_session'
      };

      this.saveSession(session);
      this.saveAddress(defaultAddress);
      this.saveCoins(newUser.coins);

      // Async sync customer to Supabase Cloud Database
      SupabaseService.syncUserToCloud(newUser).catch(() => {});

      return {
        success: true,
        user: newUser,
        message: 'Account successfully created with +50 Bonus SmartCoins!',
        messageBn: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং ৫০টি ওয়েলকাম কয়েন যোগ হয়েছে!'
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Failed to create account.',
        messageBn: 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
      };
    }
  }

  static updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserAccount, 'id' | 'addresses' | 'coinHistory'>>
  ): { success: boolean; user?: UserAccount } {
    try {
      const users = this.getUsers();
      const idx = users.findIndex(
        (u) => u.id === userId || u.phone === userId || `CUST-${u.phone.slice(-6)}` === userId
      );

      if (idx === -1) return { success: false };

      users[idx] = {
        ...users[idx],
        ...updates
      };

      this.saveUsers(users);

      // Update current session if matching
      const session = this.getSession();
      if (session && (session.phone === users[idx].phone || session.customerId === `CUST-${users[idx].phone.slice(-6)}`)) {
        const updatedSession: CustomerSession = {
          ...session,
          fullName: users[idx].fullName,
          displayName: users[idx].displayName || users[idx].fullName,
          email: users[idx].email,
          gender: users[idx].gender,
          birthDate: users[idx].birthDate,
          membershipLevel: users[idx].membershipLevel
        };
        this.saveSession(updatedSession);
      }

      return { success: true, user: users[idx] };
    } catch {
      return { success: false };
    }
  }

  // Address book management
  static getUserAddresses(userId: string): SavedAddress[] {
    const user = this.getUserById(userId);
    if (user && Array.isArray(user.addresses) && user.addresses.length > 0) {
      return user.addresses;
    }
    // Fallback to default
    const addr = this.getAddress();
    return [
      {
        id: 'ADDR-DEFAULT',
        ...addr,
        isDefault: true
      }
    ];
  }

  static addUserAddress(userId: string, address: Omit<SavedAddress, 'id'>): { success: boolean; addresses: SavedAddress[] } {
    try {
      const users = this.getUsers();
      const idx = users.findIndex(
        (u) => u.id === userId || u.phone === userId || `CUST-${u.phone.slice(-6)}` === userId
      );
      if (idx === -1) return { success: false, addresses: [] };

      const newId = `ADDR-${Date.now()}`;
      const newAddress: SavedAddress = {
        ...address,
        id: newId
      };

      if (newAddress.isDefault) {
        users[idx].addresses = users[idx].addresses.map((a) => ({ ...a, isDefault: false }));
        this.saveAddress(newAddress);
      }

      users[idx].addresses.unshift(newAddress);
      this.saveUsers(users);
      return { success: true, addresses: users[idx].addresses };
    } catch {
      return { success: false, addresses: [] };
    }
  }

  static updateUserAddress(userId: string, addressId: string, updates: Partial<SavedAddress>): { success: boolean; addresses: SavedAddress[] } {
    try {
      const users = this.getUsers();
      const idx = users.findIndex(
        (u) => u.id === userId || u.phone === userId || `CUST-${u.phone.slice(-6)}` === userId
      );
      if (idx === -1) return { success: false, addresses: [] };

      if (updates.isDefault) {
        users[idx].addresses = users[idx].addresses.map((a) => ({ ...a, isDefault: false }));
      }

      users[idx].addresses = users[idx].addresses.map((a) => (a.id === addressId ? { ...a, ...updates } : a));

      const defaultAddr = users[idx].addresses.find((a) => a.isDefault);
      if (defaultAddr) this.saveAddress(defaultAddr);

      this.saveUsers(users);
      return { success: true, addresses: users[idx].addresses };
    } catch {
      return { success: false, addresses: [] };
    }
  }

  static deleteUserAddress(userId: string, addressId: string): { success: boolean; addresses: SavedAddress[] } {
    try {
      const users = this.getUsers();
      const idx = users.findIndex(
        (u) => u.id === userId || u.phone === userId || `CUST-${u.phone.slice(-6)}` === userId
      );
      if (idx === -1) return { success: false, addresses: [] };

      const wasDefault = users[idx].addresses.find((a) => a.id === addressId)?.isDefault;
      users[idx].addresses = users[idx].addresses.filter((a) => a.id !== addressId);

      if (wasDefault && users[idx].addresses.length > 0) {
        users[idx].addresses[0].isDefault = true;
        this.saveAddress(users[idx].addresses[0]);
      }

      this.saveUsers(users);
      return { success: true, addresses: users[idx].addresses };
    } catch {
      return { success: false, addresses: [] };
    }
  }

  static setDefaultUserAddress(userId: string, addressId: string): { success: boolean; addresses: SavedAddress[] } {
    return this.updateUserAddress(userId, addressId, { isDefault: true });
  }

  static changeUserPassword(userId: string, oldPass: string, newPass: string): { success: boolean; message: string; messageBn: string } {
    try {
      const users = this.getUsers();
      const idx = users.findIndex(
        (u) => u.id === userId || u.phone === userId || `CUST-${u.phone.slice(-6)}` === userId
      );
      if (idx === -1) {
        return { success: false, message: 'User not found', messageBn: 'গ্রাহক পাওয়া যায়নি' };
      }

      if (users[idx].password && users[idx].password !== oldPass) {
        return { success: false, message: 'Current password does not match.', messageBn: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' };
      }

      users[idx].password = newPass;
      this.saveUsers(users);
      return { success: true, message: 'Password successfully changed!', messageBn: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' };
    } catch {
      return { success: false, message: 'Failed to update password', messageBn: 'পাসওয়ার্ড পরিবর্তনে ব্যর্থ হয়েছে' };
    }
  }

  static resetPasswordByPhone(phone: string, newPass: string): { success: boolean; message: string; messageBn: string } {
    try {
      const users = this.getUsers();
      const clean = phone.trim();
      const idx = users.findIndex((u) => u.phone === clean);
      if (idx === -1) {
        return { success: false, message: 'No account registered with this phone number.', messageBn: 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' };
      }
      users[idx].password = newPass;
      this.saveUsers(users);
      return { success: true, message: 'Password reset successfully. Please login with your new password.', messageBn: 'পাসওয়ার্ড রিসেট সফল হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' };
    } catch {
      return { success: false, message: 'Password reset failed', messageBn: 'পাসওয়ার্ড রিসেট করা যায়নি' };
    }
  }

  static getWishlist(customerId?: string): string[] {
    try {
      const key = customerId ? `${STORAGE_KEYS.WISHLIST}_${customerId}` : STORAGE_KEYS.WISHLIST;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      // Fallback to shared baseline in demo mode
      const shared = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return shared ? JSON.parse(shared) : [];
    } catch {
      return [];
    }
  }

  static saveWishlist(wishlist: string[], customerId?: string): void {
    try {
      const key = customerId ? `${STORAGE_KEYS.WISHLIST}_${customerId}` : STORAGE_KEYS.WISHLIST;
      localStorage.setItem(key, JSON.stringify(wishlist));
      // Keep shared in sync for seamless demo experience
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to storage', e);
    }
  }

  static getViewedHistory(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEWED_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      // Seed with initial authentic viewed items if clean
      const initial = ['p1', 'p4', 'p2'];
      localStorage.setItem(STORAGE_KEYS.VIEWED_HISTORY, JSON.stringify(initial));
      return initial;
    } catch {
      return ['p1', 'p4', 'p2'];
    }
  }

  static recordProductView(productId: string): string[] {
    try {
      if (!productId) return [];
      const current = StorageService.getViewedHistory();
      // Put at front, remove duplicates, limit to 20 items
      const updated = [productId, ...current.filter((id) => id !== productId)].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.VIEWED_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error saving viewed history', e);
      return [];
    }
  }

  static clearViewedHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.VIEWED_HISTORY);
    } catch (e) {
      console.error('Error clearing viewed history', e);
    }
  }

  static getVouchers(): Voucher[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
      return saved ? JSON.parse(saved) : MOCK_VOUCHERS;
    } catch {
      return MOCK_VOUCHERS;
    }
  }

  static saveVouchers(vouchers: Voucher[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(vouchers));
    } catch (e) {
      console.error('Error saving vouchers', e);
    }
  }

  static getAddress(): DeliveryAddress {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADDRESS);
      return saved
        ? JSON.parse(saved)
        : {
            fullName: 'মো. তানভীর আহমেদ',
            phone: '01712345678',
            division: 'dhaka',
            city: 'Dhaka - North',
            zone: 'Gulshan / Banani',
            addressDetails: 'House 42, Road 11, Block D',
            label: 'home'
          };
    } catch {
      return {
        fullName: 'মো. তানভীর আহমেদ',
        phone: '01712345678',
        division: 'dhaka',
        city: 'Dhaka - North',
        zone: 'Gulshan / Banani',
        addressDetails: 'House 42, Road 11, Block D',
        label: 'home'
      };
    }
  }

  static saveAddress(addr: DeliveryAddress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADDRESS, JSON.stringify(addr));
    } catch (e) {
      console.error('Error saving address', e);
    }
  }

  static getCoins(): number {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COINS);
      return saved ? parseInt(saved, 10) : 150; // default 150 daraz coins (৳15)
    } catch {
      return 150;
    }
  }

  static saveCoins(coins: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
    } catch (e) {
      console.error('Error saving coins', e);
    }
  }

  static getOrders(customerId?: string): Order[] {
    try {
      const key = customerId ? `${STORAGE_KEYS.ORDERS}_${customerId}` : STORAGE_KEYS.ORDERS;
      const saved = localStorage.getItem(key) || (!customerId || customerId === 'CUST-DEMO-01712' ? localStorage.getItem(STORAGE_KEYS.ORDERS) : null);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((order: any) => ({
            ...order,
            items: (order.items || []).map((item: any) => {
              const matchedProduct =
                item.product ||
                MOCK_PRODUCTS.find((p) => p.id === item.id || p.id === item.productId) ||
                MOCK_PRODUCTS[0];
              return {
                ...item,
                product: matchedProduct,
                quantity: item.quantity || 1
              };
            })
          }));
        }
      }

      if (customerId && customerId !== 'CUST-DEMO-01712') {
        return [];
      }

      // Provide authentic 6-month historical orders if none exist
      const defaultOrders: Order[] = [
        {
          id: 'ORD-2026-9821',
          items: [
            {
              product: MOCK_PRODUCTS[0], // Anker Soundcore
              quantity: 1,
              selectedColor: 'Black'
            },
            {
              product: MOCK_PRODUCTS[1], // Panjabi
              quantity: 1,
              selectedSize: '42'
            }
          ],
          totalAmount: 6240,
          discountAmount: 300,
          deliveryFee: 0,
          finalAmount: 5940,
          paymentMethod: 'bkash',
          appliedVoucher: 'DARAZMEGA',
          coinsUsed: 50,
          coinsDiscount: 5,
          address: {
            fullName: 'মো. তানভীর আহমেদ',
            phone: '01712345678',
            division: 'dhaka',
            city: 'Dhaka - North',
            zone: 'Gulshan / Banani',
            addressDetails: 'House 42, Road 11, Block D',
            label: 'home'
          },
          status: 'synced',
          orderDate: '2026-09-15 14:30',
          syncedAt: '2026-09-15T14:30:00Z',
          isOfflineCreated: false,
          trackingSteps: [
            { step: 'Order Placed', stepBn: 'অর্ডার গৃহীত হয়েছে', completed: true, time: '15 Sep, 2:30 PM' },
            { step: 'Processing', stepBn: 'প্যাকেজিং ও ভেরিফিকেশন সম্পন্ন', completed: true, time: '15 Sep, 4:10 PM' },
            { step: 'Handed to Courier', stepBn: 'রেডএক্স কুরিয়ারে হস্তান্তর', completed: true, time: '16 Sep, 10:00 AM' },
            { step: 'Delivered', stepBn: 'সফলভাবে ডেলিভারি সম্পন্ন', completed: true, time: '17 Sep, 1:45 PM' }
          ]
        },
        {
          id: 'ORD-2026-8432',
          items: [
            {
              product: MOCK_PRODUCTS[2], // Xiaomi Smart Band
              quantity: 1
            }
          ],
          totalAmount: 4200,
          discountAmount: 200,
          deliveryFee: 60,
          finalAmount: 4060,
          paymentMethod: 'nagad',
          appliedVoucher: 'TECHSAVER',
          address: {
            fullName: 'মো. তানভীর আহমেদ',
            phone: '01712345678',
            division: 'dhaka',
            city: 'Dhaka - North',
            zone: 'Gulshan / Banani',
            addressDetails: 'House 42, Road 11, Block D',
            label: 'home'
          },
          status: 'synced',
          orderDate: '2026-08-22 11:15',
          syncedAt: '2026-08-22T11:15:00Z',
          isOfflineCreated: false,
          trackingSteps: [
            { step: 'Order Placed', stepBn: 'অর্ডার গৃহীত হয়েছে', completed: true, time: '22 Aug' },
            { step: 'Processing', stepBn: 'প্রক্রিয়াধীন', completed: true, time: '22 Aug' },
            { step: 'In Transit', stepBn: 'ডেলিভারির পথে', completed: true, time: '23 Aug' },
            { step: 'Delivered', stepBn: 'ডেলিভারি সম্পন্ন', completed: true, time: '24 Aug' }
          ]
        },
        {
          id: 'ORD-2026-7219',
          items: [
            {
              product: MOCK_PRODUCTS[4], // Baseus 65W GaN Charger
              quantity: 2
            },
            {
              product: MOCK_PRODUCTS[5], // Organic Mustard Oil
              quantity: 2
            }
          ],
          totalAmount: 7600,
          discountAmount: 450,
          deliveryFee: 0,
          finalAmount: 7150,
          paymentMethod: 'card',
          address: {
            fullName: 'মো. তানভীর আহমেদ',
            phone: '01712345678',
            division: 'dhaka',
            city: 'Dhaka - North',
            zone: 'Gulshan / Banani',
            addressDetails: 'House 42, Road 11, Block D',
            label: 'home'
          },
          status: 'synced',
          orderDate: '2026-07-19 16:40',
          syncedAt: '2026-07-19T16:40:00Z',
          isOfflineCreated: false,
          trackingSteps: [
            { step: 'Order Placed', stepBn: 'অর্ডার গৃহীত হয়েছে', completed: true, time: '19 Jul' },
            { step: 'Processing', stepBn: 'প্রক্রিয়াধীন', completed: true, time: '19 Jul' },
            { step: 'In Transit', stepBn: 'ডেলিভারির পথে', completed: true, time: '20 Jul' },
            { step: 'Delivered', stepBn: 'ডেলিভারি সম্পন্ন', completed: true, time: '21 Jul' }
          ]
        },
        {
          id: 'ORD-2026-6105',
          items: [
            {
              product: MOCK_PRODUCTS[3], // Philips Air Fryer
              quantity: 1
            }
          ],
          totalAmount: 11900,
          discountAmount: 1000,
          deliveryFee: 0,
          finalAmount: 10900,
          paymentMethod: 'bkash',
          appliedVoucher: 'EIDSPECIAL',
          address: {
            fullName: 'মো. তানভীর আহমেদ',
            phone: '01712345678',
            division: 'dhaka',
            city: 'Dhaka - North',
            zone: 'Gulshan / Banani',
            addressDetails: 'House 42, Road 11, Block D',
            label: 'home'
          },
          status: 'synced',
          orderDate: '2026-06-12 18:20',
          syncedAt: '2026-06-12T18:20:00Z',
          isOfflineCreated: false,
          trackingSteps: [
            { step: 'Order Placed', stepBn: 'অর্ডার গৃহীত হয়েছে', completed: true, time: '12 Jun' },
            { step: 'Processing', stepBn: 'প্রক্রিয়াধীন', completed: true, time: '12 Jun' },
            { step: 'In Transit', stepBn: 'ডেলিভারির পথে', completed: true, time: '13 Jun' },
            { step: 'Delivered', stepBn: 'ডেলিভারি সম্পন্ন', completed: true, time: '14 Jun' }
          ]
        },
        {
          id: 'ORD-2026-5390',
          items: [
            {
              product: MOCK_PRODUCTS[7], // Casual Polo Shirt
              quantity: 2
            },
            {
              product: MOCK_PRODUCTS[10], // Logitech Gaming Mouse
              quantity: 1
            }
          ],
          totalAmount: 5100,
          discountAmount: 350,
          deliveryFee: 60,
          finalAmount: 4810,
          paymentMethod: 'cod',
          address: {
            fullName: 'মো. তানভীর আহমেদ',
            phone: '01712345678',
            division: 'dhaka',
            city: 'Dhaka - North',
            zone: 'Gulshan / Banani',
            addressDetails: 'House 42, Road 11, Block D',
            label: 'home'
          },
          status: 'synced',
          orderDate: '2026-05-24 10:05',
          syncedAt: '2026-05-24T10:05:00Z',
          isOfflineCreated: false,
          trackingSteps: [
            { step: 'Order Placed', stepBn: 'অর্ডার গৃহীত হয়েছে', completed: true, time: '24 May' },
            { step: 'Processing', stepBn: 'প্রক্রিয়াধীন', completed: true, time: '24 May' },
            { step: 'In Transit', stepBn: 'ডেলিভারির পথে', completed: true, time: '25 May' },
            { step: 'Delivered', stepBn: 'ডেলিভারি সম্পন্ন', completed: true, time: '26 May' }
          ]
        },
        {
          id: 'ORD-2026-4128',
          items: [
            {
              product: MOCK_PRODUCTS[8], // The Ordinary Niacinamide Serum
              quantity: 2
            }
          ],
          totalAmount: 2900,
          discountAmount: 150,
          deliveryFee: 60,
          finalAmount: 2810,
          paymentMethod: 'bkash',
          address: {
            fullName: 'মো. তানভীর আহমেদ',
            phone: '01712345678',
            division: 'dhaka',
            city: 'Dhaka - North',
            zone: 'Gulshan / Banani',
            addressDetails: 'House 42, Road 11, Block D',
            label: 'home'
          },
          status: 'synced',
          orderDate: '2026-04-14 09:30',
          syncedAt: '2026-04-14T09:30:00Z',
          isOfflineCreated: false,
          trackingSteps: [
            { step: 'Order Placed', stepBn: 'অর্ডার গৃহীত হয়েছে', completed: true, time: '14 Apr' },
            { step: 'Processing', stepBn: 'প্রক্রিয়াধীন', completed: true, time: '14 Apr' },
            { step: 'In Transit', stepBn: 'ডেলিভারির পথে', completed: true, time: '15 Apr' },
            { step: 'Delivered', stepBn: 'ডেলিভারি সম্পন্ন', completed: true, time: '16 Apr' }
          ]
        }
      ];

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(defaultOrders));
      return defaultOrders;
    } catch {
      return [];
    }
  }

  static saveOrders(orders: Order[], customerId?: string): void {
    try {
      const key = customerId ? `${STORAGE_KEYS.ORDERS}_${customerId}` : STORAGE_KEYS.ORDERS;
      localStorage.setItem(key, JSON.stringify(orders));
      if (!customerId || customerId === 'CUST-DEMO-01712') {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }
    } catch (e) {
      console.error('Error saving orders', e);
    }
  }

  static getPendingOfflineOrders(): Order[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PENDING_OFFLINE_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static savePendingOfflineOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PENDING_OFFLINE_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving pending offline orders', e);
    }
  }

  // Create a new order (Online or Offline) with Idempotency Key protection (Section 8)
  static placeOrder(order: Order, isOnline: boolean): { success: boolean; isOffline: boolean; order: Order } {
    // Ensure unique identity & idempotency key
    const clientOrderId = order.clientOrderId || order.id;
    const idempotencyKey =
      order.idempotencyKey ||
      `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const normalizedOrder: Order = {
      ...order,
      clientOrderId,
      idempotencyKey,
      retryCount: order.retryCount || 0
    };

    if (!isOnline) {
      // Store in pending offline queue
      const pending = this.getPendingOfflineOrders();
      const offlineOrder: Order = {
        ...normalizedOrder,
        status: 'pending_offline_sync',
        isOfflineCreated: true
      };
      
      // Prevent duplicate pending entries with identical idempotencyKey or ID
      const existingPendingIdx = pending.findIndex(
        (p) => p.id === offlineOrder.id || (p.idempotencyKey && p.idempotencyKey === offlineOrder.idempotencyKey)
      );
      if (existingPendingIdx >= 0) {
        pending[existingPendingIdx] = offlineOrder;
      } else {
        pending.unshift(offlineOrder);
      }
      this.savePendingOfflineOrders(pending);

      // Also add to orders list for user visibility
      const orders = this.getOrders();
      const existingIdx = orders.findIndex((o) => o.id === offlineOrder.id);
      if (existingIdx >= 0) {
        orders[existingIdx] = offlineOrder;
      } else {
        orders.unshift(offlineOrder);
      }
      this.saveOrders(orders);

      return { success: true, isOffline: true, order: offlineOrder };
    } else {
      // Store as directly synced order
      const orders = this.getOrders();
      const syncedOrder: Order = {
        ...normalizedOrder,
        status: 'synced',
        isOfflineCreated: false,
        backendSynced: true,
        syncedAt: new Date().toISOString()
      };
      const existingIdx = orders.findIndex((o) => o.id === syncedOrder.id);
      if (existingIdx >= 0) {
        orders[existingIdx] = syncedOrder;
      } else {
        orders.unshift(syncedOrder);
      }
      this.saveOrders(orders);

      // Async sync to Supabase Cloud Database
      SupabaseService.syncOrderToCloud(syncedOrder).catch(() => {});

      return { success: true, isOffline: false, order: syncedOrder };
    }
  }

  /**
   * Mark a specific pending order as successfully synced to Central Backend (Section 7)
   * Safely removes it from pending queue and updates the order record.
   */
  static markOrderAsSynced(orderId: string, syncedAt?: string): Order | undefined {
    const timestamp = syncedAt || new Date().toISOString();
    
    // 1. Remove from pending queue
    const pending = this.getPendingOfflineOrders();
    const remainingPending = pending.filter((p) => p.id !== orderId);
    this.savePendingOfflineOrders(remainingPending);

    // 2. Update order status in main list
    const orders = this.getOrders();
    let updatedOrder: Order | undefined;
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        updatedOrder = {
          ...ord,
          status: 'synced' as const,
          backendSynced: true,
          syncedAt: timestamp,
          syncError: undefined,
          trackingSteps: ord.trackingSteps.map((s, idx) =>
            idx === 0 ? { ...s, completed: true, time: 'এইমাত্র সিঙ্ক হয়েছে (Just Now)' } : s
          )
        };
        return updatedOrder;
      }
      return ord;
    });

    this.saveOrders(updatedOrders);
    return updatedOrder;
  }

  /**
   * Record sync attempt failure on a pending order (Section 7 & 8)
   * KEEPS THE ORDER IN THE PENDING QUEUE. Never deletes on failure.
   */
  static recordPendingOrderFailure(orderId: string, errorMessage: string): void {
    const pending = this.getPendingOfflineOrders();
    const updatedPending = pending.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          retryCount: (ord.retryCount || 0) + 1,
          syncError: errorMessage
        };
      }
      return ord;
    });
    this.savePendingOfflineOrders(updatedPending);

    const orders = this.getOrders();
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          retryCount: (ord.retryCount || 0) + 1,
          syncError: errorMessage
        };
      }
      return ord;
    });
    this.saveOrders(updatedOrders);
  }

  // Sync pending offline orders when back online
  static syncPendingOrders(): { count: number; syncedOrders: Order[] } {
    const pending = this.getPendingOfflineOrders();
    if (pending.length === 0) return { count: 0, syncedOrders: [] };

    const orders = this.getOrders();
    const syncedOrders: Order[] = [];

    const updatedOrders = orders.map((ord) => {
      const isPending = pending.some((p) => p.id === ord.id);
      if (isPending) {
        const synced = {
          ...ord,
          status: 'synced' as const,
          syncedAt: new Date().toISOString(),
          trackingSteps: ord.trackingSteps.map((s, idx) =>
            idx === 0 ? { ...s, completed: true, time: 'এইমাত্র সিঙ্ক হয়েছে (Just Now)' } : s
          )
        };
        syncedOrders.push(synced);
        return synced;
      }
      return ord;
    });

    // Clear pending queue
    this.savePendingOfflineOrders([]);
    this.saveOrders(updatedOrders);

    return { count: syncedOrders.length, syncedOrders };
  }

  // Update delivery rating on an existing order
  static updateOrderDeliveryRating(
    orderId: string,
    ratingData: { rating: number; comment: string; tags: string[] }
  ): Order[] {
    const orders = this.getOrders();
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          deliveryRating: {
            rating: ratingData.rating,
            comment: ratingData.comment,
            tags: ratingData.tags,
            riderName: 'Express Delivery Rider',
            ratedAt: new Date().toISOString()
          }
        };
      }
      return ord;
    });
    this.saveOrders(updated);
    return updated;
  }

  // Advance status and tracking step of an order for real-time lifecycle
  static advanceOrderStatus(orderId?: string): {
    updatedOrders: Order[];
    changedOrder: Order | null;
    newStatus: 'processing' | 'shipped' | 'delivered' | null;
  } {
    const orders = this.getOrders();
    if (orders.length === 0) {
      return { updatedOrders: orders, changedOrder: null, newStatus: null };
    }

    let targetOrderIndex = -1;
    if (orderId) {
      targetOrderIndex = orders.findIndex((o) => o.id === orderId);
    } else {
      // Find the first order that is not fully delivered
      targetOrderIndex = orders.findIndex((o) => {
        const completedCount = o.trackingSteps?.filter((s) => s.completed).length || 0;
        return completedCount < 4;
      });
    }

    if (targetOrderIndex === -1) {
      // If all are completed, pick the first order and cycle it to Shipped/Delivered
      targetOrderIndex = 0;
    }

    const order = orders[targetOrderIndex];
    const steps = [...(order.trackingSteps || [])];
    const completedCount = steps.filter((s) => s.completed).length;

    let newStatus: 'processing' | 'shipped' | 'delivered' = 'processing';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (completedCount <= 1) {
      // Advance to Processing
      newStatus = 'processing';
      if (steps[0]) steps[0] = { ...steps[0], completed: true, time: steps[0].time || nowStr };
      if (steps[1]) steps[1] = { ...steps[1], completed: true, time: `প্রসেসিং সম্পন্ন (${nowStr})` };
    } else if (completedCount === 2) {
      // Advance to Shipped
      newStatus = 'shipped';
      if (steps[2]) steps[2] = { ...steps[2], completed: true, time: `রেডএক্স কুরিয়ার পিকআপ (${nowStr})` };
    } else {
      // Advance to Delivered
      newStatus = 'delivered';
      if (steps[3]) steps[3] = { ...steps[3], completed: true, time: `ডেলিভারি সম্পন্ন (${nowStr})` };
    }

    const updatedOrder: Order = {
      ...order,
      status: newStatus === 'delivered' ? 'confirmed' : order.status === 'pending_offline_sync' ? 'confirmed' : order.status,
      trackingSteps: steps
    };

    const updatedOrders = [...orders];
    updatedOrders[targetOrderIndex] = updatedOrder;
    this.saveOrders(updatedOrders);

    return {
      updatedOrders,
      changedOrder: updatedOrder,
      newStatus
    };
  }
}
