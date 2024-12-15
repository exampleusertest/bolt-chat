import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import { initializeDatabase } from './database';
import { authRouter } from './routes/auth';
import { messageRouter } from './routes/messages';
import { handleWebSocket } from './websocket';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

// WebSocket handling
wss.on('connection', handleWebSocket);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});