import { NextResponse } from "next/server";
import type { Package, TrackingEvent, Invoice, ShipmentRequest } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";
import { shouldOmitClientTrackingEvent, stripManualAdminTrackingSuffix } from "@/lib/trackingClientTimeline";

type PackageWithRelations = Package & {
  request: ShipmentRequest & { invoice: Invoice | null };
  events: TrackingEvent[];
};

function serializePackageDetail(p: PackageWithRelations) {
  const events = p.events
    .filter((e) => !shouldOmitClientTrackingEvent(e.description))
    .map((e) => ({
      id: e.id,
      status: e.status,
      location: e.location,
      description: stripManualAdminTrackingSuffix(e.description) ?? e.description,
      date: e.date.toISOString(),
    }));

  return {
    trackingId: p.trackingId,
    status: p.status,
    shippingMethod: p.request.shippingMethod,
    departure: p.request.departure,
    invoice: p.request.invoice
      ? {
          id: p.request.invoice.id,
          status: p.request.invoice.status,
          totalAmount: p.request.invoice.totalAmount,
          actualWeightLbs: p.request.invoice.actualWeightLbs,
          paidVia: p.request.invoice.paidVia,
        }
      : null,
    events,
  };
}

/** Live tracking + full timeline for the logged-in client (poll from dashboard). Optional `?id=MEX…` to load one package you own. */
export async function GET(req: Request) {
  try {
    const userOrRes = await requireClientApiUser();
    if (userOrRes instanceof NextResponse) return userOrRes;

    const lookupId = new URL(req.url).searchParams.get("id")?.trim().toUpperCase();

    if (lookupId) {
      const p = await prisma.package.findUnique({
        where: { trackingId: lookupId },
        include: {
          request: { include: { invoice: true } },
          events: { orderBy: { date: "desc" }, take: 100 },
        },
      });

      if (!p) {
        return NextResponse.json({ error: "Tracking number not found. Check your ID and try again." }, { status: 404 });
      }
      if (p.request.clientId !== userOrRes.id) {
        return NextResponse.json(
          { error: "This tracking number is not linked to your account." },
          { status: 403 }
        );
      }

      return NextResponse.json({
        updatedAt: new Date().toISOString(),
        package: serializePackageDetail(p),
      });
    }

    const packages = await prisma.package.findMany({
      where: { request: { clientId: userOrRes.id } },
      include: {
        request: { include: { invoice: true } },
        events: { orderBy: { date: "desc" }, take: 100 },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      packages: packages.map((p) => ({
        id: p.id,
        updatedAt: p.updatedAt.toISOString(),
        route: `${p.request.departure} → Haiti`,
        ...serializePackageDetail(p),
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load tracking" }, { status: 500 });
  }
}
