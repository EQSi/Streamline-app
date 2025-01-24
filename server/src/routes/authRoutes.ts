// filepath: /Users/jtwellspring/repos/Streamline-app/server/src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/api/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: 'https://localhost:3000/dashboard' // Redirect to the desired route after successful login
}));

export default router;