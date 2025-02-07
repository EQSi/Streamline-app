import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient'; // Ensure you have a Prisma client setup
import { CompanyType, EmployeeStatus } from '@prisma/client'; // Import the enums from Prisma

const router = Router();

// Get all companies
router.get('/companies', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companies = await prisma.company.findMany({
            include: {
                divisions: true,
            },
        });
        res.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

// Get a specific company by ID
router.get('/companies/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const company = await prisma.company.findUnique({
            where: { id: Number(id) },
            include: {
                divisions: true,
            },
        });
        if (company) {
            res.json(company);
        } else {
            res.status(404).json({ error: 'Company not found' });
        }
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ error: 'Failed to fetch company' });
    }
});

// Create a new company
router.post('/companies', async (req: Request, res: Response, next: NextFunction) => {
    const { name, type, status } = req.body as {
        name: string;
        type: CompanyType;
        status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    };
    try {
        const newCompany = await prisma.company.create({
            data: {
                name,
                type,
                status,
            },
        });
        res.status(201).json(newCompany);
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ error: 'Failed to create company', details: (error as Error).message });
    }
});

// Update an existing company
router.put('/companies/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, type, status } = req.body;
    try {
        const updatedCompany = await prisma.company.update({
            where: { id: Number(id) },
            data: {
                name,
                type,
                status,
            },
        });
        res.json(updatedCompany);
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ error: 'Failed to update company', details: (error as Error).message });
    }
});

// Delete a company
router.delete('/companies/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await prisma.company.delete({
            where: { id: Number(id) },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ error: 'Failed to delete company', details: (error as Error).message });
    }
});

// Add a division to a company
router.post('/companies/:companyId/divisions', async (req: Request, res: Response, next: NextFunction) => {
    const { companyId } = req.params;
    const { name, location } = req.body as {
        name: string;
        location: {
            street1: string;
            street2?: string;
            city: string;
            state: string;
            zipCode: string;
        };
    };
    try {
        const newDivision = await prisma.division.create({
            data: {
                name,
                location: {
                    create: {
                        ...location,
                        street2: location.street2 || '',
                        company: {
                            connect: { id: Number(companyId) },
                        },
                    },
                },
                company: {
                    connect: { id: Number(companyId) },
                },
            },
        });
        res.status(201).json(newDivision);
    } catch (error) {
        console.error('Error adding division:', error);
        res.status(500).json({ error: 'Failed to add division', details: (error as Error).message });
    }
});

export default router;