-- CreateEnum
CREATE TYPE "WalletTopupStatus" AS ENUM ('CREATED', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "WalletTopupOrder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "WalletTopupStatus" NOT NULL DEFAULT 'CREATED',
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "failureReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTopupOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTopupOrder_razorpayOrderId_key" ON "WalletTopupOrder"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTopupOrder_razorpayPaymentId_key" ON "WalletTopupOrder"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "WalletTopupOrder_userId_status_idx" ON "WalletTopupOrder"("userId", "status");

-- CreateIndex
CREATE INDEX "WalletTopupOrder_createdAt_idx" ON "WalletTopupOrder"("createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "WalletTopupOrder" ADD CONSTRAINT "WalletTopupOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
