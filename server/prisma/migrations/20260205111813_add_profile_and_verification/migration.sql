-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO');

-- CreateEnum
CREATE TYPE "VerificationDocumentType" AS ENUM ('ID_PROOF', 'EXPERIENCE_LETTER', 'CERTIFICATION', 'PORTFOLIO', 'ADDRESS_PROOF');

-- CreateEnum
CREATE TYPE "VerificationMediaType" AS ENUM ('VIDEO_INTRO', 'PORTFOLIO_IMAGE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profilePhotoUrl" TEXT;

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "isProbation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationScore" INTEGER;

-- CreateTable
CREATE TABLE "WorkerVerificationApplication" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "WorkerVerificationApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerVerificationDocument" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "type" "VerificationDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerVerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerVerificationReference" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerVerificationReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerVerificationMedia" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "type" "VerificationMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerVerificationMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkerVerificationApplication_userId_idx" ON "WorkerVerificationApplication"("userId");

-- CreateIndex
CREATE INDEX "WorkerVerificationApplication_status_idx" ON "WorkerVerificationApplication"("status");

-- CreateIndex
CREATE INDEX "WorkerVerificationDocument_applicationId_idx" ON "WorkerVerificationDocument"("applicationId");

-- CreateIndex
CREATE INDEX "WorkerVerificationDocument_type_idx" ON "WorkerVerificationDocument"("type");

-- CreateIndex
CREATE INDEX "WorkerVerificationReference_applicationId_idx" ON "WorkerVerificationReference"("applicationId");

-- CreateIndex
CREATE INDEX "WorkerVerificationReference_phone_idx" ON "WorkerVerificationReference"("phone");

-- CreateIndex
CREATE INDEX "WorkerVerificationMedia_applicationId_idx" ON "WorkerVerificationMedia"("applicationId");

-- CreateIndex
CREATE INDEX "WorkerVerificationMedia_type_idx" ON "WorkerVerificationMedia"("type");

-- AddForeignKey
ALTER TABLE "WorkerVerificationApplication" ADD CONSTRAINT "WorkerVerificationApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerVerificationDocument" ADD CONSTRAINT "WorkerVerificationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WorkerVerificationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerVerificationReference" ADD CONSTRAINT "WorkerVerificationReference_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WorkerVerificationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerVerificationMedia" ADD CONSTRAINT "WorkerVerificationMedia_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WorkerVerificationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
