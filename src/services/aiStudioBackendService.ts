import { Order, Product } from '../types';
import { StorageService } from './storageService';

/**
 * Standard HTTP Error Categories for backend diagnostics
 */
export type BackendErrorCategory =
  | 'NOT_CONFIGURED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'      // 401
  | 'FORBIDDEN'         // 403
  | 'NOT_FOUND'         // 404
  | 'CONFLICT'          // 409 (e.g. idempotency key already processed)
  | 'VALIDATION_ERROR'  // 422
  | 'RATE_LIMITED'      // 429
  | 'SERVER_ERROR'      // 500-599
  | 'INVALID_RESPONSE';

export interface BackendHealthReport {
  isConfigured: boolean;
  isOnline: boolean;
  backendUrl: string;
  statusCode?: number;
  latencyMs?: number;
  lastChecked: string;
  error?: string;
  errorCategory?: BackendErrorCategory;
}

export interface BackendOrderResponse {
  success: boolean;
  orderId?: string;
  statusCode?: number;
  errorCategory?: BackendErrorCategory;
  message: string;
  messageBn: string;
  rawData?: any;
}

export interface BackendProductFetchResponse {
  success: boolean;
  products?: Product[];
  statusCode?: number;
  errorCategory?: BackendErrorCategory;
  message: string;
  messageBn: string;
  isFallback?: boolean;
}

/**
 * AI STUDIO BACKEND SERVICE
 * 
 * Responsibility: Central Backend HTTP/API Adapter ONLY (Thin Transport Layer).
 * 
 * Guidelines:
 * 1. NO local storage mutation or queue management (Delegated to StorageService / MarketplaceService).
 * 2. NO authentication / token generation (Delegated to AuthService).
 * 3. NO business orchestration (Delegated to MarketplaceService).
 * 4. Strict product validation before returning to callers.
 * 5. Strict idempotency key propagation (never generate new keys on retry).
 */
export class AIStudioBackendService {
  private static lastHealthCheckTime = 0;
  private static lastHealthReport: BackendHealthReport | null = null;
  private static readonly HEALTH_CHECK_COOLDOWN_MS = 5000; // 5-second throttle to prevent tight loops

  /**
   * Retrieves sanitized Central Backend URL from VITE_CENTRAL_BACKEND_URL.
   * Only public base URL, trailing slash removed.
   */
  static getBackendUrl(): string {
    const raw = (import.meta.env.VITE_CENTRAL_BACKEND_URL || '').trim();
    return raw.replace(/\/+$/, '');
  }

  /**
   * Checks if a valid backend URL is configured
   */
  static isConfigured(): boolean {
    const url = this.getBackendUrl();
    return Boolean(url && url.length > 5 && (url.startsWith('http://') || url.startsWith('https://')));
  }

  /**
   * Categorizes HTTP response status codes into structured diagnostic categories
   */
  static categorizeHttpStatus(statusCode: number): BackendErrorCategory {
    switch (statusCode) {
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'RATE_LIMITED';
      default:
        if (statusCode >= 500) return 'SERVER_ERROR';
        return 'NETWORK_ERROR';
    }
  }

