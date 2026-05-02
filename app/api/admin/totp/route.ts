import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApiUser } from "@/lib/requireApiSession";
import { buildTotpKeyUri, createTotpSecret, verifyTotpCode } from "@/lib/adminTotp";
import { verifyPassword } from "@/lib/passwordCrypto";

type PostBody = {
  action?: string;
  code?: string;
  password?: string;
};

/**
 * Google Authenticator (TOTP) for `ADMIN` only. STAFF cannot manage 2FA here.
 * - `begin`: store secret, return otpauth URL (enrollment)
 * - `enable`: first successful TOTP → twoFactorEnabled true
 * - `disable`: require account password, clears 2FA
 */
export async function GET() {
  const gate = await requireSuperAdminApiUser();
  if (gate instanceof NextResponse) return gate;

  const u = await prisma.user.findUnique({
    where: { id: gate.id },
    select: { twoFactorEnabled: true, twoFactorSecret: true, email: true },
  });
  if (!u) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  /** Pending enrollment: same secret as last "begin" — lets UI show QR again after refresh without rotating the secret. */
  let otpauthUrl: string | null = null;
  if (u.twoFactorSecret && !u.twoFactorEnabled) {
    otpauthUrl = buildTotpKeyUri(u.email, u.twoFactorSecret);
  }

  return NextResponse.json({
    twoFactorEnabled: u.twoFactorEnabled,
    hasSecret: !!u.twoFactorSecret,
    otpauthUrl,
  });
}

export async function POST(req: Request) {
  const gate = await requireSuperAdminApiUser();
  if (gate instanceof NextResponse) return gate;

  const body = (await req.json().catch(() => ({}))) as PostBody;
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "begin") {
    const secret = createTotpSecret();
    await prisma.user.update({
      where: { id: gate.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false,
      },
    });
    const otpauthUrl = buildTotpKeyUri(gate.email, secret);
    return NextResponse.json({ ok: true, otpauthUrl });
  }

  if (action === "enable") {
    const code = typeof body.code === "string" ? body.code : "";
    const u = await prisma.user.findUnique({
      where: { id: gate.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });
    if (!u?.twoFactorSecret) {
      return NextResponse.json({ error: "Start setup first (begin)." }, { status: 400 });
    }
    if (u.twoFactorEnabled) {
      return NextResponse.json({ error: "Two-factor is already enabled." }, { status: 400 });
    }
    if (!verifyTotpCode(u.twoFactorSecret, code)) {
      return NextResponse.json({ error: "Invalid code." }, { status: 401 });
    }
    await prisma.user.update({
      where: { id: gate.id },
      data: { twoFactorEnabled: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "disable") {
    const password = typeof body.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json({ error: "Password is required to disable 2FA." }, { status: 400 });
    }
    const u = await prisma.user.findUnique({ where: { id: gate.id } });
    if (!u) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (!(await verifyPassword(password, u.password))) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }
    await prisma.user.update({
      where: { id: gate.id },
      data: { twoFactorSecret: null, twoFactorEnabled: false },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
