import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { AdminStaffRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isWebDevPortalAdmin } from "@/lib/webDevAccess";
import { normalizeStaffEmail } from "@/lib/adminStaffRegistry";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Web Dev only: who may use the admin portal (email list for sign-in + Google bootstrap).
 * `ADMIN_TEAM` full admins do not see or call this API.
 */
export async function GET() {
  const user = await getAdminSessionUser();
  if (!isWebDevPortalAdmin(user)) {
    return jsonError("Only the Web Dev account can view the staff allowlist.", 403);
  }

  const entries = await prisma.staffAllowlistEntry.findMany({
    orderBy: [{ staffRole: "asc" }, { email: "asc" }],
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const user = await getAdminSessionUser();
  if (!isWebDevPortalAdmin(user)) {
    return jsonError("Only the Web Dev account can add allowlist entries.", 403);
  }

  let body: { email?: string; staffRole?: string; roleLabel?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON.", 400);
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const canonical = normalizeStaffEmail(emailRaw);
  if (!canonical || !EMAIL_RE.test(canonical)) {
    return jsonError("Enter a valid email address.", 400);
  }

  const roleRaw = typeof body.staffRole === "string" ? body.staffRole.trim().toUpperCase() : "";
  const staffRole =
    roleRaw === "WEB_DEV"
      ? AdminStaffRole.WEB_DEV
      : roleRaw === "ADMIN_TEAM"
        ? AdminStaffRole.ADMIN_TEAM
        : null;
  if (!staffRole) {
    return jsonError("Role must be WEB_DEV or ADMIN_TEAM.", 400);
  }

  const roleLabel =
    typeof body.roleLabel === "string" && body.roleLabel.trim().length > 0
      ? body.roleLabel.trim().slice(0, 120)
      : "";

  try {
    const entry = await prisma.staffAllowlistEntry.create({
      data: {
        email: canonical,
        staffRole,
        roleLabel,
      },
    });
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError("That email is already on the allowlist.", 409);
    }
    console.error("[staff-allowlist POST]", e);
    return jsonError("Could not add entry.", 500);
  }
}

export async function DELETE(req: Request) {
  const user = await getAdminSessionUser();
  if (!isWebDevPortalAdmin(user)) {
    return jsonError("Only the Web Dev account can remove allowlist entries.", 403);
  }

  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return jsonError("Missing id.", 400);
  }

  const entry = await prisma.staffAllowlistEntry.findUnique({ where: { id } });
  if (!entry) {
    return jsonError("Entry not found.", 404);
  }

  const total = await prisma.staffAllowlistEntry.count();
  if (total <= 1) {
    return jsonError("Cannot remove the last allowlisted email — add another first.", 400);
  }

  if (entry.staffRole === AdminStaffRole.WEB_DEV) {
    const webDevCount = await prisma.staffAllowlistEntry.count({
      where: { staffRole: AdminStaffRole.WEB_DEV },
    });
    if (webDevCount <= 1) {
      return jsonError("Keep at least one Web Dev email on the allowlist.", 400);
    }
  }

  await prisma.staffAllowlistEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
