import { Router, Request, Response } from 'express';

export const healthRouter = Router();

/**
 * GET /api/v1/health
 * 
 * Minimal, structured health check endpoint.
 * Exposes no internal secrets, database credentials, or stack traces.
 */
healthRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'central-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
