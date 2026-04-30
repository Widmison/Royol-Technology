import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";
import { canPerformStaffCapability } from "@/lib/staffAccess";
import { allocateMexTrackingId } from "@/lib/trackingId";

type PickupStatus = "PENDING" | "PRICE_SENT" | "CONFIRMED" | "PICKED_UP" | "CANCELLED";
const ALLOWED_STATUSES = new Set<PickupStatus>(["PENDING", "PRICE_SENT", "CONFIRMED", "PICKED_UP", "CANCELLED"]);

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminOrRes = await requireAdminApiUser();
  if (adminOrRes instanceof NextResponse) return adminOrRes;
  if (!canPerformStaffCapability(adminOrRes, "pickups:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing pickup request id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const statusRaw = typeof body.status === "string" ? body.status.trim().toUpperCase() : "";
  const adminNote = typeof body.adminNote === "string" ? body.adminNote.trim().slice(0, 2000) : undefined;

  const overrideRaw = body.adminOverrideTotalAmount;
  const finalRaw = body.finalQuotedAmount;
  const maybeOverride =
    overrideRaw === undefined || overrideRaw === null || `${overrideRaw}`.trim() === ""
      ? undefined
      : Number(overrideRaw);
  const maybeFinal =
    finalRaw === undefined || finalRaw === null || `${finalRaw}`.trim() === ""
      ? undefined
      : Number(finalRaw);

  const data: {
    status?: "PENDING" | "PRICE_SENT" | "CONFIRMED" | "PICKED_UP" | "CANCELLED";
    adminNote?: string | null;
    adminOverrideTotalAmount?: number | null;
    finalQuotedAmount?: number | null;
  } = {};

  if (statusRaw) {
    if (!ALLOWED_STATUSES.has(statusRaw as PickupStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = statusRaw as PickupStatus;
  }
  if (adminNote !== undefined) data.adminNote = adminNote || null;
  if (maybeOverride !== undefined) {
    if (!Number.isFinite(maybeOverride) || maybeOverride < 0) {
      return NextResponse.json({ error: "Invalid override amount." }, { status: 400 });
    }
    data.adminOverrideTotalAmount = Math.round(maybeOverride * 100) / 100;
    if (maybeFinal === undefined) {
      data.finalQuotedAmount = data.adminOverrideTotalAmount;
    }
  }
  if (maybeFinal !== undefined) {
    if (!Number.isFinite(maybeFinal) || maybeFinal < 0) {
      return NextResponse.json({ error: "Invalid final quoted amount." }, { status: 400 });
    }
    data.finalQuotedAmount = Math.round(maybeFinal * 100) / 100;
  }

  const pickupRequest = (
    prisma as unknown as {
      pickupRequest: {
        update: (args: unknown) => Promise<unknown>;
        findUnique: (args: unknown) => Promise<{
          id: string;
          name: string;
          phone: string;
          address: string;
          city: string | null;
          state: string | null;
          zipCode: string | null;
          clientId: string | null;
          linkedShipmentRequestId: string | null;
          status: string;
        } | null>;
      };
    }
  ).pickupRequest;

  const current = await pickupRequest.findUnique({
    where: { id },
  });
  if (!current) {
    return NextResponse.json({ error: "Pickup request not found." }, { status: 404 });
  }

  const movingToPickedUp = data.status === "PICKED_UP" && !current.linkedShipmentRequestId;

  let updated: unknown;
  if (movingToPickedUp) {
    updated = await prisma.$transaction(async (tx) => {
      const [firstName, ...rest] = current.name.trim().split(/\s+/);
      const lastName = rest.join(" ");

      const request = await tx.shipmentRequest.create({
        data: {
          clientId: current.clientId ?? undefined,
          firstName: firstName || current.name,
          lastName: lastName || "Client",
          phone: current.phone || "—",
          departure: "Miami Warehouse",
          category: "Pickup Request",
          description: `Pickup completed. Address: ${current.address}`,
          shippingMethod: "Ground Shipping",
          destinationCountry: "HT",
          address: current.address || "—",
          state: current.state || "—",
          city: current.city || "—",
          zipCode: current.zipCode || "33191",
          status: "RECEIVED_WEIGHING",
        },
      });

      const trackingId = await allocateMexTrackingId(tx);
      await tx.package.create({
        data: {
          trackingId,
          requestId: request.id,
          status: "RECEIVED_USA_WAREHOUSE",
          events: {
            create: {
              status: "RECEIVED_USA_WAREHOUSE",
              location: "Miami Warehouse Pickup Intake",
              description: "Pickup completed and intake created. Package entered standard MEX509 tracking.",
            },
          },
        },
      });

      return tx.pickupRequest.update({
        where: { id },
        data: {
          ...data,
          linkedShipmentRequestId: request.id,
        },
      });
    });
  } else {
    updated = await pickupRequest.update({
      where: { id },
      data,
    });
  }

  return NextResponse.json({ request: updated });
}
