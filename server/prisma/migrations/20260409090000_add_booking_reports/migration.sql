-- CreateEnum
CREATE TYPE "BookingReportCategory" AS ENUM ('SAFETY', 'HARASSMENT', 'NO_SHOW', 'PROPERTY_DAMAGE', 'PAYMENT_DISPUTE', 'MISCONDUCT', 'FRAUD', 'OTHER');

-- CreateEnum
CREATE TYPE "BookingReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "BookingReportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "BookingReport" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reportedUserId" INTEGER NOT NULL,
    "reportedRole" "Role" NOT NULL,
    "category" "BookingReportCategory" NOT NULL,
    "status" "BookingReportStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "BookingReportPriority" NOT NULL DEFAULT 'MEDIUM',
    "details" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "adminNotes" TEXT,
    "reviewedById" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingReport_bookingId_idx" ON "BookingReport"("bookingId");

-- CreateIndex
CREATE INDEX "BookingReport_reporterId_idx" ON "BookingReport"("reporterId");

-- CreateIndex
CREATE INDEX "BookingReport_reportedUserId_idx" ON "BookingReport"("reportedUserId");

-- CreateIndex
CREATE INDEX "BookingReport_status_idx" ON "BookingReport"("status");

-- CreateIndex
CREATE INDEX "BookingReport_priority_idx" ON "BookingReport"("priority");

-- CreateIndex
CREATE INDEX "BookingReport_createdAt_idx" ON "BookingReport"("createdAt");

-- AddForeignKey
ALTER TABLE "BookingReport" ADD CONSTRAINT "BookingReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingReport" ADD CONSTRAINT "BookingReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingReport" ADD CONSTRAINT "BookingReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingReport" ADD CONSTRAINT "BookingReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;