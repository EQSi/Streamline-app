import { Router, Request, Response } from 'express';
import prisma from '../prismaClient'; // Ensure you have a Prisma client setup
import { EmployeeStatus, Position } from '@prisma/client'; // Import the enums from Prisma

const router = Router();

// Get all employees
router.get('/employees', async (_req: Request, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                user: true,
            },
        });
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Get a specific employee by ID
router.get('/employees/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
            },
        });
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// Create a new employee
router.post('/employees', async (req: Request, res: Response) => {
    const { id, firstName, lastName, email, phoneNumber, position, startDate, status, userId, salary } = req.body as {
        id?: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        position: Position;
        startDate: string; // Changed to string to parse date
        status: EmployeeStatus;
        userId: number;
        salary: number;
    };
    try {
        const newEmployee = await prisma.employee.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                position,
                startDate: new Date(startDate), // Parse date
                status,
                userId,
                salary,
            },
        });
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Failed to create employee', details: (error as Error).message });
    }
});

// Update an existing employee and user
router.put('/employees/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, position, startDate, status, userId, salary, username, password, role } = req.body;
    try {
        const [updatedEmployee, updatedUser] = await prisma.$transaction([
            prisma.employee.update({
                where: { id: Number(id) },
                data: {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    position,
                    startDate: new Date(startDate), // Parse date
                    status,
                    userId,
                    salary,
                },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    username,
                    password,
                    roles: role,
                },
            }),
        ]);
        res.json({ updatedEmployee, updatedUser });
    } catch (error) {
        console.error('Error updating employee and user:', error);
        res.status(500).json({ error: 'Failed to update employee and user', details: (error as Error).message });
    }
});

// Delete an employee
router.delete('/employees/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.employee.delete({
            where: { id: Number(id) },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee', details: (error as Error).message });
    }
});

export default router;