import { Order } from '../types';

export interface AppNotification {
  id: string;
  orderId: string;
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  timestamp: string;
  isRead: boolean;
  actionType?: 'view_order' | 'rate_delivery';
}

const NOTIFICATIONS_STORAGE_KEY = 'smartshopx_order_notifications';

export class NotificationService {
  // Check if browser notifications are supported
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission state
  static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request user permission for notifications
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return Notification.permission;
    }
  }

  // Play a pleasant chime sound using Web Audio API
  static playNotificationSound(type: 'default' | 'delivered' = 'default') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'delivered') {
        // Joyful 3-tone chime for delivery completed
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else {
        // Standard double ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.12); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Audio context might be restricted before first interaction
    }
  }

  // Get list of saved notifications
  static getStoredNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch {
      return [];
    }
  }

  // Save notifications
  static saveNotifications(notifications: AppNotification[]): void {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }

  // Mark all notifications as read
  static markAllAsRead(): AppNotification[] {
    const list = this.getStoredNotifications().map((n) => ({ ...n, isRead: true }));
    this.saveNotifications(list);
    return list;
  }

  // Send real-time browser notification when order status changes
  static async sendOrderStatusNotification(
    order: Order,
    newStatus: 'processing' | 'shipped' | 'delivered',
    language: 'bn' | 'en' = 'bn',
    onClickCallback?: (order: Order, actionType: 'view_order' | 'rate_delivery') => void
  ): Promise<AppNotification> {
    const firstItem = order.items?.[0]?.product;
    const itemTitle = language === 'bn' ? firstItem?.titleBn || 'আপনার পণ্য' : firstItem?.title || 'Your item';
    const itemsCount = order.items?.reduce((acc, it) => acc + it.quantity, 0) || 1;

    let titleEn = '';
    let titleBn = '';
    let messageEn = '';
    let messageBn = '';
    let actionType: 'view_order' | 'rate_delivery' = 'view_order';

    switch (newStatus) {
      case 'processing':
        titleEn = `📦 Order #${order.id} is Processing`;
        titleBn = `📦 অর্ডার #${order.id} প্রসেসিং হচ্ছে`;
        messageEn = `${itemTitle} (${itemsCount} items) is being packed and verified.`;
        messageBn = `${itemTitle} (${itemsCount}টি আইটেম) প্রস্তুত ও ভেরিফিকেশন করা হচ্ছে।`;
        break;

      case 'shipped':
        titleEn = `🚚 Order #${order.id} Shipped!`;
        titleBn = `🚚 অর্ডার #${order.id} ডেলিভারির পথে (শিপড)!`;
        messageEn = `Courier has picked up your package. On the way to ${order.address.city}.`;
        messageBn = `রেডএক্স কুরিয়ার প্যাকেজটি গ্রহণ করেছে। এটি এখন ${order.address.city} পৌঁছানোর পথে রয়েছে।`;
        break;

      case 'delivered':
        titleEn = `🎉 Order #${order.id} Delivered!`;
        titleBn = `🎉 অর্ডার #${order.id} সফলভাবে ডেলিভারি সম্পন্ন!`;
        messageEn = `Your order has arrived! Tap to rate delivery & win +10 coins.`;
        messageBn = `আপনার অর্ডার পৌঁছে গেছে! রাইডারকে রেট দিন ও +১০ কয়েন জিতুন।`;
        actionType = 'rate_delivery';
        break;
    }

    const newNotification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId: order.id,
      titleEn,
      titleBn,
      messageEn,
      messageBn,
      status: newStatus,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      actionType
    };

    // Save to local notifications list
    const currentList = this.getStoredNotifications();
    this.saveNotifications([newNotification, ...currentList]);

    // Play chime sound
    this.playNotificationSound(newStatus === 'delivered' ? 'delivered' : 'default');

    // Trigger System Browser Notification if permission is granted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const title = language === 'bn' ? titleBn : titleEn;
        const body = language === 'bn' ? messageBn : messageEn;

        // Try service worker notification first for best background support
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              body,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `order-${order.id}-${newStatus}`,
              data: {
                orderId: order.id,
                actionType,
                url: window.location.href
              },
              vibrate: [200, 100, 200]
            } as any);
          });
        } else {
          // Standard browser Notification API
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: `order-${order.id}-${newStatus}`,
            data: {
              orderId: order.id,
              actionType
            }
          });

          notification.onclick = (event) => {
            event.preventDefault();
            window.focus();
            if (onClickCallback) {
              onClickCallback(order, actionType);
            }
            notification.close();
          };
        }
      } catch (err) {
        console.warn('Could not display system notification', err);
      }
    }

    return newNotification;
  }
}
