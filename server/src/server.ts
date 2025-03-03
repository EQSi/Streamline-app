import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken } from './middleware/authMiddleware'; // Import the JWT authentication middleware
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import companyRoutes from './routes/companyRoutes';
import employeeRoutes from './routes/employeeRoutes';
import divisionRoutes from './routes/divisionRoutes';
import permissionRoutes from './routes/permissionRoutes';
import locationRoutes from './routes/locationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:3000';

const options = {
  key: Buffer.from(process.env.SSL_KEY_FILE as string, 'base64'),
  cert: Buffer.from(process.env.SSL_CRT_FILE as string, 'base64'),
};

// Apply CORS middleware using the FRONTEND_URL from .env
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));

// Middleware for parsing JSON requests
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is home route");
});

// Routes that don't require authentication
app.use('/api/auth', authRoutes);

app.use('/api', [authenticateToken], divisionRoutes);
app.use('/api', [authenticateToken], userRoutes);  // Protect this route with JWT
app.use('/api', [authenticateToken], companyRoutes); 
app.use('/api', [authenticateToken], employeeRoutes);   // Protect employee routes with JWT
app.use('/api', [authenticateToken], permissionRoutes);   // Protect employee routes with JWT
app.use('/api', [authenticateToken], locationRoutes); 

// HTTPS server setup
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
