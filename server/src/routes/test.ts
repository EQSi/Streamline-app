// routes/test.ts
import express, { Request, Response } from 'express';

const router = express.Router();

// Define the '/api/test/auth' route
router.get('/auth', (req: Request, res: Response) => {
  res.json({ message: 'Authentication check successful' });
});

export default router;
