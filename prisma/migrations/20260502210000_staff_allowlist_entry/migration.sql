-- CreateTable
CREATE TABLE "StaffAllowlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "staffRole" "AdminStaffRole" NOT NULL,
    "roleLabel" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAllowlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffAllowlistEntry_email_key" ON "StaffAllowlistEntry"("email");

CREATE INDEX "StaffAllowlistEntry_staffRole_idx" ON "StaffAllowlistEntry"("staffRole");

INSERT INTO "StaffAllowlistEntry" ("id", "email", "staffRole", "roleLabel", "createdAt", "updatedAt")
VALUES
  ('allow_seed_webdev', 'widmisonfrancois@royoltechnology.com', 'WEB_DEV', 'Web Dev — full access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('allow_seed_admin', 'info@mex509.com', 'ADMIN_TEAM', 'Admin team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
