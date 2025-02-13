import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient'; // Ensure you have a Prisma client setup

const router = Router();

// Get all permissions
router.get('/permissions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// Get a specific permission by ID
router.get('/permissions/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const permission = await prisma.permission.findUnique({
            where: { id },
        });
        if (permission) {
            res.json(permission);
        } else {
            res.status(404).json({ error: 'Permission not found' });
        }
    } catch (error) {
        console.error('Error fetching permission:', error);
        res.status(500).json({ error: 'Failed to fetch permission' });
    }
});

// Create a new permission
router.post('/permissions', async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    try {
        const newPermission = await prisma.permission.create({
            data: { name },
        });
        res.status(201).json(newPermission);
    } catch (error) {
        console.error('Error creating permission:', error);
        res.status(500).json({ error: 'Failed to create permission' });
    }
});

// Update an existing permission
router.put('/permissions/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const updatedPermission = await prisma.permission.update({
            where: { id },
            data: { name },
        });
        res.json(updatedPermission);
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ error: 'Failed to update permission' });
    }
});

// Delete a permission
router.delete('/permissions/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await prisma.permission.delete({
            where: { id },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting permission:', error);
        res.status(500).json({ error: 'Failed to delete permission' });
    }
});

// Get all roles
router.get('/roles', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roles = await prisma.role.findMany();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

// Get all users
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get permission groups for a specific role
router.get('/roles/:roleId/permission-groups', async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    try {
        const permissionGroups = await prisma.permissionGroup.findMany({
            where: { roles: { some: { id: roleId } } },
            include: { permissions: true }
        });
        res.json(permissionGroups);
    } catch (error) {
        console.error('Error fetching permission groups:', error);
        res.status(500).json({ error: 'Failed to fetch permission groups' });
    }
});


// Save permissions for a specific role
router.post('/roles/:roleId/permissions', async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    const permissionGroups = req.body;
    try {
        // Assuming you have a function to handle saving permissions
        await savePermissions(roleId, permissionGroups);
        res.status(200).json({ message: 'Permissions updated successfully' });
    } catch (error) {
        console.error('Error saving permissions:', error);
        res.status(500).json({ error: 'Failed to save permissions' });
    }
});

const savePermissions = async (roleId: string, permissionGroups: any[]) => {
    // Implement your logic to save permissions here
    // This is just a placeholder function
    // You might need to interact with your database to save the permissions
};
// Fetch role permission groups
router.get('/roles/:roleId/permissions', async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    try {
        const permissionGroups = await prisma.permissionGroup.findMany({
            where: { roles: { some: { id: roleId } } },
            include: { permissions: true }
        });
        res.json(permissionGroups);
    } catch (error) {
        console.error('Error fetching permission groups:', error);
        res.status(500).json({ error: 'Failed to fetch permission groups' });
    }
});

export default router;