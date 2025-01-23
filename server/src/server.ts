import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.use(cors({
  origin: 'https://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware
app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', debugRoutes);
app.use('/', healthRoute);
app.use('/api/test', testRoutes);

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});