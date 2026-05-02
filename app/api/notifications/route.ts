import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";

export async function GET() {
  try {
    const userOrRes = await requireClientApiUser();
    if (userOrRes instanceof NextResponse) return userOrRes;

    const [notifications, unreadCount] = await Promise.all([
      prisma.appNotification.findMany({
        where: { userId: userOrRes.id, forStaff: false },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
      prisma.appNotification.count({
        where: { userId: userOrRes.id, forStaff: false, readAt: null },
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
    const userOrRes = await requireClientApiUser();
    if (userOrRes instanceof NextResponse) return userOrRes;

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : [];

    if (body.markAllRead) {
      await prisma.appNotification.updateMany({
        where: { userId: userOrRes.id, readAt: null },
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
          userId: userOrRes.id,
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
        userId: userOrRes.id,
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
