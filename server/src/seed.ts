import { PrismaClient, Position } from "@prisma/client";
import bcrypt from "bcrypt";
import { execSync } from "child_process";

const prisma = new PrismaClient();

/**
 * Runs Prisma migrations to ensure tables exist before seeding.
 */
async function createTables() {
    try {
        console.log("🚀 Running Prisma migrations...");
        execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
    } catch (error) {
        console.error("❌ Error creating tables:", error);
        process.exit(1);
    }
}

/**
 * Seeds predefined roles with default permission groups.
 * Uses connectOrCreate to ensure that the permission group exists.
 */
async function seedRoles() {
    console.log("🌱 Seeding roles...");

    const roles = ["ADMIN", "PROJECT_MANAGER", "EMPLOYEE"];

    const createdRoles = [];
    for (const role of roles) {
        const createdRole = await prisma.role.upsert({
            where: { name: role },
            update: {},
            create: { 
                name: role,
                permissionGroup: {
                    connectOrCreate: {
                        where: { name: "default" },
                        create: { name: "default" },
                    },
                },
            },
            include: { permissionGroup: true },
        });
        createdRoles.push(createdRole);
    }

    console.log("✅ Roles Seeded!");
    return createdRoles;
}

/**
 * Seeds predefined permissions into the database.
 */
async function seedPermissions() {
    console.log("🌱 Seeding permissions...");

    const permissions = [
        "view_jobs", "create_jobs", "edit_jobs", "delete_jobs", "schedule_jobs",
        "view_quotes", "create_quotes", "edit_quotes", "delete_quotes",
        "upload_invoices", "view_invoices", "delete_invoices",
        "manage_application_settings", "manage_users", "view_dashboard",
        "manage_permissions"
    ];

    await Promise.all(
        permissions.map((permission) =>
            prisma.permission.upsert({
                where: { name: permission },
                update: {},
                create: { name: permission },
            })
        )
    );

    console.log("✅ Permissions Seeded!");
}

/**
 * Assigns permissions to different roles.
 */
interface SeededRole {
    name: "ADMIN" | "PROJECT_MANAGER" | "EMPLOYEE";
    permissionGroup: { id: string };
}

async function assignPermissionsToRoles(roles: SeededRole[]) {
    console.log("🔗 Assigning permissions to roles...");

    // Fetch all permissions
    const allPermissions = await prisma.permission.findMany();

    // Define role-based permission subsets
    const permissionGroups: { [key in SeededRole["name"]]: typeof allPermissions } = {
        ADMIN: allPermissions,
        PROJECT_MANAGER: allPermissions.filter((p) =>
            ["view_jobs", "create_jobs", "edit_jobs", "delete_jobs", "schedule_jobs", "view_quotes", "create_quotes", "edit_quotes", "delete_quotes", "view_dashboard"].includes(p.name)
        ),
        EMPLOYEE: allPermissions.filter((p) =>
            ["view_jobs", "schedule_jobs", "upload_invoices"].includes(p.name)
        ),
    };

    // Function to assign permissions to a permission group
    async function assignPermissions(groupId: string, permissions: typeof allPermissions) {
        await prisma.permissionOnGroup.createMany({
            data: permissions.map((perm) => ({
                permissionGroupId: groupId,
                permissionId: perm.id,
            })),
            skipDuplicates: true, // Avoid duplicate entries
        });
    }

    // Assign permissions based on roles
    await Promise.all(
        roles.map(async (role) => {
            await assignPermissions(role.permissionGroup.id, permissionGroups[role.name]);
        })
    );

    console.log("✅ Permissions assigned to roles!");
}

/**
 * Seeds users and their associated employee records.
 */
async function seedUsers() {
    console.log("🌱 Seeding users and employees...");

    // Create a default PermissionGroup (if not exists)
    const permissionGroup = await prisma.permissionGroup.upsert({
        where: { name: "Default Group" },
        update: {},
        create: {
            name: "Default Group",
        },
    });

    // Create a default role "USER" for seeding users/employees
    const defaultRole = await prisma.role.upsert({
        where: { name: "USER" },
        update: {},
        create: {
            name: "USER",
            permissionGroupId: permissionGroup.id,
        },
    });

    // Define the plaintext password and hash it once
    const plaintextPassword = "Welcome1";
    const hashedPassword = plaintextPassword.startsWith("$2b$")
      ? plaintextPassword
      : await bcrypt.hash(plaintextPassword, 10);

    const seedData = [
        {
            username: "john_doe",
            employee: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phoneNumber: "555-1234",
                position: Position.ProjectManager,
                salary: 60000.0,
            },
        },
        {
            username: "jane_doe",
            employee: {
                firstName: "Jane",
                lastName: "Doe",
                email: "jane.doe@example.com",
                phoneNumber: "555-5678",
                position: Position.ProjectManager,
                salary: 65000.0,
            },
        },
    ];

    // Loop over seedData to create User and Employee records linked together
    for (const data of seedData) {
        // Create user with hashed password and default role
        const user = await prisma.user.create({
            data: {
                username: data.username,
                password: hashedPassword,
                roleId: defaultRole.id,
            },
        });

        // Create employee linked to the user created above
        await prisma.employee.create({
            data: {
                ...data.employee,
                userId: user.id,
            },
        });

        console.log(`Seeded user: ${data.username} with associated employee`);
    }
}

/**
 * Main function to run all seeding steps.
 */
async function seed() {
    try {
        console.log("🌱 Starting database seeding...");

        // Ensure database tables are set up
        await createTables();

        // Seed roles, permissions, and assign permissions based on roles
        const seededRoles = await seedRoles();
        await seedPermissions();
        await assignPermissionsToRoles(
            seededRoles.map((r) => ({
                name: r.name as "ADMIN" | "PROJECT_MANAGER" | "EMPLOYEE",
                permissionGroup: { id: r.permissionGroup.id },
            }))
        );

        // Seed users and employees
        await seedUsers();

        console.log("🎉 Database seeding completed!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the seeding process
seed();