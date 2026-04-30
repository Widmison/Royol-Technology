import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";
import { calculateFreightTotal } from "@/lib/freightRates";
import { allocateMexTrackingId } from "@/lib/trackingId";
import { canPerformStaffCapability } from "@/lib/staffAccess";

/**
 * Create an intake shipment + package + unpaid invoice for a client (admin only).
 */
export async function POST(req: Request) {
  try {
    const adminOrRes = await requireAdminApiUser();
    if (adminOrRes instanceof NextResponse) return adminOrRes;
    if (!canPerformStaffCapability(adminOrRes, "packages:intake-create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const clientId = body.clientId as string | undefined;
    const weightRaw = body.weightLbs;
    const shippingMethod = (body.shippingMethod as string)?.trim() || "Air Freight";
    const serviceFeeRaw = body.serviceFee;
    const priceOverrideRaw = body.priceOverride;
    const destinationCity = (body.destinationCity as string)?.trim() || "Port-au-Prince";
    const destCountryRaw = typeof body.destinationCountry === "string" ? body.destinationCountry.trim().toUpperCase() : "";
    const destinationCountry = destCountryRaw === "DO" ? "DO" : "HT";

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const weight =
      typeof weightRaw === "string" ? parseFloat(weightRaw) : Number(weightRaw);
    if (!Number.isFinite(weight) || weight <= 0) {
      return NextResponse.json({ error: "A valid weight in lbs is required." }, { status: 400 });
    }

    const client = await prisma.user.findFirst({
      where: { id: clientId, role: "CLIENT" },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const serviceFee =
      serviceFeeRaw === undefined || serviceFeeRaw === null || `${serviceFeeRaw}`.trim() === ""
        ? 0
        : Math.round((typeof serviceFeeRaw === "string" ? parseFloat(serviceFeeRaw) : Number(serviceFeeRaw)) * 100) /
          100;
    if (!Number.isFinite(serviceFee) || serviceFee < 0) {
      return NextResponse.json({ error: "Invalid service fee." }, { status: 400 });
    }

    const freight = calculateFreightTotal(weight, shippingMethod);
    let totalAmount = Math.round((freight + serviceFee) * 100) / 100;

    if (priceOverrideRaw !== undefined && priceOverrideRaw !== null && `${priceOverrideRaw}`.trim() !== "") {
      const override =
        typeof priceOverrideRaw === "string" ? parseFloat(priceOverrideRaw) : Number(priceOverrideRaw);
      if (Number.isFinite(override) && override >= 0) {
        totalAmount = Math.round(override * 100) / 100;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.shipmentRequest.create({
        data: {
          clientId: client.id,
          firstName: client.firstName || "—",
          lastName: client.lastName || "—",
          phone: client.phone || "—",
          departure: "Miami Warehouse",
          category: "Admin intake",
          description: "Package added by admin — invoice sent to client portal.",
          shippingMethod,
          destinationCountry,
          address: client.address?.trim() || "—",
          state: client.state?.trim() || "—",
          city: destinationCity,
          zipCode: client.zipCode?.trim() || "—",
          status: "PENDING_DROPOFF",
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
              location: "1962 NW 82nd Ave Doral, FL 33191",
              description:
                "Received in USA Warehouse — Colis resevwa nan depo USA ✅ (Admin intake — invoice pending payment)",
            },
          },
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          requestId: request.id,
          actualWeightLbs: weight,
          totalAmount,
          status: "UNPAID",
        },
      });

      await tx.shipmentRequest.update({
        where: { id: request.id },
        data: { status: "INVOICED" },
      });

      return { request, invoice, trackingId };
    });

    return NextResponse.json(
      {
        success: true,
        requestId: result.request.id,
        invoiceId: result.invoice.id,
        trackingId: result.trackingId,
        totalAmount: result.invoice.totalAmount,
        freightQuote: freight,
        serviceFee,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
