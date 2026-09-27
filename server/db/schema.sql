-- ==============================================================================
-- SMART HISAB / SMART SHOPPING - POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Version: 1.0.0
-- Dialect: PostgreSQL (14+) / Supabase / Cloud SQL
-- Characteristics: Non-destructive, idempotent (IF NOT EXISTS), ACID-compliant
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    logo TEXT,
    cover_image TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    category_bn VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    joined_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    roles TEXT[] DEFAULT ARRAY['customer']::TEXT[],
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    coins INTEGER DEFAULT 0 CHECK (coins >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    description TEXT,
    description_bn TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) NOT NULL CHECK (original_price >= 0),
    discount_percent INTEGER DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sold_count INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
    category VARCHAR(100) NOT NULL,
    category_bn VARCHAR(100) NOT NULL,
    image TEXT NOT NULL,
    gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
    brand VARCHAR(100),
    is_published BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_daraz_mall BOOLEAN DEFAULT FALSE,
    is_free_delivery BOOLEAN DEFAULT FALSE,
    is_flash_sale BOOLEAN DEFAULT FALSE,
    
    -- SENSITIVE BACKEND FIELDS (Never exposed through public API)
    supplier_cost NUMERIC(12, 2) DEFAULT NULL,
    internal_margin NUMERIC(12, 2) DEFAULT NULL,
    private_notes TEXT DEFAULT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_published_store ON products(is_published, store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 4. VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS vouchers (
    code VARCHAR(64) PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
    discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
    min_spend NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_spend >= 0),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vouchers_active_expiry ON vouchers(is_active, expires_at);

-- 5. ORDERS TABLE (Authoritative order lifecycle & Idempotency)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    client_order_id VARCHAR(128) NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL, -- Strict DB uniqueness index
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    store_id VARCHAR(64) REFERENCES stores(id) ON DELETE SET NULL,
    item_subtotal NUMERIC(12, 2) NOT NULL CHECK (item_subtotal >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    coins_used INTEGER DEFAULT 0 CHECK (coins_used >= 0),
    coins_discount NUMERIC(12, 2) DEFAULT 0 CHECK (coins_discount >= 0),
    applied_voucher VARCHAR(64) REFERENCES vouchers(code) ON DELETE SET NULL,
    final_amount NUMERIC(12, 2) NOT NULL CHECK (final_amount >= 0),
    payment_method VARCHAR(32) NOT NULL DEFAULT 'cod',
    delivery_address JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    sync_status VARCHAR(32) NOT NULL DEFAULT 'synced',
    smart_business_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    product_title VARCHAR(255) NOT NULL,
    product_image TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    selected_color VARCHAR(64),
    selected_size VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 7. IDEMPOTENCY REPLAY LOG TABLE (Supports payload caching)
CREATE TABLE IF NOT EXISTS idempotency_records (
    key VARCHAR(128) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    response_payload JSONB NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_records(created_at);

-- 8. TRANSACTION-SAFE STOCK REDUCTION & ORDER PLACEMENT STORED PROCEDURE
-- Ensures row locking (SELECT ... FOR UPDATE) and atomic rollback on stock insufficiency.
CREATE OR REPLACE FUNCTION place_order_transactional(
    p_order_json JSONB,
    p_items_json JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_item JSONB;
    v_product_id VARCHAR(64);
    v_qty INTEGER;
    v_current_stock INTEGER;
    v_is_published BOOLEAN;
    v_product_title VARCHAR(255);
BEGIN
    -- Step 1: Lock and validate stock for each item in the order
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items_json)
    LOOP
        v_product_id := v_item->>'productId';
        v_qty := (v_item->>'quantity')::INTEGER;

        -- Acquire row-level lock (FOR UPDATE) to prevent race conditions
        SELECT stock, is_published, title
        INTO v_current_stock, v_is_published, v_product_title
        FROM products
        WHERE id = v_product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', v_product_id;
        END IF;

        IF NOT v_is_published THEN
            RAISE EXCEPTION 'PRODUCT_UNPUBLISHED: %', v_product_title;
        END IF;

        IF v_current_stock < v_qty THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: % (Available: %, Requested: %)', v_product_title, v_current_stock, v_qty;
        END IF;
    END LOOP;

    -- Step 2: Insert order record
    INSERT INTO orders (
        id, client_order_id, idempotency_key, customer_id, store_id,
        item_subtotal, discount_amount, delivery_fee, coins_used, coins_discount,
        applied_voucher, final_amount, payment_method, delivery_address,
        status, sync_status, smart_business_synced, created_at, synced_at
    ) VALUES (
        p_order_json->>'id',
        p_order_json->>'clientOrderId',
        p_order_json->>'idempotencyKey',
        p_order_json->>'customerId',
        p_order_json->>'storeId',
        (p_order_json->>'itemSubtotal')::NUMERIC,
        (p_order_json->>'discountAmount')::NUMERIC,
        (p_order_json->>'deliveryFee')::NUMERIC,
        (p_order_json->>'coinsUsed')::INTEGER,
        (p_order_json->>'coinsDiscount')::NUMERIC,
        p_order_json->>'appliedVoucher',
        (p_order_json->>'finalAmount')::NUMERIC,
        p_order_json->>'paymentMethod',
        p_order_json->'deliveryAddress',
        p_order_json->>'status',
        p_order_json->>'syncStatus',
        (p_order_json->>'smartBusinessSynced')::BOOLEAN,
        (p_order_json->>'createdAt')::TIMESTAMPTZ,
        (p_order_json->>'syncedAt')::TIMESTAMPTZ
    );

    -- Step 3: Insert order items and deduct stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items_json)
    LOOP
        v_product_id := v_item->>'productId';
        v_qty := (v_item->>'quantity')::INTEGER;

        INSERT INTO order_items (
            order_id, product_id, store_id, product_title, product_image,
            quantity, unit_price, subtotal, selected_color, selected_size
        ) VALUES (
            p_order_json->>'id',
            v_product_id,
            v_item->>'storeId',
            v_item->>'productTitle',
            v_item->>'productImage',
            v_qty,
            (v_item->>'unitPrice')::NUMERIC,
            (v_item->>'subtotal')::NUMERIC,
            v_item->>'selectedColor',
            v_item->>'selectedSize'
        );

        -- Atomic stock decrement and sold count increment
        UPDATE products
        SET stock = stock - v_qty,
            sold_count = sold_count + v_qty,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_product_id;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'orderId', p_order_json->>'id');
END;
$$;
