-- Migration: add_clerk_auth
-- Adds Clerk authentication support:
-- - clerkId: unique identifier from Clerk for each user
-- - passwordHash: made optional (Clerk manages passwords)

ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
