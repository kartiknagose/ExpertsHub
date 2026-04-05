-- Repair migration for legacy table naming drift.
-- Handles three cases safely:
-- 1) Legacy table exists -> rename to ExpertsHubPlusSubscription
-- 2) Table missing entirely -> create ExpertsHubPlusSubscription
-- 3) Correct table already exists -> no-op

DO $$
BEGIN
  IF to_regclass('public."ExpertsHubPlusSubscription"') IS NULL THEN
    IF to_regclass('public."UrbanProPlusSubscription"') IS NOT NULL THEN
      ALTER TABLE "UrbanProPlusSubscription" RENAME TO "ExpertsHubPlusSubscription";
    ELSE
      CREATE TABLE "ExpertsHubPlusSubscription" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "plan" TEXT NOT NULL,
        "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endAt" TIMESTAMP(3),
        "cancelAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ExpertsHubPlusSubscription_pkey" PRIMARY KEY ("id")
      );
    END IF;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "ExpertsHubPlusSubscription_userId_key"
ON "ExpertsHubPlusSubscription"("userId");

CREATE INDEX IF NOT EXISTS "ExpertsHubPlusSubscription_userId_idx"
ON "ExpertsHubPlusSubscription"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE t.relname = 'ExpertsHubPlusSubscription'
      AND c.contype = 'f'
      AND a.attname = 'userId'
  ) THEN
    ALTER TABLE "ExpertsHubPlusSubscription"
      ADD CONSTRAINT "ExpertsHubPlusSubscription_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
