import express from 'express';

const router = express.Router();

// Debugging route
router.get('/api/debug', (req, res) => {
  res.json({ message: 'Debugging endpoint' });
});

export default router;
