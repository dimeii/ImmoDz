-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "quartierId" TEXT;

-- CreateTable
CREATE TABLE "quartiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wilayaCode" INTEGER NOT NULL,

    CONSTRAINT "quartiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quartiers_wilayaCode_idx" ON "quartiers"("wilayaCode");

-- CreateIndex
CREATE UNIQUE INDEX "quartiers_name_wilayaCode_key" ON "quartiers"("name", "wilayaCode");

-- CreateIndex
CREATE INDEX "listings_quartierId_idx" ON "listings"("quartierId");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_quartierId_fkey" FOREIGN KEY ("quartierId") REFERENCES "quartiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quartiers" ADD CONSTRAINT "quartiers_wilayaCode_fkey" FOREIGN KEY ("wilayaCode") REFERENCES "wilayas"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
