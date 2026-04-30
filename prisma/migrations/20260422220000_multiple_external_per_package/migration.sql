-- Allow several store/marketplace tracking rows to link to the same MEX509 package.
DROP INDEX IF EXISTS "ClientExternalTracking_linkedPackageId_key";

CREATE INDEX IF NOT EXISTS "ClientExternalTracking_linkedPackageId_idx" ON "ClientExternalTracking"("linkedPackageId");
