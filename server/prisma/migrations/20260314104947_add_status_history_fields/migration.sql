/*
  Warnings:

  - You are about to drop the column `userId` on the `BookingStatusHistory` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED', 'BONUS');

-- CreateEnum
CREATE TYPE "BookingFrequency" AS ENUM ('ONE_TIME', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "FraudAlertType" AS ENUM ('FAKE_REVIEW', 'NO_SHOW_GPS', 'SUSPICIOUS_VELOCITY', 'PAYMENT_CHARGEBACK');

-- DropForeignKey
ALTER TABLE "BookingStatusHistory" DROP CONSTRAINT "BookingStatusHistory_userId_fkey";

-- DropIndex
DROP INDEX "BookingStatusHistory_userId_idx";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "frequency" "BookingFrequency" NOT NULL DEFAULT 'ONE_TIME';

-- AlterTable
ALTER TABLE "BookingStatusHistory" DROP COLUMN "userId",
ADD COLUMN     "changedBy" INTEGER,
ADD COLUMN     "fromStatus" "BookingStatus",
ADD COLUMN     "toStatus" "BookingStatus";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "reviewerIp" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityService" (
    "cityId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "basePrice" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CityService_pkey" PRIMARY KEY ("cityId","serviceId")
);

-- CreateTable
CREATE TABLE "FavoriteWorker" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "workerProfileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyPoints" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lifetime" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyPoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "type" "LoyaltyTransactionType" NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrbanProPlusSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrbanProPlusSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "initialValue" DECIMAL(10,2) NOT NULL,
    "senderName" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "message" TEXT,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dauCount" INTEGER NOT NULL DEFAULT 0,
    "mauCount" INTEGER NOT NULL DEFAULT 0,
    "userList" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudAlert" (
    "id" SERIAL NOT NULL,
    "type" "FraudAlertType" NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "description" TEXT NOT NULL,
    "bookingId" INTEGER,
    "userId" INTEGER,
    "data" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "FavoriteWorker_userId_idx" ON "FavoriteWorker"("userId");

-- CreateIndex
CREATE INDEX "FavoriteWorker_workerProfileId_idx" ON "FavoriteWorker"("workerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteWorker_userId_workerProfileId_key" ON "FavoriteWorker"("userId", "workerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyPoints_userId_key" ON "LoyaltyPoints"("userId");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_userId_idx" ON "LoyaltyTransaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UrbanProPlusSubscription_userId_key" ON "UrbanProPlusSubscription"("userId");

-- CreateIndex
CREATE INDEX "UrbanProPlusSubscription_userId_idx" ON "UrbanProPlusSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_code_idx" ON "GiftCard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_date_key" ON "DailyActivity"("date");

-- CreateIndex
CREATE INDEX "FraudAlert_type_idx" ON "FraudAlert"("type");

-- CreateIndex
CREATE INDEX "FraudAlert_userId_idx" ON "FraudAlert"("userId");

-- CreateIndex
CREATE INDEX "BookingStatusHistory_changedBy_idx" ON "BookingStatusHistory"("changedBy");

-- AddForeignKey
ALTER TABLE "CityService" ADD CONSTRAINT "CityService_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityService" ADD CONSTRAINT "CityService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteWorker" ADD CONSTRAINT "FavoriteWorker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteWorker" ADD CONSTRAINT "FavoriteWorker_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyPoints" ADD CONSTRAINT "LoyaltyPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrbanProPlusSubscription" ADD CONSTRAINT "UrbanProPlusSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
