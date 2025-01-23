import express from 'express';

const router = express.Router();

// Route for user information
router.get('/user', (req, res) => {
  res.send('User info route');
});

export default router;
