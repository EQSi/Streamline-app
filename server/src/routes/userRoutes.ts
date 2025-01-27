import { Router, Request, Response } from 'express';
import prisma from '../prismaClient'; // Ensure you have a Prisma client setup
import { EmployeeStatus } from '@prisma/client'; // Import the enum from Prisma

const router = Router();

// Get all users with their related employees
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        employee: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a specific user with their related employee by ID
router.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
      },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user and employee
router.post('/users', async (req: Request, res: Response) => {
  const { username, password, role, firstName, lastName, email, phoneNumber, position, startDate, status, salary } = req.body as {
    username: string;
    password: string;
    role: undefined;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    position: string;
    startDate: string;
    status: EmployeeStatus;
    salary: number;
  };
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        roles: role,
        googleId: undefined,
        googleAccessToken: undefined,
        googleRefreshToken: undefined,
        employee: {
          create: {
            firstName,
            lastName,
            email,
            phoneNumber,
            position,
            startDate: new Date(startDate), // Parse date
            status,
            salary,
          },
        },
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user and employee:', error);
    res.status(500).json({ error: 'Failed to create user and employee', details: (error as Error).message });
  }
});

// Update an existing user and employee
router.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password, role, firstName, lastName, email, phoneNumber, position, startDate, status, salary } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username,
        password,
        roles: role,
        employee: {
          update: {
            firstName,
            lastName,
            email,
            phoneNumber,
            position,
            startDate: new Date(startDate), // Parse date
            status,
            salary,
          },
        },
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user and employee:', error);
    res.status(500).json({ error: 'Failed to update user and employee', details: (error as Error).message });
  }
});

export default router;