import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { username } 
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return { token };
  }
}