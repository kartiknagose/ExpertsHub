/*
  Warnings:

  - You are about to drop the column `workerId` on the `Booking` table. All the data will be lost.
  - You are about to drop the `bookingsWorker` relation on the `User` model. This will be removed. All the data will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_workerId_fkey";

-- DropIndex
DROP INDEX "Booking_workerId_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "workerId",
ADD COLUMN "workerProfileId" INTEGER;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Booking_workerProfileId_idx" ON "Booking"("workerProfileId");
