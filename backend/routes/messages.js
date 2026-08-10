const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get chat history between two users
router.get('/', async (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2) {
    return res.status(400).json({ error: 'Missing user1 or user2 query params' });
  }

  try {
    const messages = await db.getMessages(user1, user2);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message (HTTP fallback)
router.post('/', async (req, res) => {
  const { sender_username, recipient_username, content } = req.body;
  if (!sender_username || !recipient_username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const message = await db.addMessage({ sender_username, recipient_username, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;
