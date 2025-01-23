import express from 'express';

const router = express.Router();

// Route for Google OAuth
router.get('/google', (req, res) => {
  res.send('Google OAuth login page');
});

// Route for Google OAuth callback
router.get('/google/callback', (req, res) => {
  res.send('Google OAuth callback');
});

// Route for logout
router.get('/logout', (req, res) => {
  res.send('Logout successful');
});

export default router;
