import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isPortalStaffRole } from "@/lib/staffAccess";
import { validateSignupPassword } from "@/lib/passwordPolicy";
import { hashPassword } from "@/lib/passwordCrypto";

export async function POST(req: Request) {
  const admin = await getAdminSessionUser();
  if (!admin || !isPortalStaffRole(admin.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const state = typeof body.state === "string" ? body.state.trim() : "";
    const zipCode = typeof body.zipCode === "string" ? body.zipCode.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone are required." },
        { status: 400 }
      );
    }

    if (!admin.adminProfileComplete) {
      const pwError = validateSignupPassword(newPassword);
      if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
    } else if (newPassword.length > 0) {
      const pwError = validateSignupPassword(newPassword);
      if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
    }

    const passwordUpdate =
      !admin.adminProfileComplete || newPassword.length > 0
        ? { password: await hashPassword(newPassword) }
        : undefined;

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        firstName,
        lastName,
        phone,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        adminProfileComplete: true,
        ...(passwordUpdate ?? {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("complete-profile:", e);
    return NextResponse.json({ error: "Could not save profile." }, { status: 500 });
  }
}
