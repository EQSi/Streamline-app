import { Router, Request, Response } from "express";
import { PrismaClient, Location } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/locations", async (_req: Request, res: Response) => {
    try {
        const locations = await prisma.location.findMany({
            include: {
                locationAssignments: {
                    select: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        division: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedLocations = locations.map((loc: Location & { locationAssignments: any[] }) => {
            const companies = loc.locationAssignments
                .filter((la: any) => la.company)
                .map((la: any) => la.company!.name);
            const divisions = loc.locationAssignments
                .filter((la: any) => la.division)
                .map((la: any) => la.division!.name);

            // Remove duplicate names if any
            const uniqueCompanies = Array.from(new Set(companies));
            const uniqueDivisions = Array.from(new Set(divisions));

            return {
                id: loc.id.toString(),
                companies: uniqueCompanies,
                address: `${loc.street1}${loc.street2 ? " " + loc.street2 : ""}, ${loc.city}, ${loc.state} ${loc.zipCode}`,
                divisions: uniqueDivisions,
            };
        });

        res.json(formattedLocations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/locations", async (req: Request, res: Response) => {
    const { street1, street2, city, state, zipCode } = req.body;

    try {
        // Calculate a new id; if there is already 1 record, the new id will be 2
        const count = await prisma.location.count();
        const newId = count === 0 ? 1 : count + 1;

        const newLocation = await prisma.location.create({
            data: {
                id: newId,
                street1,
                street2,
                city,
                state,
                zipCode,
            },
        });

        res.status(201).json(newLocation);
    } catch (error) {
        console.error("Error creating location:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;