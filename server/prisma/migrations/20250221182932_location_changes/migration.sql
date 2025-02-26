/*
  Warnings:

  - You are about to drop the column `locationId` on the `Division` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Location` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Division" DROP CONSTRAINT "Division_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_companyId_fkey";

-- DropIndex
DROP INDEX "Division_locationId_idx";

-- DropIndex
DROP INDEX "Location_companyId_idx";

-- AlterTable
ALTER TABLE "Division" DROP COLUMN "locationId";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "companyId";

-- CreateTable
CREATE TABLE "LocationAssignment" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "divisionId" INTEGER,

    CONSTRAINT "LocationAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationAssignment_locationId_idx" ON "LocationAssignment"("locationId");

-- CreateIndex
CREATE INDEX "LocationAssignment_companyId_idx" ON "LocationAssignment"("companyId");

-- CreateIndex
CREATE INDEX "LocationAssignment_divisionId_idx" ON "LocationAssignment"("divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationAssignment_locationId_companyId_divisionId_key" ON "LocationAssignment"("locationId", "companyId", "divisionId");

-- AddForeignKey
ALTER TABLE "LocationAssignment" ADD CONSTRAINT "LocationAssignment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationAssignment" ADD CONSTRAINT "LocationAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationAssignment" ADD CONSTRAINT "LocationAssignment_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;
