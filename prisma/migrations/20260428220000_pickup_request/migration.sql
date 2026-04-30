-- CreateEnum
CREATE TYPE "PickupRequestStatus" AS ENUM ('PENDING', 'PRICE_SENT', 'CONFIRMED', 'PICKED_UP', 'CANCELLED');

-- CreateTable
CREATE TABLE "PickupRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "packagePhotoUrl" TEXT,
    "originLabel" TEXT,
    "destinationLabel" TEXT,
    "distanceMiles" DOUBLE PRECISION,
    "pricePerMile" DOUBLE PRECISION,
    "autoTotalAmount" DOUBLE PRECISION,
    "adminOverrideTotalAmount" DOUBLE PRECISION,
    "finalQuotedAmount" DOUBLE PRECISION,
    "status" "PickupRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "linkedShipmentRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PickupRequest_linkedShipmentRequestId_key" ON "PickupRequest"("linkedShipmentRequestId");

-- CreateIndex
CREATE INDEX "PickupRequest_clientId_idx" ON "PickupRequest"("clientId");

-- CreateIndex
CREATE INDEX "PickupRequest_status_createdAt_idx" ON "PickupRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_linkedShipmentRequestId_fkey" FOREIGN KEY ("linkedShipmentRequestId") REFERENCES "ShipmentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
