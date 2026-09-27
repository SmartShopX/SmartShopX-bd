import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiV1Router } from './server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // Parse port from CLI argument or env var
  const portArgIndex = process.argv.indexOf('--port');
  const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : undefined;
  const PORT = cliPort || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Basic Security & CORS Headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Idempotency-Key, X-Customer-Id, X-Client-Module');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 2. Body Parsers with payload size limit
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // 3. Central Backend API Namespace (/api/v1)
  app.use('/api/v1', apiV1Router);

  // Fallback for legacy /api/health
  app.get('/api/health', (req, res) => {
    res.redirect('/api/v1/health');
  });

  // 4. Frontend Integration: Dev Mode (Vite Middleware) vs Production (Static Dist)
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API routes in dev mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // 5. Global Error Handler (no stack trace exposure)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Central Backend unhandled error:', err?.message || err);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An unexpected internal server error occurred.'
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Shopping Central Backend] Running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Central Backend server:', err);
  process.exit(1);
});
