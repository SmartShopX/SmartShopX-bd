import { Router, Request, Response } from 'express';
import { centralStore } from '../data/store';
import { BackendProduct } from '../types';

export const productsRouter = Router();

/**
 * Strips internal and sensitive business fields before returning to public client
 */
function sanitizeProductForPublic(product: BackendProduct) {
  const { supplierCost, internalMargin, privateNotes, ...publicProduct } = product;
  return publicProduct;
}

/**
 * GET /api/v1/products
 * 
 * Returns authoritative published products.
 * Enforces:
 * 1. isPublished === true
 * 2. Store status is active
 * 3. Required fields validation
 * 4. Strips supplier cost and internal margins
 */
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const storeId = req.query.storeId as string | undefined;

    const rawProducts = await centralStore.getPublishedProducts({ category, storeId });

    // Validate and sanitize each product record
    const sanitizedList = rawProducts
      .filter((p) => {
        // Data validation check: reject malformed records
        return (
          p.id &&
          p.storeId &&
          p.title &&
          typeof p.price === 'number' &&
          p.price >= 0 &&
          typeof p.stock === 'number' &&
          p.stock >= 0 &&
          p.category &&
          p.image &&
          p.isPublished === true
        );
      })
      .map(sanitizeProductForPublic);

    res.status(200).json({
      success: true,
      count: sanitizedList.length,
      products: sanitizedList
    });
  } catch (error: any) {
    console.error('Error fetching products:', error?.message);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve products.'
    });
  }
});

/**
 * GET /api/v1/products/:id
 */
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await centralStore.getProductById(productId);

    if (!product || !product.isPublished) {
      return res.status(404).json({
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found or unpublished.'
      });
    }

    const store = await centralStore.getStore(product.storeId);
    if (store && store.status !== 'active') {
      return res.status(404).json({
        success: false,
        code: 'PRODUCT_UNPUBLISHED',
        message: 'Product belongs to an inactive store.'
      });
    }

    res.status(200).json({
      success: true,
      product: sanitizeProductForPublic(product)
    });
  } catch (error: any) {
    console.error('Error fetching product by ID:', error?.message);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve product details.'
    });
  }
});
