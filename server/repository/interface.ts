import {
  BackendCustomer,
  BackendStore,
  BackendProduct,
  BackendOrder,
  BackendVoucher
} from '../types';

export interface ProductQueryFilters {
  category?: string;
  storeId?: string;
}

export interface OrderCreationResult {
  success: boolean;
  order?: BackendOrder;
  error?: string;
  code?: 'INSUFFICIENT_STOCK' | 'PRODUCT_NOT_FOUND' | 'PRODUCT_UNPUBLISHED' | 'SERVER_ERROR';
}

export interface IdempotencyRecord {
  orderId: string;
  response: any;
  createdAt: number;
}

/**
 * AUTHORITATIVE CENTRAL REPOSITORY INTERFACE
 * 
 * Provides an abstract storage boundary decoupling API routes and business logic
 * from physical persistence engines (In-Memory, PostgreSQL, Supabase).
 */
export interface CentralRepository {
  readonly providerName: 'memory' | 'postgres' | 'supabase';

  // Products
  getPublishedProducts(filters?: ProductQueryFilters): Promise<BackendProduct[]>;
  getProductById(productId: string): Promise<BackendProduct | undefined>;

  // Stores
  getStore(storeId: string): Promise<BackendStore | undefined>;

  // Vouchers
  getVoucher(code: string): Promise<BackendVoucher | undefined>;

  // Customers
  getCustomer(customerId: string): Promise<BackendCustomer | undefined>;
  saveCustomer(customer: BackendCustomer): Promise<void>;

  // Idempotency
  getIdempotencyRecord(key: string): Promise<IdempotencyRecord | undefined>;
  saveIdempotencyRecord(key: string, orderId: string, response: any): Promise<void>;

  // Orders
  getOrder(orderId: string): Promise<BackendOrder | undefined>;
  getOrdersByCustomer(customerId: string): Promise<BackendOrder[]>;

  // Transaction-Safe Order Creation & Stock Decrement
  createOrderTransaction(order: BackendOrder): Promise<OrderCreationResult>;
}
