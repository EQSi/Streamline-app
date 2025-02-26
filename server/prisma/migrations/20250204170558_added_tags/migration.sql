/*
  Warnings:

  - The values [Employee,Admin,ExternalUser] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The `position` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Position" AS ENUM ('ProjectManager', 'FieldManager', 'FieldTechnicianL1', 'FieldTechnicianL2', 'FieldTechnicianL3', 'OfficeStaff', 'Owner');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');
ALTER TABLE "User" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "roles" TYPE "Role_new" USING ("roles"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "roles" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "position",
ADD COLUMN     "position" "Position" NOT NULL DEFAULT 'ProjectManager';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
ALTER COLUMN "roles" SET DEFAULT 'EMPLOYEE';
