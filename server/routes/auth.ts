import { Router, Request, Response } from 'express';
import { centralStore } from '../data/store';

export const authRouter = Router();

/**
 * AUTHENTICATION ROUTE HANDLERS
 * 
 * Boundary status: REQUIRES AUTH PROVIDER
 * Prepared to connect to Firebase Auth / Supabase Auth / OAuth when configured.
 */

// POST /api/v1/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { phone, email } = req.body || {};
  const customerId = phone ? `CUST-${phone.slice(-6)}` : 'CUST-DEMO-01712';

  res.status(200).json({
    success: true,
    authProviderState: 'REQUIRES_AUTH_PROVIDER',
    session: {
      customerId,
      phone: phone || '01712345678',
      email: email || 'demo@smartshopx.bd',
      accessToken: `demo-token-${Date.now()}`,
      refreshToken: null,
      mode: 'demo_session'
    },
    message: 'Authentication endpoint prepared [REQUIRES AUTH PROVIDER for production].'
  });
});

// POST /api/v1/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    accessToken: `demo-token-${Date.now()}`,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
});

// GET /api/v1/auth/session
authRouter.get('/session', async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.customerId || 'CUST-DEMO-01712';
    const customer = await centralStore.getCustomer(customerId);

    res.status(200).json({
      success: true,
      customerId,
      roles: req.user?.roles || ['customer'],
      customer: customer || null,
      authProviderState: 'REQUIRES_AUTH_PROVIDER'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve session.'
    });
  }
});

// GET /api/v1/customers/me
authRouter.get('/customers/me', async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.customerId || 'CUST-DEMO-01712';
    const customer = await centralStore.getCustomer(customerId);

    res.status(200).json({
      success: true,
      customer: customer || {
        id: customerId,
        fullName: 'মো. তানভীর আহমেদ',
        phone: '01712345678',
        coins: 250,
        roles: ['customer']
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve customer.'
    });
  }
});
