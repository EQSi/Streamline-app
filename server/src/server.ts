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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../server.crt'))
};

// Apply CORS middleware
app.use(cors({
  origin: 'https://localhost:3000', // Adjust this based on your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware for parsing JSON requests
app.use(express.json());

// Routes that don't require authentication
app.use('/api/auth', authRoutes);

app.use('/api', [authenticateToken], userRoutes);  // Protect this route with JWT
app.use('/api', [authenticateToken], companyRoutes); 
app.use('/api', [authenticateToken], employeeRoutes);   // Protect employee routes with JWT

// HTTPS server setup
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
