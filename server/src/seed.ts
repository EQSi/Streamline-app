import { PrismaClient } from "@prisma/client";
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
 * Uses `connectOrCreate` to ensure that the permission group exists.
 */
async function seedRoles() {
  console.log("🌱 Seeding roles...");

  const roles = ["ADMIN", "PROJECT_MANAGER", "EMPLOYEE"];

  const createdRoles = await Promise.all(
    roles.map(async (role) => {
      return prisma.role.upsert({
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
    })
  );

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
  async function assignPermissions(groupId: string, permissions: any[]) {
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
 * Main function to seed database
 */
async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Ensure database tables are set up
    await createTables();

    // Seed roles
    const roles = await seedRoles();

    // Seed permissions
    await seedPermissions();

    // Assign permissions to roles
    await assignPermissionsToRoles(roles.map(r => ({
      name: r.name as "ADMIN" | "PROJECT_MANAGER" | "EMPLOYEE",
      permissionGroup: { id: r.permissionGroup.id }
    })));

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seeding process
seed();
