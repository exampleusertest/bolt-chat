import { Router } from 'express';
import { db } from '../database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get messages for a channel
router.get('/channel/:channelId', authenticateToken, (req, res) => {
  const { channelId } = req.params;
  const messages = db.prepare(`
    SELECT m.*, u.username, u.avatar_url
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.channel_id = ?
    ORDER BY m.created_at DESC
    LIMIT 50
  `).all(channelId);
  
  res.json(messages);
});

// Get direct messages between two users
router.get('/direct/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  
  const messages = db.prepare(`
    SELECT m.*, u.username, u.avatar_url
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at DESC
    LIMIT 50
  `).all(currentUserId, userId, userId, currentUserId);
  
  res.json(messages);
});

export { router as messageRouter };