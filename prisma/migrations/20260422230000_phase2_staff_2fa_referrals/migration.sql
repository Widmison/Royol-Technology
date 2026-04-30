-- Phase 2: STAFF role, admin TOTP fields, referral code + self-referral (referredBy)

ALTER TYPE "Role" ADD VALUE 'STAFF';

ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN "referredById" TEXT;

-- Existing clients: backfill unique referral codes (new signups will set via app)
UPDATE "User"
SET "referralCode" = 'MEX' || REPLACE("id", '-', '')
WHERE "role" = 'CLIENT' AND "referralCode" IS NULL;

CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

CREATE INDEX "User_referredById_idx" ON "User"("referredById");

ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
