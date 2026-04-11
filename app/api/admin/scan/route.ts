import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { trackingId, status, location, description } = await req.json();

    if (!trackingId || !status || !location) {
      return NextResponse.json({ error: "Tracking ID, status, and location are required." }, { status: 400 });
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

    // 2. Update the Package Status
    await prisma.package.update({
      where: { id: pkg.id },
      data: { status, updatedAt: new Date() }
    });

    // 3. Create the Real-Time Tracking Event for the Client's Dashboard
    await prisma.trackingEvent.create({
      data: {
        packageId: pkg.id,
        status,
        location,
        description: description || `Package scanned at ${location}`
      }
    });

    // Grab the client's info for the email
    const clientName = `${pkg.request.firstName} ${pkg.request.lastName}`;
    const clientEmail = pkg.request.client?.email;

    // 4. SIMULATE EMAIL & SMS NOTIFICATION!
    if (status === 'READY_FOR_PICKUP' && clientEmail) {
      console.log(`\n======================================================`);
      console.log(`📧 EMAIL NOTIFICATION TRIGGERED FOR: ${clientEmail}`);
      console.log(`📱 SMS TEXT MESSAGE TRIGGERED FOR: ${pkg.request.phone}`);
      console.log(`------------------------------------------------------`);
      console.log(`SUBJECT: Your MEX509 Package is Ready for Pickup! 🇭🇹`);
      console.log(`BODY:`);
      console.log(`Bonjour ${clientName},`);
      console.log(`Great news! Your package (Tracking: ${trackingId}) has arrived in Haiti and is READY FOR PICKUP at our ${location} office.`);
      console.log(`Please bring a valid ID and your invoice to claim your items.`);
      console.log(`Mèsi dèske ou chwazi MEX509!`);
      console.log(`======================================================\n`);
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