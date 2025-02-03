-- AlterTable
ALTER TABLE "User" ALTER COLUMN "googleId" DROP NOT NULL,
ALTER COLUMN "googleAccessToken" DROP NOT NULL,
ALTER COLUMN "googleRefreshToken" DROP NOT NULL;
