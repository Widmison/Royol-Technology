import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We added the address fields and removed 'role'
    const { action, id, email, password, firstName, lastName, phone, address, city, state, zipCode } = body;

    // ==========================================
    // ACTION 1: CREATE NEW CLIENT
    // ==========================================
    if (action === "create") {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: "Email already exists in the system." }, { status: 400 });

      const user = await prisma.user.create({
        data: {
          email,
          password: password || "Mex509Secure!", // Default password if you leave it blank
          firstName,
          lastName,
          phone,
          address, city, state, zipCode, // Save the address!
          role: "CLIENT", // Hardcoded to ALWAYS be a Client
          isVerified: true, 
        }
      });
      return NextResponse.json({ success: true, user });
    }

    // ==========================================
    // ACTION 2: UPDATE EXISTING CLIENT
    // ==========================================
    if (action === "update") {
      if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      const user = await prisma.user.update({
        where: { id },
        data: { email, firstName, lastName, phone, address, city, state, zipCode } // Update address!
      });
      return NextResponse.json({ success: true, user });
    }

    // ==========================================
    // ACTION 3: DELETE CLIENT
    // ==========================================
    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      
      // Safety Check: Unlink any shipment requests from this user so we don't break financial records!
      await prisma.shipmentRequest.updateMany({
        where: { clientId: id },
        data: { clientId: null }
      });

      await prisma.user.delete({ where: { id } });

      return NextResponse.json({ success: true, message: "Client deleted successfully." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin User API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}