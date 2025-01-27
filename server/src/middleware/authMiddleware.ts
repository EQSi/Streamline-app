import { Request, Response, NextFunction, Router } from 'express';
import passport from 'passport';

const router = Router();

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.warn(`Unauthorized access attempt to ${req.originalUrl}`);
  res.status(401).json({ error: 'Not authenticated' });
};

router.get('/api/auth/me', isAuthenticated, (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    console.warn('Authenticated user not found in session');
    res.status(404).json({ error: 'User not found' });
  }
});

export { isAuthenticated as ensureAuthenticated };
export default router;