export interface ProductAttribute {
  name: string;
  nameBn: string;
  options: string[];
}

export interface Store {
  id: string; // e.g. 'STORE_001'
  name: string;
  nameBn: string;
  ownerId: string; // e.g. 'USER_001'
  logo: string;
  coverImage: string;
  rating: number; // 1-5 scale (e.g. 4.8)
  reviewCount: number; // e.g. 1250 reviews
  responseRate: string; // e.g. "98%"
  category: string;
  categoryBn: string;
  location: string;
  locationBn: string;
  contactPhone?: string;
  contactEmail?: string;
  openingHours?: string;
  openingHoursBn?: string;
  deliveryInfo?: string;
  deliveryInfoBn?: string;
  joinedYear: number;
  isVerified: boolean;
  offers?: string[];
  description?: string;
  descriptionBn?: string;
  totalProducts?: number;
}

export interface StoreReview {
  id: string;
  storeId: string;
  author: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  commentBn?: string;
}

export interface SellerInfo {
  name: string;
  rating: number; // e.g., 94%
  responseRate: string; // e.g., "98%"
  location: string;
  joinedYear: number;
  storeId?: string;
  logo?: string;
  coverImage?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  commentBn: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  photos?: string[];
  userLocation?: string;
}

export interface ProductSpec {
  key: string;
  keyBn: string;
  value: string;
  valueBn: string;
}

export interface ProductHotspot {
  id: string;
  x: number; // percentage (10 to 90)
  y: number; // percentage (10 to 90)
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category?: 'spec' | 'feature' | 'material' | 'performance' | 'warranty';
  partName?: string;
  partNameBn?: string;
  partPrice?: number;
  partBadge?: string;
  partBadgeBn?: string;
}

export interface Product {
  id: string;
  storeId?: string; // e.g. 'STORE_001'
  storeName?: string; // e.g. 'Rahim Pharmacy'
  ownerId?: string; // e.g. 'USER_001'
  sku?: string; // e.g. 'MED-NAPA-500'
  barcode?: string; // e.g. '8941100123456'
  genericName?: string; // e.g. 'Paracetamol'
  genericNameBn?: string; // e.g. 'প্যারাসিটামল'
  isPublished?: boolean;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  category: string;
  categoryBn: string;
  image: string;
  gallery: string[];
  brand: string;
  isDarazMall: boolean;
  isFreeDelivery: boolean;
  isFlashSale: boolean;
  stock: number;
  soldCount: number;
  soldPercent: number;
  tags: string[];
  attributes?: ProductAttribute[];
  seller: SellerInfo;
  reviews: Review[];
  warranty?: string;
  warrantyBn?: string;
  specs?: ProductSpec[];
  hotspots?: ProductHotspot[];
  hasSizeChart?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  iconName: string;
  color: string;
  image: string;
  subcategories: { name: string; nameBn: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Voucher {
  code: string;
  titleEn: string;
  titleBn: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minSpend: number;
  expiresAt: string;
  isCollected: boolean;
  badge: string;
  badgeBn: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  division: string;
  city: string;
  zone: string;
  addressDetails: string;
  label: 'home' | 'office' | 'other';
}

export interface TrackingStep {
  step: string;
  stepBn: string;
  completed: boolean;
  time?: string;
}

export interface DeliveryRating {
  rating: number;
  comment: string;
  tags?: string[];
  riderName?: string;
  ratedAt: string;
}

export interface Order {
  id: string;
  clientOrderId?: string;
  idempotencyKey?: string;
  storeId?: string;
  storeName?: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  finalAmount: number;
  appliedVoucher?: string;
  coinsUsed?: number;
  coinsDiscount?: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  address: DeliveryAddress;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'ready'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'refunded'
    | 'synced'
    | 'pending_offline_sync';
  orderDate: string;
  syncedAt?: string;
  syncError?: string;
  retryCount?: number;
  backendSynced?: boolean;
  customerId?: string;
  trackingSteps: TrackingStep[];
  isOfflineCreated: boolean;
  deliveryRating?: DeliveryRating;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  errorsBn: string[];
  unitPriceMismatches: Array<{
    productId: string;
    productTitle: string;
    productTitleBn: string;
    clientPrice: number;
    catalogPrice: number;
  }>;
  stockIssues: Array<{
    productId: string;
    productTitle: string;
    requestedQty: number;
    availableStock: number;
  }>;
  unavailableProducts: Array<{
    productId: string;
    productTitle: string;
  }>;
  verifiedSubtotal: number;
  verifiedDeliveryFee: number;
  verifiedVoucherDiscount: number;
  verifiedCoinsDiscount: number;
  verifiedGrandTotal: number;
  groupedByStore: Array<{
    storeId: string;
    storeName: string;
    items: CartItem[];
    subtotal: number;
  }>;
}

export type AuthState =
  | 'LOGGED_OUT'
  | 'LOGGING_IN'
  | 'AUTHENTICATED'
  | 'SESSION_EXPIRED'
  | 'LOGGING_OUT';

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  division: string;
  city: string;
  zone: string;
  addressDetails: string;
  label: 'home' | 'office' | 'other';
  isDefault: boolean;
  postalCode?: string;
}

export interface CoinTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  reason: string;
  reasonBn: string;
  date: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  displayName: string;
  phone: string;
  email: string;
  password?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  avatar?: string;
  addresses: SavedAddress[];
  coins: number;
  vouchers: string[];
  membershipLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP Diamond';
  joinedDate: string;
  coinHistory: CoinTransaction[];
  isVerified?: boolean;
}

export interface CustomerSession {
  customerId: string;
  displayName: string;
  fullName: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  membershipLevel?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP Diamond';
  coins?: number;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  mode: 'demo_session' | 'production_oauth';
}

export interface OrderDispatchResponse {
  success: boolean;
  orderId: string;
  clientOrderId: string;
  idempotencyKey: string;
  status: 'synced_central_backend' | 'offline_queued' | 'backend_unavailable' | 'validation_failed';
  syncedWithCentralBackend: boolean;
  syncedWithSmartBusiness: boolean;
  smartBusinessHandoffStatus: 'PENDING_CENTRAL_API' | 'READY_FOR_BACKEND_INTEGRATION' | 'SYNCED';
  message: string;
  messageBn: string;
  statusCode?: number;
}

export type Language = 'bn' | 'en';

// ==========================================
// SMART HISAB (হিসাব খাতা) INTERFACES
// ==========================================
export interface HisabTransaction {
  id: string;
  type: 'income' | 'expense' | 'due_payment' | 'due_given';
  category: 'sale' | 'purchase' | 'packaging' | 'delivery' | 'salary' | 'ad_marketing' | 'office_rent' | 'utility' | 'other';
  categoryBn: string;
  amount: number;
  customerOrSupplierName: string;
  phone?: string;
  note?: string;
  date: string;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  orderId?: string;
  invoiceNo?: string;
  createdAt: string;
}

export interface CustomerDueRecord {
  id: string;
  customerName: string;
  phone: string;
  address?: string;
  totalPurchased: number;
  totalPaid: number;
  dueAmount: number;
  lastPaymentDate?: string;
  lastOrderDate?: string;
  notes?: string;
  status: 'active' | 'cleared' | 'overdue';
}

export interface DailyHisabSummary {
  date: string;
  totalSales: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalDueGiven: number;
  totalDueCollected: number;
  cashInHand: number;
  orderCount: number;
}

