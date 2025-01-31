import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    const user = await this.prisma.user.findUnique({ where: { username }, select: { username: true, password: true } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ username }, process.env.SESSION_SECRET || 'default_secret', { expiresIn: '1h' });
    return { token };
  }
}
