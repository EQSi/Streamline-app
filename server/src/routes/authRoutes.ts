import express from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';

const router = express.Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.get('/google', 
    (req, res, next) => {
        console.log('Google auth initiated');
        passport.authenticate('google', { 
            scope: ['profile', 'email'],
            prompt: 'select_account'
        })(req, res, next);
    }
);
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.googleCallback
);

export default router;