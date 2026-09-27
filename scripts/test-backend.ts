import express from 'express';
import { apiV1Router } from '../server/routes';
import { centralStore } from '../server/data/store';

async function runBackendVerificationTests() {
  console.log('🧪 Starting Central Backend API Contract Verification Tests...\n');

  const app = express();
  app.use(express.json());
  app.use('/api/v1', apiV1Router);

  // Start test server on dynamic port
  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, failureDetails?: any) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (failureDetails) console.error('     Details:', failureDetails);
    }
  }

  try {
    // Test 1: GET /api/v1/health
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.status === 'ok' && healthData.service === 'central-backend',
      'GET /api/v1/health returns structured minimal response'
    );
    assert(
      healthData.databasePassword === undefined && healthData.env === undefined,
      'GET /api/v1/health leaks no secrets or sensitive info'
    );

    // Test 2: GET /api/v1/products
    const prodRes = await fetch(`${baseUrl}/products`);
    const prodData = await prodRes.json();
    assert(
      prodRes.status === 200 && Array.isArray(prodData.products) && prodData.products.length > 0,
      'GET /api/v1/products returns valid products list'
    );

    // Test 3: Sensitive fields stripping
    const firstProd = prodData.products[0];
    assert(
      firstProd.supplierCost === undefined &&
        firstProd.internalMargin === undefined &&
        firstProd.privateNotes === undefined,
      'GET /api/v1/products strips supplierCost, internalMargin, and privateNotes'
    );

    // Test 4: Unpublished product exclusion
    const unpublishedFound = prodData.products.find((p: any) => p.id === 'p-unpublished-99');
    assert(
      !unpublishedFound,
      'GET /api/v1/products excludes unpublished products (p-unpublished-99)'
    );

    // Test 5: POST /api/v1/orders with valid payload
    const testIdempotencyKey = `IDEMP-TEST-${Date.now()}`;
    const validOrderPayload = {
      clientOrderId: `ORD-CLIENT-${Date.now()}`,
      idempotencyKey: testIdempotencyKey,
      items: [
        {
          productId: 'p1',
          quantity: 2,
          price: 10 // Tampered client price (backend should override to 2450!)
        }
      ],
      appliedVoucher: 'DARAZMEGA',
      address: {
        fullName: 'Test Customer',
        phone: '01712345678',
        division: 'dhaka',
        city: 'Dhaka',
        zone: 'Gulshan',
        addressDetails: 'Road 11',
        label: 'home'
      }
    };

    const initialProductP1 = await centralStore.getProductById('p1');
    const initialStockP1 = initialProductP1?.stock || 0;

    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': testIdempotencyKey,
        'X-Customer-Id': 'CUST-DEMO-01712'
      },
      body: JSON.stringify(validOrderPayload)
    });
    const orderData = await orderRes.json();

    assert(
      orderRes.status === 201 && orderData.success === true && orderData.orderId !== undefined,
      'POST /api/v1/orders creates order successfully'
    );

    // Test 6: Authoritative Price Recalculation (2 * 2450 = 4900 BDT, voucher DARAZMEGA = 300 BDT -> 4600 BDT)
    assert(
      orderData.order?.itemSubtotal === 4900 && orderData.order?.finalAmount === 4600,
      `POST /api/v1/orders calculates authoritative prices overriding client tampering (subtotal: ${orderData.order?.itemSubtotal}, final: ${orderData.order?.finalAmount})`
    );

    // Test 7: Stock decrement verification
    const postProductP1 = await centralStore.getProductById('p1');
    const postStockP1 = postProductP1?.stock || 0;
    assert(
      postStockP1 === initialStockP1 - 2,
      `POST /api/v1/orders atomically decrements product stock from ${initialStockP1} to ${postStockP1}`
    );

    // Test 8: Idempotency deduplication check (repeated request with same X-Idempotency-Key)
    const repeatOrderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': testIdempotencyKey,
        'X-Customer-Id': 'CUST-DEMO-01712'
      },
      body: JSON.stringify(validOrderPayload)
    });
    const repeatData = await repeatOrderRes.json();

    assert(
      repeatOrderRes.status === 200 &&
        repeatData.orderId === orderData.orderId &&
        repeatData.isIdempotentReplay === true,
      'POST /api/v1/orders returns existing order on duplicate X-Idempotency-Key without re-creating'
    );

    // Test 9: Verify stock was NOT decremented again on duplicate request
    const afterRepeatProductP1 = await centralStore.getProductById('p1');
    const afterRepeatStockP1 = afterRepeatProductP1?.stock || 0;
    assert(
      afterRepeatStockP1 === postStockP1,
      'Duplicate idempotent request does NOT decrement stock a second time'
    );

    // Test 10: Insufficient stock rejection
    const excessiveOrderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `IDEMP-EXCESS-${Date.now()}`
      },
      body: JSON.stringify({
        clientOrderId: `ORD-EXCESS-${Date.now()}`,
        items: [{ productId: 'p1', quantity: 9999 }]
      })
    });
    const excessiveData = await excessiveOrderRes.json();

    assert(
      excessiveOrderRes.status === 400 && excessiveData.code === 'INSUFFICIENT_STOCK',
      'POST /api/v1/orders rejects order exceeding available stock with INSUFFICIENT_STOCK'
    );

    // Test 11: Invalid Product ID rejection
    const invalidProdOrderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `IDEMP-INV-${Date.now()}`
      },
      body: JSON.stringify({
        clientOrderId: `ORD-INV-${Date.now()}`,
        items: [{ productId: 'non-existent-product-id', quantity: 1 }]
      })
    });
    const invalidProdData = await invalidProdOrderRes.json();
    assert(
      invalidProdOrderRes.status === 404 && invalidProdData.code === 'PRODUCT_NOT_FOUND',
      'POST /api/v1/orders rejects invalid product ID with PRODUCT_NOT_FOUND'
    );

    // Test 12: Unpublished Product rejection
    const unpubOrderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `IDEMP-UNPUB-${Date.now()}`
      },
      body: JSON.stringify({
        clientOrderId: `ORD-UNPUB-${Date.now()}`,
        items: [{ productId: 'p-unpublished-99', quantity: 1 }]
      })
    });
    const unpubData = await unpubOrderRes.json();
    assert(
      unpubOrderRes.status === 400 && unpubData.code === 'PRODUCT_UNPUBLISHED',
      'POST /api/v1/orders rejects unpublished product with PRODUCT_UNPUBLISHED'
    );

    // Test 13: Customer ownership enforcement on GET /api/v1/orders
    const ordersRes = await fetch(`${baseUrl}/orders`, {
      headers: { 'X-Customer-Id': 'CUST-DEMO-01712' }
    });
    const customerOrdersData = await ordersRes.json();
    assert(
      ordersRes.status === 200 &&
        Array.isArray(customerOrdersData.orders) &&
        customerOrdersData.orders.every((o: any) => o.customerId === 'CUST-DEMO-01712'),
      'GET /api/v1/orders only returns orders belonging to authenticated customer'
    );

    // Test 14: Single order retrieval with customer ownership
    const singleOrderRes = await fetch(`${baseUrl}/orders/${orderData.orderId}`, {
      headers: { 'X-Customer-Id': 'CUST-DEMO-01712' }
    });
    const singleOrderData = await singleOrderRes.json();
    assert(
      singleOrderRes.status === 200 && singleOrderData.order.id === orderData.orderId,
      'GET /api/v1/orders/:orderId retrieves single order for authorized owner'
    );

    // Test 15: Cross-customer access forbidden
    const forbiddenOrderRes = await fetch(`${baseUrl}/orders/${orderData.orderId}`, {
      headers: { 'X-Customer-Id': 'CUST-ATTACKER-9999' }
    });
    const forbiddenData = await forbiddenOrderRes.json();
    assert(
      forbiddenOrderRes.status === 403 && forbiddenData.code === 'FORBIDDEN',
      'GET /api/v1/orders/:orderId forbids unauthorized customer access with FORBIDDEN'
    );

    // Test 16: Auth session prepared endpoint
    const sessionRes = await fetch(`${baseUrl}/auth/session`, {
      headers: { 'X-Customer-Id': 'CUST-DEMO-01712' }
    });
    const sessionData = await sessionRes.json();
    assert(
      sessionRes.status === 200 && sessionData.authProviderState === 'REQUIRES_AUTH_PROVIDER',
      'GET /api/v1/auth/session returns prepared session explicitly marked REQUIRES_AUTH_PROVIDER'
    );

    console.log(`\n🎉 Verification Complete: ${passedTests}/${totalTests} tests passed.\n`);
  } finally {
    server.close();
  }
}

runBackendVerificationTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
