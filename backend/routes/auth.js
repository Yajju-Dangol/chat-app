const express = require('express');
const router = express.Router();
const db = require('../db');

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  try {
    const user = await db.registerUser(username.trim(), password);
    res.status(201).json(user);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Registration failed';
    res.status(status).json({ error: message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.loginUser(username.trim(), password);
    res.json(user);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Login failed';
    res.status(status).json({ error: message });
  }
});

module.exports = router;
