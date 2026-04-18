import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateFreightTotal } from "@/lib/freightRates";
import { normalizeQuoteShippingMethod } from "@/lib/shippingMethods";
import { allocateMexTrackingId } from "@/lib/trackingId";
import { requireAdminApiUser } from "@/lib/requireApiSession";

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApiUser();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const requestId = body.requestId as string | undefined;
    const weightRaw = body.weight;
    const priceRaw = body.price;
    const shippingMethodRaw = body.shippingMethod;

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

    const shippingMethod = normalizeQuoteShippingMethod(
      shippingMethodRaw,
      request.shippingMethod
    );

    const autoTotal = calculateFreightTotal(weight, shippingMethod);
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
        data: { status: "INVOICED", shippingMethod },
      });

      return { invoice, trackingId };
    });

    return NextResponse.json(
      {
        success: true,
        invoice: {
          id: invoice.id,
          createdAt: invoice.createdAt,
          totalAmount,
          actualWeightLbs: weight,
          status: invoice.status,
        },
        trackingId,
        requestId: request.id,
        shippingMethod,
        totalAmount,
        autoQuote: autoTotal,
        recipient: {
          firstName: request.firstName,
          lastName: request.lastName,
          phone: request.phone,
          address: request.address,
          city: request.city,
          state: request.state,
          zipCode: request.zipCode,
          destinationCountry: request.destinationCountry,
          departure: request.departure,
          category: request.category,
          description: request.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
