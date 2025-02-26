import { Router, Request, Response } from 'express';
import prisma from '../prismaClient'; // Ensure you have a Prisma client setup
import bcrypt from 'bcrypt';

const router = Router();

// Get all permissions
router.get('/permissions', async (_req: Request, res: Response) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// Get permissions for a specific permission group
router.get('/permission-groups/:id/permissions', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const permissionGroup = await prisma.permissionGroup.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        if (permissionGroup) {
            res.json(permissionGroup.permissions.map(p => p.permission));
        } else {
            res.status(404).json({ error: 'Permission group not found' });
        }
    } catch (error) {
        console.error('Error fetching permissions for permission group:', error);
        res.status(500).json({ error: 'Failed to fetch permissions for permission group' });
    }
});

// Add permissions to a permission group
router.post('/permission-groups/:id/permissions', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permissionIds } = req.body as { permissionIds: string[] };
    try {
        const permissionGroup = await prisma.permissionGroup.update({
            where: { id },
            data: {
                permissions: {
                    create: permissionIds.map(permissionId => ({
                        permissionId,
                    })),
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        res.status(201).json(permissionGroup.permissions.map(p => p.permission));
    } catch (error) {
        console.error('Error adding permissions to permission group:', error);
        res.status(500).json({ error: 'Failed to add permissions to permission group', details: (error as Error).message });
    }
});

// Remove permissions from a permission group
router.delete('/permission-groups/:id/permissions', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permissionIds } = req.body as { permissionIds: string[] };
    try {
        const permissionGroup = await prisma.permissionGroup.update({
            where: { id },
            data: {
                permissions: {
                    deleteMany: {
                        permissionId: {
                            in: permissionIds,
                        },
                    },
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        res.json(permissionGroup.permissions.map(p => p.permission));
    } catch (error) {
        console.error('Error removing permissions from permission group:', error);
        res.status(500).json({ error: 'Failed to remove permissions from permission group', details: (error as Error).message });
    }
});

// Get role and its permission group
router.get('/roles/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                permissionGroup: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        if (role) {
            res.json(role);
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (error) {
        console.error('Error fetching role and permission group:', error);
        res.status(500).json({ error: 'Failed to fetch role and permission group' });
    }
});

// Get all roles
router.get('/roles', async (_req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissionGroup: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

// Get all permission groups
router.get('/permission-groups', async (_req: Request, res: Response) => {
    try {
        const permissionGroups = await prisma.permissionGroup.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        res.json(permissionGroups);
    } catch (error) {
        console.error('Error fetching permission groups:', error);
        res.status(500).json({ error: 'Failed to fetch permission groups' });
    }
});

// Get all users
router.get('/users', async (_: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        const usersWithoutPasswords = users.map(user => ({
            ...user,
            password: undefined,
        }));
        res.json(usersWithoutPasswords);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get a specific user
router.get('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                role: true,
                employee: true,
                permissions: { include: { permission: true } },
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (!user.employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }
        const userPermissions = user.permissions.map(up => up.permission.name);
        res.json({ ...user, permissions: userPermissions });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create a new user
router.post('/users', async (req: Request, res: Response) => {
    const { username, password, roles } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: roles,
            },
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update an existing user
router.put('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, password, roles } = req.body;
    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                username,
                password: hashedPassword,
                role: roles,
            },
        });
        res.json(updatedUser);
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
            where: { id },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.get('/roles/:id/permission-group', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                permissionGroup: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        if (role && role.permissionGroup) {
            res.json(role.permissionGroup);
        } else {
            res.status(404).json({ error: 'Role or permission group not found' });
        }
    } catch (error) {
        console.error('Error fetching permission group for role:', error);
        res.status(500).json({ error: 'Failed to fetch permission group for role' });
    }
});


export default router;