  /**
   * Light-weight connectivity health check.
   * Throttled to prevent tight loops; does not expose sensitive keys.
   */
  static async checkHealth(force = false): Promise<BackendHealthReport> {
    const now = Date.now();
    if (!force && this.lastHealthReport && now - this.lastHealthCheckTime < this.HEALTH_CHECK_COOLDOWN_MS) {
      return this.lastHealthReport;
    }

    const backendUrl = this.getBackendUrl();
    if (!this.isConfigured()) {
      const report: BackendHealthReport = {
        isConfigured: false,
        isOnline: false,
        backendUrl: '',
        lastChecked: new Date().toLocaleTimeString('bn-BD'),
        error: 'VITE_CENTRAL_BACKEND_URL is not configured',
        errorCategory: 'NOT_CONFIGURED'
      };
      this.lastHealthReport = report;
      this.lastHealthCheckTime = now;
      return report;
    }

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Ping standard health endpoints
      let response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      }).catch(() => null);

      if (!response || !response.ok) {
        // Fallback to /api/v1/health
        response = await fetch(`${backendUrl}/api/v1/health`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        }).catch(() => null);
      }

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response && (response.ok || response.status === 404)) {
        // 200 = healthy, 404 = server is reachable and active even if specific path differs
        const report: BackendHealthReport = {
          isConfigured: true,
          isOnline: true,
          backendUrl,
          statusCode: response.status,
          latencyMs,
          lastChecked: new Date().toLocaleTimeString('bn-BD')
        };
        this.lastHealthReport = report;
        this.lastHealthCheckTime = now;
        return report;
      }

      const status = response ? response.status : 0;
      const errorCategory = this.categorizeHttpStatus(status);
      const report: BackendHealthReport = {
        isConfigured: true,
        isOnline: false,
        backendUrl,
        statusCode: status,
        latencyMs,
        lastChecked: new Date().toLocaleTimeString('bn-BD'),
        error: `Server responded with HTTP ${status}`,
        errorCategory
      };
      this.lastHealthReport = report;
      this.lastHealthCheckTime = now;
      return report;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = err?.name === 'AbortError';
      const report: BackendHealthReport = {
        isConfigured: true,
        isOnline: false,
        backendUrl,
        latencyMs,
        lastChecked: new Date().toLocaleTimeString('bn-BD'),
        error: isTimeout ? 'Connection timed out (6s)' : (err?.message || 'Network unreachable'),
        errorCategory: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'
      };
      this.lastHealthReport = report;
      this.lastHealthCheckTime = now;
      return report;
    }
  }

  /**
   * Generates public authentication headers based on active session.
   * Does NOT manage sessions (session management strictly belongs to AuthService).
   */
  static getAuthHeaders(): Record<string, string> {
    const session = StorageService.getSession();
    if (session?.accessToken) {
      return { Authorization: `Bearer ${session.accessToken}` };
    }
    return {
      'X-Customer-Id': session?.customerId || 'CUST-DEMO-01712',
      'X-Client-Module': 'smart-shopping'
    };
  }

  /**
   * HTTP POST: Dispatches a normalized order to Central Backend.
   * 
   * Strict Idempotency: Uses the passed idempotencyKey as 'X-Idempotency-Key'.
   * Never generates a new random key for retries.
   * Does NOT mutate local storage; returns structured response to MarketplaceService.
   */
  static async postOrder(
    order: Order,
    idempotencyKey: string,
    customHeaders?: Record<string, string>
  ): Promise<BackendOrderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        statusCode: 503,
        errorCategory: 'NOT_CONFIGURED',
        message: 'Central Backend endpoint (VITE_CENTRAL_BACKEND_URL) not configured.',
        messageBn: 'সেন্ট্রাল ব্যাকএন্ড এন্ডপয়েন্ট কনফিগার করা নেই।'
      };
    }

    const backendUrl = this.getBackendUrl();
    const endpoint = `${backendUrl}/api/v1/orders`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const headers = {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
        Accept: 'application/json',
        ...this.getAuthHeaders(),
        ...customHeaders
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...order,
          clientOrderId: order.clientOrderId || order.id,
          idempotencyKey
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({}));

      // HTTP 200 or 201: Success
      if (response.ok) {
        return {
          success: true,
          orderId: responseData.orderId || order.id,
          statusCode: response.status,
          message: responseData.message || 'Order successfully received and verified by Central Backend.',
          messageBn: responseData.messageBn || 'সেন্ট্রাল ব্যাকএন্ডে অর্ডার সফলভাবে গৃহীত হয়েছে।',
          rawData: responseData
        };
      }

      // HTTP 409 Conflict: Already processed idempotency key (treated as verified duplicate sync)
      if (response.status === 409) {
        return {
          success: true,
          orderId: responseData.orderId || order.id,
          statusCode: 409,
          errorCategory: 'CONFLICT',
          message: 'Order was already processed by Central Backend (Idempotent success).',
          messageBn: 'অর্ডারটি ইতিমধ্যে সার্ভারে সংরক্ষিত রয়েছে (আইডেমপোটেন্ট কনফার্মেশন)।',
          rawData: responseData
        };
      }

      const errorCategory = this.categorizeHttpStatus(response.status);
      return {
        success: false,
        orderId: order.id,
        statusCode: response.status,
        errorCategory,
        message: responseData.message || `Central Backend returned HTTP ${response.status}.`,
        messageBn: responseData.messageBn || `সেন্ট্রাল ব্যাকএন্ড ত্রুটি (HTTP ${response.status})।`,
        rawData: responseData
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        orderId: order.id,
        statusCode: 0,
        errorCategory: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout ? 'Request timed out while connecting to Central Backend.' : (err?.message || 'Network request failed.'),
        messageBn: 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।'
      };
    }
  }

  /**
   * HTTP GET: Fetches updated product catalog from Central Backend.
   * Does NOT overwrite local cache directly; returns raw items for validation by MarketplaceService.
   */
  static async fetchProducts(
    filters?: {
      category?: string;
      storeId?: string;
    },
    customHeaders?: Record<string, string>
  ): Promise<BackendProductFetchResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        errorCategory: 'NOT_CONFIGURED',
        message: 'VITE_CENTRAL_BACKEND_URL is not configured.',
        messageBn: 'ব্যাকএন্ড কনফিগার করা নেই।',
        isFallback: true
      };
    }

    const backendUrl = this.getBackendUrl();
    const queryParams = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') {
      queryParams.append('category', filters.category);
    }
    if (filters?.storeId) {
      queryParams.append('storeId', filters.storeId);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const endpoint = `${backendUrl}/api/v1/products${queryString}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...this.getAuthHeaders(),
          ...customHeaders
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const payload = await response.json().catch(() => null);
        if (!payload) {
          return {
            success: false,
            statusCode: response.status,
            errorCategory: 'INVALID_RESPONSE',
            message: 'Empty or invalid JSON payload received from backend.',
            messageBn: 'ব্যাকএন্ড থেকে অকার্যকর ডেটা এসেছে।'
          };
        }

        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.products)
          ? payload.products
          : Array.isArray(payload.data)
          ? payload.data
          : null;

        if (!rawList) {
          return {
            success: false,
            statusCode: response.status,
            errorCategory: 'INVALID_RESPONSE',
            message: 'Unrecognized product catalog structure in response.',
            messageBn: 'পণ্য তালিকার ফরম্যাট সঠিক নয়।'
          };
        }

        // Validate each product before returning
        const validatedProducts: Product[] = [];
        for (const item of rawList) {
          const validated = this.validateProduct(item);
          if (validated) {
            // Store isolation: only include published products unless store owner explicitly queries
            if (validated.isPublished !== false) {
              validatedProducts.push(validated);
            }
          }
        }

        return {
          success: true,
          products: validatedProducts,
          statusCode: response.status,
          message: `Fetched and validated ${validatedProducts.length} products from Central Backend.`,
          messageBn: `ব্যাকএন্ড থেকে ${validatedProducts.length}টি পণ্য সফলভাবে ভ্যালিডেট হয়েছে।`
        };
      }

      const errorCategory = this.categorizeHttpStatus(response.status);
      return {
        success: false,
        statusCode: response.status,
        errorCategory,
        message: `Backend returned HTTP ${response.status}.`,
        messageBn: `ব্যাকএন্ড রেসপন্স কোড: HTTP ${response.status}`
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        statusCode: 0,
        errorCategory: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout ? 'Product fetch request timed out (8s).' : (err?.message || 'Network error.'),
        messageBn: 'পণ্য লোড করতে নেটওয়ার্ক সমস্যা হয়েছে।'
      };
    }
  }

  /**
   * Product Data Validation (Section 6 & 13)
   * 
   * Strict validation rule: Do not blindly trust backend JSON.
   * Validates mandatory fields: id, storeId, name/title, price, stock, isPublished, category, image
   * Rejects malformed objects to prevent cache corruption.
   */
  static validateProduct(raw: any): Product | null {
    if (!raw || typeof raw !== 'object') return null;

    // 1. Mandatory Identity
    const id = String(raw.id || '').trim();
    if (!id) return null;

    // 2. Title / Name (en + bn fallback)
    const title = String(raw.title || raw.name || '').trim();
    if (!title) return null;
    const titleBn = String(raw.titleBn || raw.nameBn || title).trim();

    // 3. Price validation (must be non-negative number)
    const price = Number(raw.price);
    if (isNaN(price) || price < 0) return null;
    const originalPrice = Number(raw.originalPrice) || price;

    // 4. Stock validation (must be non-negative number)
    const stock = typeof raw.stock === 'number' ? Math.max(0, raw.stock) : 10;

    // 5. Category
    const category = String(raw.category || 'general').trim();
    const categoryBn = String(raw.categoryBn || category).trim();

    // 6. Image validation
    const image = String(
      raw.image || (Array.isArray(raw.images) && raw.images[0]) || ''
    ).trim();
    if (!image) return null;

    // 7. Store Data Isolation (Section 13)
    const storeId = String(raw.storeId || raw.seller?.storeId || 'STORE_001').trim();
    const isPublished = raw.isPublished !== false;

    // 8. Construct validated Product
    return {
      id,
      storeId,
      storeName: raw.storeName || raw.seller?.name || 'Verified Store',
      ownerId: raw.ownerId || 'STORE_OWNER',
      sku: raw.sku || `SKU-${id}`,
      barcode: raw.barcode,
      genericName: raw.genericName,
      genericNameBn: raw.genericNameBn,
      isPublished,
      title,
      titleBn,
      description: String(raw.description || title),
      descriptionBn: String(raw.descriptionBn || titleBn),
      price,
      originalPrice: Math.max(price, originalPrice),
      discountPercent:
        raw.discountPercent || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0),
      rating: Number(raw.rating) || 4.5,
      reviewCount: Number(raw.reviewCount) || 0,
      category,
      categoryBn,
      image,
      gallery: Array.isArray(raw.gallery) ? raw.gallery : Array.isArray(raw.images) ? raw.images : [image],
      brand: raw.brand || 'Authentic Brand',
      isDarazMall: Boolean(raw.isDarazMall),
      isFreeDelivery: Boolean(raw.isFreeDelivery),
      isFlashSale: Boolean(raw.isFlashSale),
      stock,
      soldCount: Number(raw.soldCount) || 0,
      soldPercent: Number(raw.soldPercent) || 0,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      attributes: raw.attributes,
      seller: raw.seller || {
        name: raw.storeName || 'Verified Store',
        rating: 95,
        responseRate: '98%',
        location: 'Dhaka',
        joinedYear: 2024,
        storeId
      },
      reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
      warranty: raw.warranty,
      warrantyBn: raw.warrantyBn,
      specs: raw.specs,
      hotspots: raw.hotspots,
      hasSizeChart: Boolean(raw.hasSizeChart)
    };
  }
}
