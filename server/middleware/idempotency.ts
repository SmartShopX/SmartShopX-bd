import { Request, Response, NextFunction } from 'express';
import { centralStore } from '../data/store';

/**
 * IDEMPOTENCY MIDDLEWARE
 * 
 * Inspects `X-Idempotency-Key` or `body.idempotencyKey`.
 * Prevents duplicate orders and duplicate billing on network retries.
 */
export async function checkIdempotency(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey =
    (req.headers['x-idempotency-key'] as string) || req.body?.idempotencyKey;

  if (!idempotencyKey) {
    // If no idempotency key provided, proceed normally
    return next();
  }

  try {
    const existingRecord = await centralStore.getIdempotencyRecord(idempotencyKey);
    if (existingRecord) {
      // Already processed: Return existing order confirmation without recreating
      return res.status(200).json({
        success: true,
        isIdempotentReplay: true,
        orderId: existingRecord.orderId,
        message: 'Order already processed (Idempotent response).',
        messageBn: 'অর্ডারটি ইতিমধ্যে সার্ভারে প্রসেস করা হয়েছে।',
        ...existingRecord.response
      });
    }

    next();
  } catch (error) {
    console.error('Idempotency check error:', error);
    next();
  }
}
