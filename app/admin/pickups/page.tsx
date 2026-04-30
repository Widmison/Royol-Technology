import { prisma } from "@/lib/prisma";
import { redirectToAdminLogin } from "@/lib/adminLoginRedirect";
import { getAdminSessionUser } from "@/lib/serverSession";
import AdminPickupRequestsBoard, { type PickupRow } from "@/components/admin/AdminPickupRequestsBoard";

export const dynamic = "force-dynamic";

export default async function AdminPickupsPage() {
  const admin = await getAdminSessionUser();
  if (!admin) {
    await redirectToAdminLogin();
  }

  const pickupRequest = (
    prisma as unknown as {
      pickupRequest: { findMany: (args: unknown) => Promise<unknown[]> };
    }
  ).pickupRequest;
  const rows = (await pickupRequest.findMany({
    orderBy: [{ createdAt: "desc" }],
  })) as PickupRow[];

  return <AdminPickupRequestsBoard initialRows={rows} />;
}
