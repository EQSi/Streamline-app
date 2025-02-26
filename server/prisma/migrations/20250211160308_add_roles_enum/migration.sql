/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CompanyRating" DROP CONSTRAINT "CompanyRating_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_userId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeCertification" DROP CONSTRAINT "EmployeeCertification_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "JobEmployee" DROP CONSTRAINT "JobEmployee_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_employeeId_fkey";

-- AlterTable
ALTER TABLE "CompanyRating" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Employee_id_seq";

-- AlterTable
ALTER TABLE "EmployeeCertification" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "JobEmployee" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TimeEntry" ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ALTER COLUMN "approvedById" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCertification" ADD CONSTRAINT "EmployeeCertification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobEmployee" ADD CONSTRAINT "JobEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRating" ADD CONSTRAINT "CompanyRating_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
