import { Router } from 'express';
import { healthRouter } from './health';
import { productsRouter } from './products';
import { ordersRouter } from './orders';
import { authRouter } from './auth';
import { authenticateRequest } from '../middleware/auth';

export const apiV1Router = Router();

// Apply auth boundary middleware to API
apiV1Router.use(authenticateRequest);

// Mount route namespaces
apiV1Router.use('/health', healthRouter);
apiV1Router.use('/products', productsRouter);
apiV1Router.use('/orders', ordersRouter);
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/customers', authRouter);
