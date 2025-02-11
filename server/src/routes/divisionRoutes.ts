import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get all divisions
router.get('/divisions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const divisions = await prisma.division.findMany({
            // Assuming a relation to a company exists so we can include it
            include: { company: true },
        });
        res.json(divisions);
    } catch (error) {
        console.error('Error fetching divisions:', error);
        res.status(500).json({ error: 'Failed to fetch divisions' });
    }
});

// Get a specific division by ID
router.get('/divisions/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const division = await prisma.division.findUnique({
            where: { id: Number(id) },
            include: { company: true },
        });
        if (division) {
            res.json(division);
        } else {
            res.status(404).json({ error: 'Division not found' });
        }
    } catch (error) {
        console.error('Error fetching division:', error);
        res.status(500).json({ error: 'Failed to fetch division' });
    }
});

// Create a new division (associating it with a company)
router.post('/divisions', async (req: Request, res: Response, next: NextFunction) => {
    const { companyId, name, location } = req.body as {
        companyId: number;
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
                        street1: location.street1,
                        street2: location.street2 ?? '',
                        city: location.city,
                        state: location.state,
                        zipCode: location.zipCode,
                        company: { connect: { id: companyId } }
                    },
                },
                company: { connect: { id: companyId } },
            },
            include: { company: true },
        });
        res.status(201).json(newDivision);
    } catch (error) {
        console.error('Error creating division:', error);
        res.status(500).json({ error: 'Failed to create division', details: (error as Error).message });
    }
});

// Update an existing division
router.put('/divisions/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, location } = req.body;

    try {
        const updatedDivision = await prisma.division.update({
            where: { id: Number(id) },
            data: {
                name,
                location,
            },
            include: { company: true },
        });
        res.json(updatedDivision);
    } catch (error) {
        console.error('Error updating division:', error);
        res.status(500).json({ error: 'Failed to update division', details: (error as Error).message });
    }
});

// Delete a division
router.delete('/divisions/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        await prisma.division.delete({
            where: { id: Number(id) },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting division:', error);
        res.status(500).json({ error: 'Failed to delete division', details: (error as Error).message });
    }
});

router.get('/divisions/:id/locations', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const divisionWithLocation = await prisma.division.findUnique({
            where: { id: Number(id) },
            include: { location: true },
        });
        if (divisionWithLocation && divisionWithLocation.location) {
            res.json(divisionWithLocation.location);
        } else {
            res.status(404).json({ error: 'Division or location not found' });
        }
    } catch (error) {
        console.error('Error fetching division location:', error);
        res.status(500).json({ error: 'Failed to fetch division location', details: (error as Error).message });
    }
});

export default router;