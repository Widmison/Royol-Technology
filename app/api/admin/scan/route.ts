import { NextResponse } from "next/server";
import { $Enums, type PackageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";
import { sendTrackingUpdateEmail } from "@/lib/sendTrackingUpdateEmail";

const ALLOWED_STATUSES = new Set(Object.values($Enums.PackageStatus));

export async function POST(req: Request) {
  try {
    const adminOrRes = await requireAdminApiUser();
    if (adminOrRes instanceof NextResponse) return adminOrRes;

    const { trackingId, status, location, description } = await req.json();

    if (!trackingId || !status || !location) {
      return NextResponse.json({ error: "Tracking ID, status, and location are required." }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.has(status as PackageStatus)) {
      return NextResponse.json({ error: "Invalid package status." }, { status: 400 });
    }

    // 1. Find the package and the client who owns it
    const pkg = await prisma.package.findUnique({
      where: { trackingId },
      include: {
        request: {
          include: { client: true }
        }
      }
    });

    if (!pkg) return NextResponse.json({ error: `Package ${trackingId} not found in system.` }, { status: 404 });

    const eventDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : `Package scanned at ${location}`;

    // 2. Update the Package Status
    await prisma.package.update({
      where: { id: pkg.id },
      data: { status, updatedAt: new Date() },
    });

    // 3. Create tracking event (this timeline is what clients see on /track and the portal)
    await prisma.trackingEvent.create({
      data: {
        packageId: pkg.id,
        status,
        location,
        description: eventDescription,
      },
    });

    const clientName = `${pkg.request.firstName} ${pkg.request.lastName}`.trim() || "Customer";
    const clientEmail = pkg.request.client?.email?.trim();

    if (clientEmail) {
      const emailed = await sendTrackingUpdateEmail(clientEmail, {
        clientName,
        trackingId: String(trackingId).toUpperCase(),
        location,
        status,
        description: eventDescription,
      });
      if (!emailed) {
        console.warn(`[tracking] Update saved for ${trackingId} but email was not sent (check RESEND_API_KEY / EMAIL_FROM).`);
      }
    } else {
      console.warn(`[tracking] No portal client email on shipment; skipping tracking email for ${trackingId}.`);
    }

    return NextResponse.json({ 
      success: true, 
      clientName,
      message: `Successfully updated ${trackingId} to ${status.replace('_', ' ')}`
    });

  } catch (error) {
    console.error("Scan API Error:", error);
    return NextResponse.json({ error: "Server error processing scan." }, { status: 500 });
  }
}