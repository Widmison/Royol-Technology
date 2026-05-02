import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";

/** Staff inbox — newest first. Poll from admin UI for near-real-time updates. */
export async function GET() {
  try {
    const adminOrRes = await requireAdminApiUser();
    if (adminOrRes instanceof NextResponse) return adminOrRes;

    const [notifications, unreadCount] = await Promise.all([
      prisma.appNotification.findMany({
        where: { forStaff: true },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.appNotification.count({
        where: { forStaff: true, readAt: null },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load notifications." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const adminOrRes = await requireAdminApiUser();
    if (adminOrRes instanceof NextResponse) return adminOrRes;

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : [];

    if (body.markAllRead) {
      await prisma.appNotification.updateMany({
        where: { forStaff: true, readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.markUnread) {
      if (ids.length === 0) {
        return NextResponse.json({ error: "No ids provided." }, { status: 400 });
      }
      await prisma.appNotification.updateMany({
        where: {
          forStaff: true,
          id: { in: ids },
        },
        data: { readAt: null },
      });
      return NextResponse.json({ ok: true });
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "No ids provided." }, { status: 400 });
    }

    await prisma.appNotification.updateMany({
      where: {
        forStaff: true,
        id: { in: ids },
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}
