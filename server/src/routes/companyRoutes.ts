import express from 'express';
import { PrismaClient, CompanyType } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/companies', async (_, res) => {
    try {
        const companies = await prisma.company.findMany({
            include: {
                location: true,
                divisions: true
            }
        });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

router.get('/companies/:id', async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                location: true,
                divisions: true
            }
        });
        if (company) {
            res.json(company);
        } else {
            res.status(404).send('Company not found');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company' });
    }
});

router.post('/companies', async (req, res) => {
    try {
        const { name, locationId, divisions } = req.body;
        const newCompany = await prisma.company.create({
            data: {
                name,
                locationId,
                type: CompanyType.Customer,
                divisions: {
                    create: divisions
                }
            }
        });
        res.status(201).json(newCompany);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create company' });
    }
});

router.put('/companies/:id', async (req, res) => {
    try {
        const { name, locationId, divisions } = req.body;
        const company = await prisma.company.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                locationId,
                divisions: {
                    deleteMany: {},
                    create: divisions
                }
            }
        });
        res.json(company);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update company' });
    }
});

router.delete('/companies/:id', async (req, res) => {
    try {
        await prisma.company.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

export default router;