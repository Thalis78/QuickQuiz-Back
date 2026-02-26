import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socketHandlers';
import apiRoutes from './apiRoutes';

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

const io = new Server(httpServer, {
  cors: {
    origin: originChecker as any,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({ origin: originChecker as any, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRoutes);

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 QuickQuiz Backend Server        ║
║                                       ║
║   📡 Socket.IO: http://localhost:${PORT}  ║
║   ✅ Status: Running                  ║
║   🕐 Started: ${new Date().toLocaleString('pt-BR')}     ║
╚═══════════════════════════════════════╝
  `);
});
