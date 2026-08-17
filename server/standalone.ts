import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRouter);

// Root information
app.get('/', (_req, res) => {
  res.json({
    app: 'Lulu & Mimi English Vocabulary API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      dictionaryLookup: '/api/dictionary/lookup/:word',
      cambridgeLookup: '/api/dictionary/cambridge/:word',
      fullDictionary: '/api/dictionary/full/:word',
      aiChat: '/api/ai/chat (POST)',
    },
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Lulu & Mimi Backend Service is running on http://localhost:${PORT}`);
});

// Graceful Shutdown
const shutdown = () => {
  console.log('\n🛑 Gracefully shutting down Lulu & Mimi Backend...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
