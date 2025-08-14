
const express = require('express');
const admin = require('../firebaseAdmin');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify Firebase ID Token from frontend
router.post('/verifyToken', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ uid: decoded.uid, email: decoded.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
