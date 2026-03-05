-- AlterTable: Add estimatedDuration (nullable Int, in minutes) to Booking
ALTER TABLE "Booking" ADD COLUMN "estimatedDuration" INTEGER;
