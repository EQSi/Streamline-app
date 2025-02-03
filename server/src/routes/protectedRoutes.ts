import { Router } from 'express';
import { ensureAuthenticated } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send('Welcome to the dashboard!');
});

export default router;