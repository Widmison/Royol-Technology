import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  clearAuthSessionCookies,
  sessionCookieOptions,
} from "@/lib/authCookies";
import {
  ADMIN_PORTAL_LOGIN_EMAIL,
  configuredAdminPassword,
  isAdminPortalLoginEmail,
  normalizeEmail,
} from "@/lib/adminAuthConfig";
import {
  hashPassword,
  verifyPassword,
  shouldUpgradePasswordHash,
  timingSafeStringEqual,
} from "@/lib/passwordCrypto";
import { allowAuthAttempt, clientIp } from "@/lib/authRateLimit";

/**
 * Dedicated admin session — not `/api/auth`.
 * Password is checked against `MEX509_ADMIN_PASSWORD` (first bootstrap) or a bcrypt hash in the DB.
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!allowAuthAttempt(`admin-login:${ip}`)) {
      return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (!isAdminPortalLoginEmail(email)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const envPw = configuredAdminPassword();
    if (!envPw) {
      return NextResponse.json(
        { error: "Admin sign-in is not configured (missing MEX509_ADMIN_PASSWORD)." },
        { status: 503 }
      );
    }

    const canonical = normalizeEmail(ADMIN_PORTAL_LOGIN_EMAIL);

    const existing = await prisma.user.findFirst({
      where: { email: { equals: canonical, mode: "insensitive" } },
    });

    let user = existing;

    if (!existing) {
      if (!timingSafeStringEqual(password, envPw)) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
      user = await prisma.user.create({
        data: {
          email: canonical,
          password: await hashPassword(password),
          role: "ADMIN",
          isVerified: true,
          firstName: "Admin",
          lastName: "MEX509",
        },
      });
    } else {
      const ok = await verifyPassword(password, existing.password);
      if (!ok) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
      if (shouldUpgradePasswordHash(existing.password)) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { password: await hashPassword(password) },
        });
      }
      user = existing;
    }

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const cookieStore = await cookies();
    const opts = sessionCookieOptions();
    clearAuthSessionCookies(cookieStore);
    cookieStore.set(ADMIN_SESSION_COOKIE, user.id, opts);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Admin auth error:", e);
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
