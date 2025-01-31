import { Router, Request, Response } from 'express';
import prisma from '../prismaClient'; // Ensure you have a Prisma client setup
import bcrypt from 'bcrypt'; // Ensure you have bcrypt installed

const router = Router();

// Get all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    // Exclude sensitive data from the response (e.g., passwords)
    const usersWithoutPasswords = users.map(user => {
      const { password, ...publicUserData } = user; // Destructure and remove password
      return publicUserData;
    });

    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a specific user by ID
router.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (user) {
      // Exclude password from the response
      const { password, ...publicUserData } = user;
      res.json(publicUserData);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user
router.post('/users', async (req: Request, res: Response) => {
  const { username, password, roles, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roles,
        isAdmin,
      },
    });

    // Exclude password from the response when sending the created user data
    const { password: _, ...publicNewUser } = newUser; // Remove password from the response
    res.status(201).json(publicNewUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update an existing user
router.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password, roles, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username,
        password: hashedPassword,
        roles,
        isAdmin,
      },
    });

    // Exclude password from the response
    const { password: _, ...publicUpdatedUser } = updatedUser;
    res.json(publicUpdatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
