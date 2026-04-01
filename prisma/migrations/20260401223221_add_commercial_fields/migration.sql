-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "hasElectricity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasFiber" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasGas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasStorefront" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasWater" BOOLEAN NOT NULL DEFAULT false;
