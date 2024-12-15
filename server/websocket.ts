import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { db } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const clients = new Map();

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export function handleWebSocket(ws: WebSocketClient) {
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message);

      // Handle authentication
      if (data.type === 'auth') {
        const token = data.token;
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          ws.userId = decoded.userId;
          clients.set(decoded.userId, ws);
          ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
        } catch (error) {
          ws.send(JSON.stringify({ type: 'auth', status: 'error', error: 'Invalid token' }));
        }
        return;
      }

      // Handle chat messages
      if (data.type === 'message') {
        if (!ws.userId) {
          ws.send(JSON.stringify({ type: 'error', error: 'Not authenticated' }));
          return;
        }

        const { content, channelId, receiverId } = data;
        
        // Store message in database
        const stmt = db.prepare(`
          INSERT INTO messages (sender_id, receiver_id, channel_id, content)
          VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(ws.userId, receiverId, channelId, content);

        // Broadcast to relevant clients
        if (channelId) {
          // Broadcast to channel members
          const members = db.prepare('SELECT user_id FROM channel_members WHERE channel_id = ?').all(channelId);
          members.forEach(member => {
            const client = clients.get(member.user_id);
            if (client && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'message',
                channelId,
                senderId: ws.userId,
                content,
                messageId: result.lastInsertRowid
              }));
            }
          });
        } else if (receiverId) {
          // Send to specific user
          const receiver = clients.get(receiverId);
          if (receiver && receiver.readyState === WebSocket.OPEN) {
            receiver.send(JSON.stringify({
              type: 'message',
              senderId: ws.userId,
              content,
              messageId: result.lastInsertRowid
            }));
          }
        }
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
    }
  });
}

// Ping clients every 30 seconds to keep connections alive
setInterval(() => {
  for (const [userId, client] of clients.entries()) {
    if (client.isAlive === false) {
      clients.delete(userId);
      return client.terminate();
    }
    client.isAlive = false;
    client.ping();
  }
}, 30000);