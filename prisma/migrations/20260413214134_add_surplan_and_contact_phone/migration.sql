-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "surPlan" BOOLEAN NOT NULL DEFAULT false;
