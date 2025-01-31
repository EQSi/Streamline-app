import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request object to include userId (from JWT)
export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    req.userId = decoded.id;
    next();
  });
};

// Function to check authentication from the frontend (this could be used for client-side authentication checking)
export const checkAuth = async () => {
  try {
    // Make a request to the backend endpoint to verify if the user is authenticated
    const res = await fetch('https://localhost:8080/api/auth/me', {
      credentials: 'include' // Include credentials (cookies) for the request
    });

    if (!res.ok) {
      console.warn('User is not authenticated');
      return false;
    }

    // Return the authenticated user data if successful
    return await res.json();
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// This middleware can be used to protect routes where the user must be authenticated
export const ensureAuthenticated = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // If userId is attached to the request object after JWT validation, the user is authenticated
  if (req.userId) {
    next(); // Proceed to the next middleware/handler
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // User is not authenticated
  }
};
