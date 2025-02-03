// routes/healthRoute.ts

import express from 'express';

const router = express.Router();

// Health check route
router.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is healthy!',
  });
});

export default router;
