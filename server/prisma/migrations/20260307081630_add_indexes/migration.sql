/*
  Warnings:

  - You are about to drop the column `changedBy` on the `BookingStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `fromStatus` on the `BookingStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `toStatus` on the `BookingStatusHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookingStatusHistory" DROP CONSTRAINT "BookingStatusHistory_changedBy_fkey";

-- DropIndex
DROP INDEX "BookingStatusHistory_changedBy_idx";

-- AlterTable
ALTER TABLE "BookingStatusHistory" DROP COLUMN "changedBy",
DROP COLUMN "fromStatus",
DROP COLUMN "toStatus",
ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE INDEX "BookingStatusHistory_userId_idx" ON "BookingStatusHistory"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "WorkerService_serviceId_idx" ON "WorkerService"("serviceId");

-- AddForeignKey
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
