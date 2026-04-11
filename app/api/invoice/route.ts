import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateFreightTotal } from "@/lib/freightRates";
import { allocateMexTrackingId } from "@/lib/trackingId";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = body.requestId as string | undefined;
    const weightRaw = body.weight;
    const priceRaw = body.price;

    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }

    const weight =
      typeof weightRaw === "string" ? parseFloat(weightRaw) : Number(weightRaw);
    if (!Number.isFinite(weight) || weight <= 0) {
      return NextResponse.json(
        { error: "A valid positive weight in pounds is required" },
        { status: 400 }
      );
    }

    const request = await prisma.shipmentRequest.findUnique({
      where: { id: requestId },
      include: { invoice: true, package: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Shipment request not found" }, { status: 404 });
    }
    if (request.invoice) {
      return NextResponse.json(
        { error: "This request already has an invoice" },
        { status: 409 }
      );
    }
    if (request.package) {
      return NextResponse.json(
        { error: "This request already has a package record" },
        { status: 409 }
      );
    }
    if (request.status !== "PENDING_DROPOFF") {
      return NextResponse.json(
        { error: "Only pending drop-off requests can be invoiced" },
        { status: 400 }
      );
    }

    const autoTotal = calculateFreightTotal(weight, request.shippingMethod);
    let totalAmount = autoTotal;
    if (priceRaw !== undefined && priceRaw !== null && `${priceRaw}`.trim() !== "") {
      const override =
        typeof priceRaw === "string" ? parseFloat(priceRaw) : Number(priceRaw);
      if (Number.isFinite(override) && override >= 0) {
        totalAmount = Math.round(override * 100) / 100;
      }
    }

    const { invoice, trackingId } = await prisma.$transaction(async (tx) => {
      const trackingId = await allocateMexTrackingId(tx);

      await tx.package.create({
        data: {
          trackingId,
          requestId: request.id,
          status: "PROCESSING",
          events: {
            create: {
              status: "PROCESSING",
              location: "Miami Warehouse (Doral, FL)",
              description:
                "Package received and weighed. Invoice issued — awaiting payment before dispatch.",
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

      return { invoice, trackingId };
    });

    return NextResponse.json(
      {
        success: true,
        invoice,
        trackingId,
        totalAmount,
        autoQuote: autoTotal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
