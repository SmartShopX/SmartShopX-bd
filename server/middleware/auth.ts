import { Request, Response, NextFunction } from 'express';
import { centralStore } from '../data/store';

export interface AuthenticatedUser {
  customerId: string;
  roles: Array<'customer' | 'store_owner' | 'admin'>;
  permissions: string[];
  isDemoAuth: boolean;
  authProviderState: 'REQUIRES_AUTH_PROVIDER' | 'CONFIGURED';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * AUTHENTICATION MIDDLEWARE BOUNDARY
 * 
 * Inspects incoming Authorization Bearer token or X-Customer-Id header.
 * 
 * Status: REQUIRES AUTH PROVIDER
 * Marked explicitly until a dedicated identity provider (Firebase Auth / Supabase Auth / OAuth)
 * is selected and deployed in production.
 */
export async function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const customerIdHeader = req.headers['x-customer-id'] as string;

  let customerId = 'CUST-DEMO-01712'; // Safe demo fallback customer
  let isDemoAuth = true;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // When real JWT/OAuth provider is connected, verify token signature here.
    if (token.startsWith('demo-token-')) {
      isDemoAuth = true;
    }
  }

  if (customerIdHeader && typeof customerIdHeader === 'string' && customerIdHeader.trim()) {
    customerId = customerIdHeader.trim();
  }

  try {
    // Resolve customer profile and roles from central store
    const customer = await centralStore.getCustomer(customerId);
    const roles = customer ? customer.roles : (['customer'] as Array<'customer' | 'store_owner' | 'admin'>);

    req.user = {
      customerId,
      roles,
      permissions: roles.includes('admin')
        ? ['*']
        : roles.includes('store_owner')
        ? ['store:manage', 'order:view', 'order:update']
        : ['order:create', 'order:view:own', 'profile:manage:own'],
      isDemoAuth,
      authProviderState: 'REQUIRES_AUTH_PROVIDER'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
}

/**
 * Authorization Middleware: Enforce Customer Ownership
 */
export function requireCustomerOwnership(paramName = 'customerId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    // Admins bypass ownership checks
    if (req.user.roles.includes('admin')) {
      return next();
    }

    const targetCustomerId = req.params[paramName] || req.query[paramName] || req.body[paramName];
    if (targetCustomerId && targetCustomerId !== req.user.customerId) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Access denied: You can only access your own customer data.'
      });
    }

    next();
  };
}
