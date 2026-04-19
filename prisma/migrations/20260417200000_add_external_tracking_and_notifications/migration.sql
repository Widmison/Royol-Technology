-- Client third-party tracking + in-app notifications (staff + clients)

-- CreateEnum
CREATE TYPE "ExternalTrackingStatus" AS ENUM ('PENDING_REVIEW', 'LINKED', 'NEEDS_INFO', 'CLOSED');

-- CreateTable
CREATE TABLE "ClientExternalTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeLabel" TEXT,
    "carrier" TEXT,
    "trackingNumber" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ExternalTrackingStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "linkedPackageId" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientExternalTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "forStaff" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientExternalTracking_linkedPackageId_key" ON "ClientExternalTracking"("linkedPackageId");

-- CreateIndex
CREATE INDEX "ClientExternalTracking_userId_idx" ON "ClientExternalTracking"("userId");

-- CreateIndex
CREATE INDEX "ClientExternalTracking_status_idx" ON "ClientExternalTracking"("status");

-- CreateIndex
CREATE INDEX "AppNotification_userId_createdAt_idx" ON "AppNotification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AppNotification_forStaff_createdAt_idx" ON "AppNotification"("forStaff", "createdAt");

-- AddForeignKey
ALTER TABLE "ClientExternalTracking" ADD CONSTRAINT "ClientExternalTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientExternalTracking" ADD CONSTRAINT "ClientExternalTracking_linkedPackageId_fkey" FOREIGN KEY ("linkedPackageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
