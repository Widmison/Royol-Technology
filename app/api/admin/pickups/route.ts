import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";
import { canPerformStaffCapability } from "@/lib/staffAccess";

export async function GET() {
  const adminOrRes = await requireAdminApiUser();
  if (adminOrRes instanceof NextResponse) return adminOrRes;
  if (!canPerformStaffCapability(adminOrRes, "pickups:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pickupRequest = (
    prisma as unknown as {
      pickupRequest: { findMany: (args: unknown) => Promise<unknown[]> };
    }
  ).pickupRequest;
  const rows = await pickupRequest.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ requests: rows });
}
