-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "agencyId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "specialtyTypes" "PropertyType"[] DEFAULT ARRAY[]::"PropertyType"[],
ADD COLUMN     "specialtyWilayas" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE UNIQUE INDEX "agencies_slug_key" ON "agencies"("slug");

-- CreateIndex
CREATE INDEX "listings_agencyId_idx" ON "listings"("agencyId");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
