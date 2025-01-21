import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthController {
  async login(req: Request, res: Response) {
    // Passport will handle authentication
    res.json({ success: true });
  }

  async googleCallback(req: Request, res: Response) {
    // After successful Google authentication
    if (!req.user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    // Update or create user in database if needed
    try {
      const user = await prisma.user.findUnique({
        where: { id: (req.user as any).id },
        include: { employee: true }
      });
      
      if (user) {
        res.redirect('/dashboard');
      } else {
        res.redirect('/login?error=user_not_found');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      res.redirect('/login?error=server_error');
    }
  }
}