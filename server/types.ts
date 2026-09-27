/**
 * CENTRAL BACKEND API & DATA MODELS
 * 
 * Defines authoritative domain entities for Central Backend:
 * Customer, Store, Product, Order, OrderItem, Voucher, Review, Address.
 */

export interface BackendCustomer {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  displayName?: string;
  roles: Array<'customer' | 'store_owner' | 'admin'>;
  status: 'active' | 'suspended' | 'pending';
  coins: number;
  createdAt: string;
}

export interface BackendStore {
  id: string;
  ownerId: string;
  name: string;
  nameBn: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  category: string;
  categoryBn: string;
  location: string;
  isVerified: boolean;
  status: 'active' | 'pending' | 'suspended';
  joinedYear: number;
}

export interface BackendProduct {
  id: string;
  storeId: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  price: number;              // Authoritative retail price (BDT)
  originalPrice: number;
  discountPercent: number;
  stock: number;              // Authoritative inventory stock count
  soldCount: number;
  category: string;
  categoryBn: string;
  image: string;
  gallery: string[];
  brand: string;
  isPublished: boolean;       // Visibility flag
  rating: number;
  reviewCount: number;
  isDarazMall?: boolean;
  isFreeDelivery?: boolean;
  isFlashSale?: boolean;
  supplierCost?: number;      // SENSITIVE: Never expose to public API
  internalMargin?: number;    // SENSITIVE: Never expose to public API
  privateNotes?: string;      // SENSITIVE: Never expose to public API
  createdAt: string;
  updatedAt: string;
}

export interface BackendOrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  storeId: string;
  quantity: number;
  unitPrice: number;          // Authoritative price at order placement
  subtotal: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface BackendOrder {
  id: string;                 // Server authoritative ID
  clientOrderId: string;      // Traceable client-generated ID
  idempotencyKey: string;     // Unique deduplication key
  customerId: string;
  storeId?: string;
  items: BackendOrderItem[];
  itemSubtotal: number;
  discountAmount: number;
  deliveryFee: number;
  coinsUsed: number;
  coinsDiscount: number;
  appliedVoucher?: string;
  finalAmount: number;        // Authoritatively calculated grand total
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  deliveryAddress: {
    fullName: string;
    phone: string;
    division: string;
    city: string;
    zone: string;
    addressDetails: string;
    label: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  syncStatus: 'synced';
  createdAt: string;
  syncedAt: string;
  smartBusinessSynced: boolean;
}

export interface BackendVoucher {
  code: string;
  titleEn: string;
  titleBn: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minSpend: number;
  expiresAt: string;
  isActive: boolean;
}

export interface ApiErrorResponse {
  success: false;
  code:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'INVALID_REQUEST'
    | 'PRODUCT_NOT_FOUND'
    | 'PRODUCT_UNPUBLISHED'
    | 'PRODUCT_PRICE_CHANGED'
    | 'INSUFFICIENT_STOCK'
    | 'INVALID_VOUCHER'
    | 'ORDER_ALREADY_PROCESSED'
    | 'SERVER_ERROR';
  message: string;
  messageBn?: string;
  details?: Record<string, any>;
}
