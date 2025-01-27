import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport'; 
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes'; // Ensure this path is correct
import debugRoutes from './routes/debugRoutes';
import healthRoute from './routes/healthRoutes';
import testRoutes from './routes/test';
import protectedRoutes from './routes/protectedRoutes'; 
import employeeRoutes from './routes/employeeRoutes'; // Import employeeRoutes

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

// Commented out session middleware for testing purposes
// app.use(session({
//   secret: '7af5874c0999e9335418ef344d1704b67e5e2c7276a508ed7026df67ec44c34290239904cd344e51f449184f0f831630027a798d03d2ffeb7c18dc6e4156c848',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true } 
// }));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
// app.use(passport.session()); // Commented out for testing purposes

// Routes
app.use('/', authRoutes);
app.use('/api', userRoutes); 
app.use('/', debugRoutes);
app.use('/', healthRoute);
app.use('/api/test', testRoutes);
app.use('/', protectedRoutes); 
app.use('/api', employeeRoutes); // Use employeeRoutes

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
