import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { configurePassport } from './config/passport';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // Frontend origin
    credentials: true,
  })
);

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
