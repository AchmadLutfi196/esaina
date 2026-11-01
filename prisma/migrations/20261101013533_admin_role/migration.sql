-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "identifier" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
