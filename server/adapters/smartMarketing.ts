import { centralStore } from '../data/store';
import { BackendVoucher } from '../types';

/**
 * SMART MARKETING BACKEND ADAPTER
 * 
 * Flow: Smart Shopping Frontend -> Central Backend -> Marketing / Voucher Service
 * 
 * Boundary status: READY_FOR_BACKEND_INTEGRATION
 * Ready to connect with published marketing campaigns and voucher validation rules.
 */
export class SmartMarketingBackendAdapter {
  static readonly status = 'READY_FOR_BACKEND_INTEGRATION';

  /**
   * Authoritatively validate voucher and calculate discount
   */
  static async validateVoucher(code: string, subtotal: number): Promise<{
    isValid: boolean;
    discount: number;
    voucher?: BackendVoucher;
    reason?: string;
  }> {
    const voucher = await centralStore.getVoucher(code);
    if (!voucher || !voucher.isActive) {
      return { isValid: false, discount: 0, reason: 'Invalid or expired voucher code.' };
    }

    if (new Date(voucher.expiresAt).getTime() < Date.now()) {
      return { isValid: false, discount: 0, reason: 'Voucher code has expired.' };
    }

    if (subtotal < voucher.minSpend) {
      return {
        isValid: false,
        discount: 0,
        reason: `Minimum spend of ৳${voucher.minSpend} required for this voucher.`
      };
    }

    let discount = 0;
    if (voucher.discountType === 'fixed') {
      discount = voucher.discountValue;
    } else {
      discount = Math.round((subtotal * voucher.discountValue) / 100);
    }

    return {
      isValid: true,
      discount: Math.min(discount, subtotal),
      voucher
    };
  }
}
