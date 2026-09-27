export interface PixelConfig {
  pixelId: string;
  isPixelEnabled: boolean;
  ga4MeasurementId: string;
  isGa4Enabled: boolean;
  conversionsApiToken?: string;
  testEventCode?: string;
}

export interface TrackingEventLog {
  id: string;
  eventName: string;
  params: Record<string, any>;
  source: 'Facebook Pixel' | 'GA4' | 'Conversion API';
  timestamp: string;
  status: 'sent' | 'queued';
}

const DEFAULT_PIXEL_CONFIG: PixelConfig = {
  pixelId: '849201948271034',
  isPixelEnabled: true,
  ga4MeasurementId: 'G-SX8492019',
  isGa4Enabled: true,
  testEventCode: 'TEST94821',
  conversionsApiToken: 'EAAXx938472910482...'
};

const PIXEL_CONFIG_KEY = 'smartshopx_pixel_config';
const PIXEL_LOGS_KEY = 'smartshopx_pixel_logs';

export const PixelAnalyticsService = {
  getConfig(): PixelConfig {
    try {
      const saved = localStorage.getItem(PIXEL_CONFIG_KEY);
      if (saved) return { ...DEFAULT_PIXEL_CONFIG, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_PIXEL_CONFIG;
  },

  saveConfig(config: PixelConfig): void {
    localStorage.setItem(PIXEL_CONFIG_KEY, JSON.stringify(config));
  },

  getLogs(): TrackingEventLog[] {
    try {
      const saved = localStorage.getItem(PIXEL_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  },

  logEvent(eventName: string, params: Record<string, any> = {}, source: 'Facebook Pixel' | 'GA4' = 'Facebook Pixel'): void {
    const config = this.getConfig();
    if (!config.isPixelEnabled && source === 'Facebook Pixel') return;
    if (!config.isGa4Enabled && source === 'GA4') return;

    const newLog: TrackingEventLog = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventName,
      params,
      source,
      timestamp: new Date().toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      status: 'sent'
    };

    const existingLogs = this.getLogs();
    const updated = [newLog, ...existingLogs.slice(0, 49)];
    localStorage.setItem(PIXEL_LOGS_KEY, JSON.stringify(updated));

    // Dispatch global event for developer/admin preview
    window.dispatchEvent(
      new CustomEvent('smartshopx_tracking_event', {
        detail: newLog
      })
    );
  },

  trackPageView(pageTitle?: string): void {
    this.logEvent('PageView', { title: pageTitle || document.title });
  },

  trackViewContent(product: { id: string; title: string; price: number; category?: string }): void {
    this.logEvent('ViewContent', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: product.price,
      currency: 'BDT',
      category: product.category || 'General'
    });
  },

  trackAddToCart(product: { id: string; title: string; price: number }, quantity = 1): void {
    this.logEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BDT',
      quantity
    });
  },

  trackInitiateCheckout(itemsCount: number, totalAmount: number): void {
    this.logEvent('InitiateCheckout', {
      num_items: itemsCount,
      value: totalAmount,
      currency: 'BDT'
    });
  },

  trackPurchase(order: { id: string; finalAmount: number; itemsCount: number; paymentMethod: string }): void {
    this.logEvent('Purchase', {
      order_id: order.id,
      value: order.finalAmount,
      currency: 'BDT',
      num_items: order.itemsCount,
      payment_method: order.paymentMethod
    });
  },

  trackWhatsAppContact(productTitle?: string): void {
    this.logEvent('Contact', {
      method: 'WhatsApp',
      product: productTitle || 'General Query'
    });
  }
};
