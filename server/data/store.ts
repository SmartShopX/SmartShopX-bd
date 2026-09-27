import { centralRepo } from '../repository';
import {
  BackendCustomer,
  BackendStore,
  BackendProduct,
  BackendOrder,
  BackendVoucher
} from '../types';

/**
 * CENTRAL BACKEND AUTHORITATIVE DATA STORE ADAPTER
 * 
 * Re-exports the store operations delegating to the active CentralRepository.
 * Maintains full backward compatibility with existing tests and route imports.
 */
class CentralBackendStoreAdapter {
  getPublishedProducts(filters?: { category?: string; storeId?: string }): Promise<BackendProduct[]> {
    return centralRepo.getPublishedProducts(filters);
  }

  getProductById(productId: string): Promise<BackendProduct | undefined> {
    return centralRepo.getProductById(productId);
  }

  getVoucher(code: string): Promise<BackendVoucher | undefined> {
    return centralRepo.getVoucher(code);
  }

  getStore(storeId: string): Promise<BackendStore | undefined> {
    return centralRepo.getStore(storeId);
  }

  getCustomer(customerId: string): Promise<BackendCustomer | undefined> {
    return centralRepo.getCustomer(customerId);
  }

  saveCustomer(customer: BackendCustomer): Promise<void> {
    return centralRepo.saveCustomer(customer);
  }

  getIdempotencyRecord(key: string) {
    return centralRepo.getIdempotencyRecord(key);
  }

  saveIdempotencyRecord(key: string, orderId: string, response: any): Promise<void> {
    return centralRepo.saveIdempotencyRecord(key, orderId, response);
  }

  getOrder(orderId: string): Promise<BackendOrder | undefined> {
    return centralRepo.getOrder(orderId);
  }

  getOrdersByCustomer(customerId: string): Promise<BackendOrder[]> {
    return centralRepo.getOrdersByCustomer(customerId);
  }

  createOrderTransaction(order: BackendOrder) {
    return centralRepo.createOrderTransaction(order);
  }
}

export const centralStore = new CentralBackendStoreAdapter();
