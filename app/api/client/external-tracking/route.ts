import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";
import { pushStaffNotification, pushUserNotification } from "@/lib/pushAppNotification";
import { sendExternalTrackingSubmittedEmails } from "@/lib/sendNotificationEmails";
import { getPortalSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

function prismaErrorCode(e: unknown): string | undefined {
  return e instanceof Prisma.PrismaClientKnownRequestError ? e.code : undefined;
}

/** Alerts + email must not fail the HTTP response after the row is saved. */
async function externalTrackingSideEffects(
  user: { id: string; email: string; firstName: string | null; lastName: string | null },
  entry: { id: string },
  trackingNumber: string,
  storeLabel: string | null
) {
  const clientName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

  await pushStaffNotification({
    type: "EXTERNAL_TRACKING_NEW",
    title: `New external tracking · ${trackingNumber}`,
    body: `${clientName} (${user.email}) added ${trackingNumber}${storeLabel ? ` — ${storeLabel}` : ""}.`,
    link: `/admin/external-tracking?id=${entry.id}`,
  });

  await pushUserNotification(user.id, {
    type: "EXTERNAL_TRACKING_CONFIRM",
    title: "External tracking saved",
    body: `We received “${trackingNumber}”. Our team will review and may link it to your MEX509 shipments.`,
    link: "/dashboard?tab=external",
  });

  const base = getPortalSiteUrl();
  await sendExternalTrackingSubmittedEmails({
    clientEmail: user.email,
    clientName,
    trackingNumber,
    storeLabel,
    dashboardUrl: base,
  });
}

export async function GET() {
  const userOrRes = await requireClientApiUser();
  if (userOrRes instanceof NextResponse) return userOrRes;

  try {
    /** Avoid nested `include` — some pg poolers / PrismaPg setups error on relation loads; two plain queries are safer. */
    const rows = await prisma.clientExternalTracking.findMany({
      where: { userId: userOrRes.id },
      orderBy: { createdAt: "desc" },
    });

    const pkgIds = [...new Set(rows.map((r) => r.linkedPackageId).filter((id): id is string => Boolean(id)))];
    let pkgById = new Map<string, { trackingId: string; status: string }>();
    if (pkgIds.length > 0) {
      try {
        const pkgs = await prisma.package.findMany({
          where: { id: { in: pkgIds } },
          select: { id: true, trackingId: true, status: true },
        });
        pkgById = new Map(pkgs.map((p) => [p.id, { trackingId: p.trackingId, status: String(p.status) }]));
      } catch (pkgErr) {
        console.warn("[external-tracking GET] package lookup skipped:", pkgErr);
      }
    }

    const entries = rows.map((r) => ({
      ...r,
      linkedPackage: r.linkedPackageId ? pkgById.get(r.linkedPackageId) ?? null : null,
    }));

    return NextResponse.json({ entries });
  } catch (e) {
    console.error("[external-tracking GET]", e);
    const msg = e instanceof Error ? e.message : String(e);
    const missingRelation = /does not exist/i.test(msg) && /relation|table/i.test(msg);

    if (missingRelation) {
      return NextResponse.json(
        {
          error:
            "Tracking list isn’t available yet—the server database needs the latest update. Contact MEX509 support or your developer to apply migrations (prisma migrate deploy).",
          code: "DB_SCHEMA",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Could not load your tracking list right now. If this keeps happening, sign out and sign in again, or contact support.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const userOrRes = await requireClientApiUser();
  if (userOrRes instanceof NextResponse) return userOrRes;

  const body = await req.json().catch(() => ({}));
  const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  const storeLabel = typeof body.storeLabel === "string" ? body.storeLabel.trim().slice(0, 120) : null;
  const carrier = typeof body.carrier === "string" ? body.carrier.trim().slice(0, 120) : null;
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null;

  if (!trackingNumber || trackingNumber.length < 3) {
    return NextResponse.json({ error: "Enter a valid tracking or order number (at least 3 characters)." }, { status: 400 });
  }

  /** Case-insensitive duplicate check without `mode: insensitive` (some drivers/poolers misbehave). Never block save if check fails. */
  try {
    const existing = await prisma.clientExternalTracking.findMany({
      where: { userId: userOrRes.id },
      select: { trackingNumber: true },
    });
    const tn = trackingNumber.toLowerCase();
    const dup = existing.some((r) => r.trackingNumber.trim().toLowerCase() === tn);
    if (dup) {
      return NextResponse.json(
        { error: "You already sent us this tracking number. If something changed, add a note and contact support." },
        { status: 409 }
      );
    }
  } catch (e) {
    console.warn("[external-tracking] duplicate check skipped; proceeding with save:", e);
  }

  let entry;
  try {
    entry = await prisma.clientExternalTracking.create({
      data: {
        userId: userOrRes.id,
        trackingNumber,
        storeLabel,
        carrier,
        notes,
      },
    });
  } catch (e) {
    console.error("[external-tracking create]", e);
    const code = prismaErrorCode(e);
    const msg = e instanceof Error ? e.message : String(e);
    const missingRelation = /does not exist/i.test(msg) && /relation|table/i.test(msg);

    if (code === "P2002") {
      return NextResponse.json({ error: "This tracking number is already saved." }, { status: 409 });
    }
    if (code === "P2003") {
      return NextResponse.json(
        { error: "Your session is out of date. Sign out and sign in again, then try saving." },
        { status: 401 }
      );
    }
    if (missingRelation) {
      return NextResponse.json(
        {
          error:
            "The tracking feature is not fully set up on the server yet. Ask MEX509 to run the latest database migration.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Could not save your tracking number. Try again in a moment or contact support." },
      { status: 500 }
    );
  }

  void externalTrackingSideEffects(userOrRes, entry, trackingNumber, storeLabel).catch((err) => {
    console.error("[external-tracking side effects]", err);
  });

  return NextResponse.json({ entry });
}
