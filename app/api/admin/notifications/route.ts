import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";

/** Staff inbox — newest first. Poll from admin UI for near-real-time updates. */
export async function GET() {
  try {
    const adminOrRes = await requireAdminApiUser();
    if (adminOrRes instanceof NextResponse) return adminOrRes;

    const notifications = await prisma.appNotification.findMany({
      where: { forStaff: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    return NextResponse.json({ notifications });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load notifications." }, { status: 500 });
  }
}
