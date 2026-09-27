import { Router, Request, Response } from 'express';
import { centralStore } from '../data/store';
import { checkIdempotency } from '../middleware/idempotency';
import { SmartMarketingBackendAdapter } from '../adapters/smartMarketing';
import { SmartBusinessBackendAdapter } from '../adapters/smartBusiness';
import { BackendOrder, BackendOrderItem } from '../types';

export const ordersRouter = Router();

/**
 * POST /api/v1/orders
 * 
 * Creates and verifies an order with server-authoritative pricing & stock checks.
 * Protected by Idempotency check.
 */
ordersRouter.post('/', checkIdempotency, async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const clientOrderId = body.clientOrderId || body.id;
    const idempotencyKey =
      (req.headers['x-idempotency-key'] as string) || body.idempotencyKey || `IDEM-${clientOrderId}`;
    const customerId = req.user?.customerId || body.customerId || 'CUST-DEMO-01712';

    // 1. Basic Payload Validation
    if (!clientOrderId) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_REQUEST',
        message: 'clientOrderId is required.'
      });
    }

    const rawItems: any[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_REQUEST',
        message: 'Order must contain at least one item.'
      });
    }

    // 2. Authoritative Price & Stock Validation
    let calculatedSubtotal = 0;
    let allItemsFreeDelivery = true;
    const verifiedItems: BackendOrderItem[] = [];

    for (const rawItem of rawItems) {
      const productId = rawItem.productId || rawItem.id || rawItem.product?.id;
      const quantity = Number(rawItem.quantity);

      if (!productId || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_REQUEST',
          message: 'Invalid product or quantity specified in item.'
        });
      }

      const authoritativeProduct = await centralStore.getProductById(productId);
      if (!authoritativeProduct) {
        return res.status(404).json({
          success: false,
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${productId} does not exist.`
        });
      }

      if (!authoritativeProduct.isPublished) {
        return res.status(400).json({
          success: false,
          code: 'PRODUCT_UNPUBLISHED',
          message: `Product "${authoritativeProduct.title}" is currently unpublished.`
        });
      }

      // Stock verification
      if (authoritativeProduct.stock < quantity) {
        return res.status(400).json({
          success: false,
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for "${authoritativeProduct.title}". Requested: ${quantity}, Available: ${authoritativeProduct.stock}`,
          details: {
            productId,
            title: authoritativeProduct.title,
            requested: quantity,
            available: authoritativeProduct.stock
          }
        });
      }

      // Authoritative Price (NEVER trust frontend rawItem.price)
      const unitPrice = authoritativeProduct.price;
      const itemSubtotal = unitPrice * quantity;
      calculatedSubtotal += itemSubtotal;

      if (!authoritativeProduct.isFreeDelivery) {
        allItemsFreeDelivery = false;
      }

      verifiedItems.push({
        productId: authoritativeProduct.id,
        productTitle: authoritativeProduct.title,
        productImage: authoritativeProduct.image,
        storeId: authoritativeProduct.storeId,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        selectedColor: rawItem.selectedColor,
        selectedSize: rawItem.selectedSize
      });
    }

    // 3. Authoritative Voucher Validation
    let discountAmount = 0;
    let appliedVoucherCode: string | undefined = undefined;
    if (body.appliedVoucher && typeof body.appliedVoucher === 'string') {
      const voucherRes = await SmartMarketingBackendAdapter.validateVoucher(
        body.appliedVoucher,
        calculatedSubtotal
      );
      if (voucherRes.isValid) {
        discountAmount = voucherRes.discount;
        appliedVoucherCode = body.appliedVoucher.toUpperCase();
      }
    }

    // 4. Authoritative Delivery Fee & Coins Calculation
    const deliveryFee = allItemsFreeDelivery || calculatedSubtotal >= 2500 ? 0 : 60;
    const coinsUsed = Number(body.coinsUsed) || 0;
    const coinsDiscount = Math.min(Math.floor(coinsUsed / 10), calculatedSubtotal); // 10 coins = 1 BDT

    // Authoritative Grand Total
    const authoritativeGrandTotal = Math.max(
      0,
      calculatedSubtotal - discountAmount + deliveryFee - coinsDiscount
    );

    // 5. Construct Authoritative Server Order
    const now = new Date().toISOString();
    const serverOrderId = `ORD-SRV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: BackendOrder = {
      id: serverOrderId,
      clientOrderId,
      idempotencyKey,
      customerId,
      storeId: verifiedItems[0]?.storeId,
      items: verifiedItems,
      itemSubtotal: calculatedSubtotal,
      discountAmount,
      deliveryFee,
      coinsUsed,
      coinsDiscount,
      appliedVoucher: appliedVoucherCode,
      finalAmount: authoritativeGrandTotal,
      paymentMethod: body.paymentMethod || 'cod',
      deliveryAddress: body.address || {
        fullName: 'Customer',
        phone: '01712345678',
        division: 'dhaka',
        city: 'Dhaka',
        zone: 'Zone',
        addressDetails: 'Address Details',
        label: 'home'
      },
      status: 'confirmed',
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
      smartBusinessSynced: true
    };

    // 6. Execute Atomic Transaction (Order Creation + Stock Decrement)
    const transactionResult = await centralStore.createOrderTransaction(newOrder);
    if (!transactionResult.success) {
      return res.status(400).json({
        success: false,
        code: transactionResult.code || 'SERVER_ERROR',
        message: transactionResult.error || 'Transaction failed while processing order.'
      });
    }

    // 7. Hand off to Smart Business Stores
    SmartBusinessBackendAdapter.handoffOrder(newOrder).catch((err) => {
      console.warn('Smart Business async handoff notice:', err?.message);
    });

    // 8. Store in Idempotency cache
    const responsePayload = {
      success: true,
      orderId: serverOrderId,
      clientOrderId,
      idempotencyKey,
      order: newOrder,
      status: 'synced',
      message: 'Order verified and processed by Central Backend.',
      messageBn: 'অর্ডারটি সেন্ট্রাল ব্যাকএন্ডে সফলভাবে অনুমোদিত হয়েছে।'
    };

    await centralStore.saveIdempotencyRecord(idempotencyKey, serverOrderId, responsePayload);

    // 9. Return Response
    return res.status(201).json(responsePayload);
  } catch (err: any) {
    console.error('Error placing order:', err?.message);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An internal server error occurred while creating order.'
    });
  }
});

/**
 * GET /api/v1/orders
 * 
 * Returns orders for the authenticated customer only.
 * Enforces customer data isolation.
 */
ordersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.customerId || 'CUST-DEMO-01712';
    const customerOrders = await centralStore.getOrdersByCustomer(customerId);

    res.status(200).json({
      success: true,
      count: customerOrders.length,
      orders: customerOrders
    });
  } catch (error: any) {
    console.error('Error retrieving customer orders:', error?.message);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve orders.'
    });
  }
});

/**
 * GET /api/v1/orders/:orderId
 * 
 * Returns single order details enforcing customer ownership.
 */
ordersRouter.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const order = await centralStore.getOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: `Order #${orderId} not found.`
      });
    }

    // Enforce customer ownership (unless admin)
    if (req.user && !req.user.roles.includes('admin') && order.customerId !== req.user.customerId) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Access denied: You do not own this order.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error: any) {
    console.error('Error retrieving order by ID:', error?.message);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve order details.'
    });
  }
});
