import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes/api';

dotenv.config();

const currentDir = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5050;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Mount API Router
  app.use('/api', apiRouter);

  if (!isProd) {
    // Development mode with Vite Middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode - Serve static files from dist
    const distPath = path.resolve(currentDir, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, () => {
    console.log(`✨ Lulu & Mimi Monolith is running on http://localhost:${PORT}`);
    console.log(`🌐 Mode: ${isProd ? 'Production' : 'Development'}`);
  });

  const shutdown = () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
