/*
  Warnings:

  - You are about to drop the column `roles` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "roles",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "permissionGroupId" UUID NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionGroup" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "PermissionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionOnGroup" (
    "id" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "permissionGroupId" UUID NOT NULL,

    CONSTRAINT "PermissionOnGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionGroup_name_key" ON "PermissionGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_roleId_key" ON "User"("roleId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_permissionGroupId_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES "PermissionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionOnGroup" ADD CONSTRAINT "PermissionOnGroup_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionOnGroup" ADD CONSTRAINT "PermissionOnGroup_permissionGroupId_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES "PermissionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
