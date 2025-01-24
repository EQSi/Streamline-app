// filepath: /Users/jtwellspring/repos/Streamline-app/server/src/server.ts
import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport'; // Import the passport configuration
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import debugRoutes from './routes/debugRoutes';
import healthRoute from './routes/healthRoutes';
import testRoutes from './routes/test';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../server.crt'))
};

// Apply CORS middleware
app.use(cors({
  origin: 'https://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Session middleware
app.use(session({
  secret: '7af5874c0999e9335418ef344d1704b67e5e2c7276a508ed7026df67ec44c34290239904cd344e51f449184f0f831630027a798d03d2ffeb7c18dc6e4156c848',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, sameSite: 'none' } // Ensure cookies are secure and cross-site
}));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', debugRoutes);
app.use('/', healthRoute);
app.use('/api/test', testRoutes);

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});