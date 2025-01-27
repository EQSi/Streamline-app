import { Router } from 'express';
import passport from 'passport';
import session from 'express-session';
import { ensureAuthenticated } from '../middleware/authMiddleware';

const router = Router();

router.use(session({
  secret: '7af5874c0999e9335418ef344d1704b67e5e2c7276a508ed7026df67ec44c34290239904cd344e51f449184f0f831630027a798d03d2ffeb7c18dc6e4156c848',
  resave: false,
  saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

router.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/api/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: 'https://localhost:3000/dashboard' // Redirect to the desired route after successful login
}));

// Add the /api/auth/me endpoint
router.get('/api/auth/me', ensureAuthenticated, (req, res) => {
  res.json(req.user);
});

export default router;
