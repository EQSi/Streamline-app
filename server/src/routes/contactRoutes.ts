import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Create a new contact for a company
router.post('/companies/:companyId/contacts', async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const { firstname: firstName, lastname: lastName, phone, email } = req.body;

    try {
        const { type } = req.body;
        const newContact = await prisma.contact.create({
            data: {
            firstName,
            lastName,
            email,
            phoneNumber: phone,
            type: type, // this now allows the user to choose the contact type
            company: { connect: { id: Number(companyId) } }
            },
        });
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating company contact:', error);
        res.status(500).json({ error: 'Failed to create company contact' });
    }
});

// Get all contacts for a company
router.get('/companies/:companyId/contacts', async (req: Request, res: Response) => {
    const { companyId } = req.params;

    try {
        const contacts = await prisma.contact.findMany({
            where: { companyId: Number(companyId) },
        });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching company contacts:', error);
        res.status(500).json({ error: 'Failed to fetch company contacts' });
    }
});

// Create a new contact for a division
router.post('/divisions/:divisionId/contacts', async (req: Request, res: Response) => {
    const { divisionId } = req.params;
    const { firstname: firstName, lastname: lastName, phone, email, type } = req.body;

    try {
        const newContact = await prisma.contact.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber: phone,
                type,
                division: { connect: { id: Number(divisionId) } }
            },
        });
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating division contact:', error);
        res.status(500).json({ error: 'Failed to create division contact' });
    }
});

// Get all contacts for a division
router.get('/divisions/:divisionId/contacts', async (req: Request, res: Response) => {
    const { divisionId } = req.params;

    try {
        const contacts = await prisma.contact.findMany({
            where: { divisionId: Number(divisionId) },
        });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching division contacts:', error);
        res.status(500).json({ error: 'Failed to fetch division contacts' });
    }
});

// Update an existing contact
router.put('/contacts/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { firstName, lastName, phone, email, type } = req.body;

    try {
        const updatedContact = await prisma.contact.update({
            where: { id: Number(id) },
            data: { firstName, lastName, phoneNumber: phone, email, type },
        });
        res.json(updatedContact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

// Delete a contact by its ID
router.delete('/contacts/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.contact.delete({
            where: { id: Number(id) },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

export default router;