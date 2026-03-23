-- CreateEnum
CREATE TYPE "WorkerPayoutMethod" AS ENUM ('BANK', 'UPI', 'LINKED_ACCOUNT');

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "payoutMethod" "WorkerPayoutMethod" NOT NULL DEFAULT 'BANK',
ADD COLUMN     "upiId" TEXT;
