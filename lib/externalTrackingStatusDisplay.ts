/** Matches Prisma enum `ExternalTrackingStatus` */
export function externalTrackingStatusLabel(status: string): string {
  switch (status) {
    case "PENDING_REVIEW":
      return "Pending review";
    case "PACKED_RECEIVED":
      return "Packed received";
    default:
      return status.replace(/_/g, " ");
  }
}
