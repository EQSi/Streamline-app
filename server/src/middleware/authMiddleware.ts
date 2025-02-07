import { NextFunction, Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request object to include userId (from JWT)
export interface AuthRequest extends Request {
  userId?: string;
}

// Middleware to validate JWT if you're using token-based authentication
export const authenticateToken: RequestHandler = (req, res, next) => {
  // Try to get the token from either cookies or Authorization header
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET as string, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Forbidden: Invalid token' });
      return;
    }

    // Attach user info (e.g., userId) to the request object
    (req as AuthRequest).userId = decoded.id;
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

