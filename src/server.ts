import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import routes from './routes';

const app = express();
const httpServer = createServer(app);

const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredFrontend = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean)
  : [];
const allowedOrigins = Array.from(new Set([...localOrigins, ...configuredFrontend]));

const originChecker = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true); 
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed'), false);
};

app.use(cors({ origin: originChecker as any, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Registo das rotas
app.use('/api', routes);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 QuickQuiz Backend Server         ║
║                                       ║
║   📡 URL: http://localhost:${PORT}       ║
║   ✅ Status: Running                  ║
║   🕐 Started: ${new Date().toLocaleString('pt-PT')}    ║
╚═══════════════════════════════════════╝
  `);
});
