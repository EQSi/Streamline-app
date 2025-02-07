/*
  Warnings:

  - You are about to drop the column `email` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Division` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Location` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Division` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `CompanyRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Division` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street1` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street2` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RatingCategory" AS ENUM ('QUALITY', 'RELIABILITY', 'COMMUNICATION', 'PRICING', 'OVERALL');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_locationId_fkey";

-- DropIndex
DROP INDEX "Division_name_idx";

-- DropIndex
DROP INDEX "Location_city_idx";

-- DropIndex
DROP INDEX "Location_name_idx";

-- DropIndex
DROP INDEX "Location_state_idx";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "email",
DROP COLUMN "locationId",
ADD COLUMN     "hasDivisions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "CompanyRating" ADD COLUMN     "category" "RatingCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "divisionId" INTEGER;

-- AlterTable
ALTER TABLE "Division" DROP COLUMN "description",
ADD COLUMN     "locationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "address",
DROP COLUMN "name",
ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "street1" VARCHAR(200) NOT NULL,
ADD COLUMN     "street2" VARCHAR(200) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Division_locationId_idx" ON "Division"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_companyId_key" ON "Division"("name", "companyId");

-- CreateIndex
CREATE INDEX "Location_companyId_idx" ON "Location"("companyId");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;
