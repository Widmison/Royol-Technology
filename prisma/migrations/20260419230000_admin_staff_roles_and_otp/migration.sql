-- Admin staff roles, profile completion gate, OTP table for email sign-in

CREATE TYPE "AdminStaffRole" AS ENUM ('WEB_DEV', 'ADMIN_TEAM');

ALTER TABLE "User" ADD COLUMN "adminStaffRole" "AdminStaffRole";
ALTER TABLE "User" ADD COLUMN "adminProfileComplete" BOOLEAN NOT NULL DEFAULT true;

UPDATE "User"
SET "adminProfileComplete" = true
WHERE "role" = 'ADMIN';

CREATE TABLE "AdminLoginOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLoginOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminLoginOtp_email_idx" ON "AdminLoginOtp"("email");

UPDATE "User"
SET "adminStaffRole" = 'WEB_DEV'
WHERE LOWER("email") = 'widmisonfrancois@royoltechnology.com' AND "role" = 'ADMIN';

UPDATE "User"
SET "adminStaffRole" = 'ADMIN_TEAM'
WHERE LOWER("email") = 'info@mex509.com' AND "role" = 'ADMIN';
