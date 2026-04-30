-- Reduce external tracking statuses to PENDING_REVIEW + PACKED_RECEIVED

CREATE TYPE "ExternalTrackingStatus_new" AS ENUM ('PENDING_REVIEW', 'PACKED_RECEIVED');

ALTER TABLE "ClientExternalTracking" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "ClientExternalTracking" ALTER COLUMN "status" TYPE "ExternalTrackingStatus_new" USING (
  CASE "status"::text
    WHEN 'PENDING_REVIEW' THEN 'PENDING_REVIEW'::"ExternalTrackingStatus_new"
    WHEN 'LINKED' THEN 'PACKED_RECEIVED'::"ExternalTrackingStatus_new"
    WHEN 'NEEDS_INFO' THEN 'PENDING_REVIEW'::"ExternalTrackingStatus_new"
    WHEN 'CLOSED' THEN 'PACKED_RECEIVED'::"ExternalTrackingStatus_new"
    ELSE 'PENDING_REVIEW'::"ExternalTrackingStatus_new"
  END
);

DROP TYPE "ExternalTrackingStatus";
ALTER TYPE "ExternalTrackingStatus_new" RENAME TO "ExternalTrackingStatus";

ALTER TABLE "ClientExternalTracking" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW'::"ExternalTrackingStatus";
