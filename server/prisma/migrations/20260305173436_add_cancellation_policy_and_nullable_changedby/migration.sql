-- DropForeignKey
ALTER TABLE "BookingStatusHistory" DROP CONSTRAINT "BookingStatusHistory_changedBy_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancellationPenaltyPercent" INTEGER;

-- AlterTable
ALTER TABLE "BookingStatusHistory" ALTER COLUMN "changedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
