import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

// GET all roles with related permission group information
router.get('/roles', async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: { permissionGroup: true },
        })
        res.json(roles)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching roles' })
    }
})

// Create a new role
router.post('/roles', async (req, res) => {
    try {
        const { name, permissionGroupId } = req.body
        const newRole = await prisma.role.create({
            data: { name, permissionGroupId },
        })
        res.status(201).json(newRole)
    } catch (error) {
        res.status(500).json({ error: 'Error creating role' })
    }
})

// Update an existing role
router.put('/roles/:id', async (req, res) => {
    try {
        const { id } = req.params
        const updatedRole = await prisma.role.update({
            where: { id },
            data: req.body,
        })
        res.json(updatedRole)
    } catch (error) {
        res.status(500).json({ error: 'Error updating role' })
    }
})

// Delete a role
router.delete('/roles/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletedRole = await prisma.role.delete({
            where: { id },
        })
        res.json(deletedRole)
    } catch (error) {
        res.status(500).json({ error: 'Error deleting role' })
    }
})

// GET all permissions
router.get('/permissions', async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany()
        res.json(permissions)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching permissions' })
    }
})

// Create a new permission
router.post('/permissions', async (req, res) => {
    try {
        const { name } = req.body
        const newPermission = await prisma.permission.create({
            data: { name },
        })
        res.status(201).json(newPermission)
    } catch (error) {
        res.status(500).json({ error: 'Error creating permission' })
    }
})

// Update an existing permission
router.put('/permissions/:id', async (req, res) => {
    try {
        const { id } = req.params
        const updatedPermission = await prisma.permission.update({
            where: { id },
            data: req.body,
        })
        res.json(updatedPermission)
    } catch (error) {
        res.status(500).json({ error: 'Error updating permission' })
    }
})

// Delete a permission
router.delete('/permissions/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletedPermission = await prisma.permission.delete({
            where: { id },
        })
        res.json(deletedPermission)
    } catch (error) {
        res.status(500).json({ error: 'Error deleting permission' })
    }
})

/* Permission Group Endpoints */

// GET all permission groups with associated permissions
router.get('/permission-groups', async (req, res) => {
    try {
        const permissionGroups = await prisma.permissionGroup.findMany({
            include: { permissions: { include: { permission: true } } },
        })
        res.json(permissionGroups)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching permission groups' })
    }
})

// Create a new permission group
router.post('/permission-groups', async (req, res) => {
    try {
        const { name } = req.body
        const newGroup = await prisma.permissionGroup.create({
            data: { name },
        })
        res.status(201).json(newGroup)
    } catch (error) {
        res.status(500).json({ error: 'Error creating permission group' })
    }
})

// Update an existing permission group
router.put('/permission-groups/:id', async (req, res) => {
    try {
        const { id } = req.params
        const updatedGroup = await prisma.permissionGroup.update({
            where: { id },
            data: req.body,
        })
        res.json(updatedGroup)
    } catch (error) {
        res.status(500).json({ error: 'Error updating permission group' })
    }
})

// Delete a permission group
router.delete('/permission-groups/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletedGroup = await prisma.permissionGroup.delete({
            where: { id },
        })
        res.json(deletedGroup)
    } catch (error) {
        res.status(500).json({ error: 'Error deleting permission group' })
    }
})

/* Permission On Group Endpoints */

// GET all permission on group mappings (associating permissions to groups)
router.get('/permission-on-groups', async (req, res) => {
    try {
        const mappings = await prisma.permissionOnGroup.findMany({
            include: { permission: true, permissionGroup: true },
        })
        res.json(mappings)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching permission on group mappings' })
    }
})

// Create a new permission on group mapping
router.post('/permission-on-groups', async (req, res) => {
    try {
        const { permissionId, permissionGroupId } = req.body
        const newMapping = await prisma.permissionOnGroup.create({
            data: { permissionId, permissionGroupId },
        })
        res.status(201).json(newMapping)
    } catch (error) {
        res.status(500).json({ error: 'Error creating permission on group mapping' })
    }
})

// Delete a permission on group mapping
router.delete('/permission-on-groups/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletedMapping = await prisma.permissionOnGroup.delete({
            where: { id },
        })
        res.json(deletedMapping)
    } catch (error) {
        res.status(500).json({ error: 'Error deleting permission on group mapping' })
    }
})

/* User Permission Endpoints */

// GET all user permissions
router.get('/user-permissions', async (req, res) => {
    try {
        const userPermissions = await prisma.userPermission.findMany({
            include: { user: true, permission: true },
        })
        res.json(userPermissions)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user permissions' })
    }
})

// Create a new user permission
router.post('/user-permissions', async (req, res) => {
    try {
        const { userId, permissionId } = req.body
        const newUserPermission = await prisma.userPermission.create({
            data: { userId, permissionId },
        })
        res.status(201).json(newUserPermission)
    } catch (error) {
        res.status(500).json({ error: 'Error creating user permission' })
    }
})

// Delete a user permission
router.delete('/user-permissions/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletedUserPermission = await prisma.userPermission.delete({
            where: { id },
        })
        res.json(deletedUserPermission)
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user permission' })
    }
})

export default router