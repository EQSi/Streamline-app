import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
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
    const { name, type, status, hasDivisions } = req.body as {
        name: string;
        type: CompanyType;
        status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
        hasDivisions: boolean;
    };
    try {
        // Return the created company with its divisions (which will be empty initially)
        const newCompany = await prisma.company.create({
            data: {
                name,
                type,
                status,
                hasDivisions,
            },
            include: {
                divisions: true,
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
    const { name, type, status, hasDivisions } = req.body;
    try {
        // Update the company and return it along with its divisions
        const updatedCompany = await prisma.company.update({
            where: { id: Number(id) },
            data: {
                name,
                type,
                status,
                hasDivisions,
            },
            include: {
                divisions: true,
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
        // Create the division and simultaneously add a location assignment with a new Location
        const newDivision = await prisma.division.create({
            data: {
                name,
                company: {
                    connect: { id: Number(companyId) },
                },
                locationAssignments: {
                    create: {
                        location: {
                            create: {
                                street1: location.street1,
                                street2: location.street2 || '',
                                city: location.city,
                                state: location.state,
                                zipCode: location.zipCode,
                            }
                        }
                    }
                }
            },
            include: {
                locationAssignments: {
                    include: { location: true }
                },
                company: true,
            }
        });
        res.status(201).json(newDivision);
    } catch (error) {
        console.error('Error adding division:', error);
        res.status(500).json({ error: 'Failed to add division', details: (error as Error).message });
    }
});

router.get('/companies/:companyId/divisions', async (req: Request, res: Response, next: NextFunction) => {
    const { companyId } = req.params;
    try {
        // Include the assigned locations via locationAssignments
        const divisions = await prisma.division.findMany({
            where: { companyId: Number(companyId) },
            include: {
                locationAssignments: {
                    include: { location: true }
                }
            },
        });
        res.json(divisions);
    } catch (error) {
        console.error('Error fetching divisions:', error);
        res.status(500).json({ error: 'Failed to fetch divisions', details: (error as Error).message });
    }
});

router.get('/divisions/:divisionId/locations', async (req: Request, res: Response, next: NextFunction) => {
    const { divisionId } = req.params;
    try {
        // Find the division and include its location assignments (and nested locations)
        const division = await prisma.division.findUnique({
            where: { id: Number(divisionId) },
            include: { locationAssignments: { include: { location: true } } },
        });
        if (!division) {
            res.status(404).json({ error: 'Division not found' });
        } else {
            // Extract the locations from locationAssignments and return as an array
            const locations = division.locationAssignments.map(assignment => assignment.location);
            res.json(locations);
        }
    } catch (error) {
        console.error('Error fetching locations for division:', error);
        res.status(500).json({ error: 'Failed to fetch locations', details: (error as Error).message });
    }
});

router.put('/divisions/:divisionId/locations/:locationId', async (req: Request, res: Response, next: NextFunction) => {
    const { divisionId, locationId } = req.params;
    const { street1, street2, city, state, zipCode } = req.body;
    try {
        // Verify the location is assigned to the provided division
        const assignment = await prisma.locationAssignment.findFirst({
            where: {
                divisionId: Number(divisionId),
                locationId: Number(locationId),
            },
        });

        if (!assignment) {
            res.status(404).json({ error: 'Location not found for the specified division' });
            return;
        }

        // Update the location fields
        const updatedLocation = await prisma.location.update({
            where: { id: Number(locationId) },
            data: {
                street1,
                street2: street2 || '',
                city,
                state,
                zipCode,
            },
        });

        res.json(updatedLocation);
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Failed to update location', details: (error as Error).message });
    }
});

// Create a location assignment for a company and its division
router.post('/companies/:companyId/divisions/:divisionId/assign-location', async (req: Request, res: Response, next: NextFunction) => {
    const { companyId, divisionId } = req.params;
    const { locationId } = req.body as { locationId: number };
    try {
        const assignment = await prisma.locationAssignment.create({
            data: {
                location: {
                    connect: { id: locationId },
                },
                company: {
                    connect: { id: Number(companyId) },
                },
                division: {
                    connect: { id: Number(divisionId) },
                },
            },
        });
        res.status(201).json(assignment);
    } catch (error) {
        console.error('Error creating location assignment:', error);
        res.status(500).json({ error: 'Failed to create location assignment', details: (error as Error).message });
    }
});

export default router;