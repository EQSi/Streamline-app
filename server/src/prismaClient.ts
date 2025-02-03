import { PrismaClient } from '@prisma/client';

// Define the Prisma Client instance
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance of PrismaClient
  prisma = new PrismaClient();
} else {
  // In development, check if a PrismaClient already exists on the global object
  if (!(global as any).prisma) {
    // Create a new instance and attach it to the global object
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// Optionally log connection status in development
if (process.env.NODE_ENV === 'development') {
  prisma
    .$connect()
    .then(() => console.log('Prisma Client connected to the database (development mode)'))
    .catch((err) => console.error('Failed to connect Prisma Client:', err));
}

// Export the Prisma Client instance
export default prisma;
