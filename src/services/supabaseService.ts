import { createClient } from '@supabase/supabase-js';

// Supabase Connection Configuration for SmartShopX & SmartHisab Ecosystem
const SUPABASE_URL = 'https://ffqwfrtpscivirlvvxol.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PFs2IrWeSMbBotqwDa8jTw_rtEora1F';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface SupabaseSyncStatus {
  isConnected: boolean;
  lastChecked: string;
  error?: string;
}

export class SupabaseService {
  private static isInitialized = false;

  /**
   * Check connection status to Supabase backend
   */
  static async checkConnection(): Promise<SupabaseSyncStatus> {
    try {
      // Simple lightweight health check
      const { data, error } = await supabase.from('orders').select('id').limit(1);
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        // 42P01 = relation does not exist yet (which is normal before tables are seeded)
        console.warn('Supabase ping notice:', error.message);
      }
      return {
        isConnected: true,
        lastChecked: new Date().toLocaleTimeString('bn-BD'),
      };
    } catch (err: any) {
      return {
        isConnected: false,
        lastChecked: new Date().toLocaleTimeString('bn-BD'),
        error: err?.message || 'Connection timeout',
      };
    }
  }

  /**
   * Sync Order to Supabase Cloud Database
   */
  static async syncOrderToCloud(order: any): Promise<{ success: boolean; error?: string }> {
    try {
      const orderPayload = {
        id: order.id,
        client_order_id: order.clientOrderId || order.id,
        idempotency_key: order.idempotencyKey,
        customer_name: order.address?.fullName,
        customer_phone: order.address?.phone,
        customer_address: `${order.address?.addressDetails}, ${order.address?.zone}, ${order.address?.city}`,
        division: order.address?.division,
        items: order.items,
        total_amount: order.totalAmount,
        discount_amount: order.discountAmount || 0,
        delivery_fee: order.deliveryFee || 0,
        final_amount: order.finalAmount,
        payment_method: order.paymentMethod,
        applied_voucher: order.appliedVoucher || null,
        coins_used: order.coinsUsed || 0,
        status: order.status || 'synced',
        tracking_steps: order.trackingSteps,
        created_at: order.orderDate || new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('orders')
        .upsert(orderPayload, { onConflict: 'id' });

      if (error) {
        // If table doesn't exist yet, we silently handle without breaking the UX
        console.warn('Supabase order upload notice (schema creation may be pending in Supabase Studio):', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Supabase syncOrder error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch Orders from Supabase Cloud
   */
  static async fetchOrdersFromCloud(customerPhone?: string): Promise<any[]> {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (customerPhone) {
        query = query.eq('customer_phone', customerPhone);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetch orders notice:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Supabase fetchOrders error:', err);
      return [];
    }
  }

  /**
   * Sync User Account / Profile
   */
  static async syncUserToCloud(user: any): Promise<boolean> {
    try {
      const userPayload = {
        id: user.id,
        full_name: user.fullName,
        phone: user.phone,
        email: user.email,
        membership_level: user.membershipLevel,
        coins: user.coins,
        addresses: user.addresses,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('customers')
        .upsert(userPayload, { onConflict: 'phone' });

      if (error) {
        console.warn('Supabase customer upsert notice:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase syncUser error:', err);
      return false;
    }
  }
}
