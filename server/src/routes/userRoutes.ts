import express, { Request, Response } from 'express';
import prisma from '../prismaClient'; // Ensure you have a Prisma client setup
import bcrypt from 'bcrypt'; // Ensure you have bcrypt installed

const router = express.Router();

// Get all users
router.get('/users', async (_: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    // Exclude sensitive data from the response (e.g., passwords)
    const usersWithoutPasswords = users.map(user => {
      const { password, ...publicUserData } = user;
      return publicUserData;
    });

    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }, // id is now treated as string
      select: {
        id: true,
        username: true,
        role: {
          select: {
            id: true,
            name: true,
            permissionGroup: {
              select: {
                permissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        employee: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.employee) {
      res.status(404).json({ error: 'Employee record not found for this user' });
      return;
    }

    const userPermissions = user.role.permissionGroup.permissions.map(pg => pg.permission.name);

    res.json({
      id: user.id,
      username: user.username,
      role: user.role.name,
      permissions: userPermissions,
      firstName: user.employee.firstName,
      lastName: user.employee.lastName,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user
router.post('/users', async (req: Request, res: Response) => {
  const { username, password, roleId } = req.body;
  if (!roleId) {
    res.status(400).json({ error: 'roleId is required' });
    return;
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: {
          connect: { id: roleId }
        },
      },
    });

    // Exclude password from the response when sending the created user data
    const { password: _, ...publicNewUser } = newUser;
    res.status(201).json(publicNewUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update an existing user
router.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password, roleId } = req.body;
  try {
    let data: any = {};
    if (username !== undefined) {
      data.username = username;
    }
    if (roleId !== undefined) {
      // Check if the role exists before connecting
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }
      data.role = { connect: { id: roleId } };
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }
    const updatedUser = await prisma.user.update({
      where: { id }, // id is now treated as string
      data,
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
      where: { id }, // id is now treated as string
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
