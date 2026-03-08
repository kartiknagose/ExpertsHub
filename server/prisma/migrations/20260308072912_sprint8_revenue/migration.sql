-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "offeredToWorkerId" INTEGER,
ADD COLUMN     "platformCommission" DECIMAL(65,30),
ADD COLUMN     "workerPayoutAmount" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "commissionRate" DOUBLE PRECISION DEFAULT 15.0;

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankIfsc" TEXT,
ADD COLUMN     "razorpayAccountId" TEXT,
ADD COLUMN     "walletBalance" DECIMAL(65,30) NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "Payout" (
    "id" SERIAL NOT NULL,
    "workerProfileId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "transferReference" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payout_workerProfileId_idx" ON "Payout"("workerProfileId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
