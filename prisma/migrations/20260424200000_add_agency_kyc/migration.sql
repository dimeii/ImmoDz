-- CreateEnum
CREATE TYPE "AgencyKycStatus" AS ENUM ('NONE', 'PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "kycDocumentPublicId" TEXT,
ADD COLUMN     "kycDocumentUrl" TEXT,
ADD COLUMN     "kycRejectionReason" TEXT,
ADD COLUMN     "kycReviewedAt" TIMESTAMP(3),
ADD COLUMN     "kycReviewedBy" TEXT,
ADD COLUMN     "kycStatus" "AgencyKycStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "kycSubmittedAt" TIMESTAMP(3);
