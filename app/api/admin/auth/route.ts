import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  clearAuthSessionCookies,
  sessionCookieOptions,
} from "@/lib/authCookies";
import { defaultAdminBootstrapPassword } from "@/lib/adminAuthConfig";
import {
  hashPassword,
  verifyPassword,
  shouldUpgradePasswordHash,
  timingSafeStringEqual,
} from "@/lib/passwordCrypto";
import { allowAuthAttempt, clientIp } from "@/lib/authRateLimit";
import { getStaffRegistryEntry, normalizeStaffEmail } from "@/lib/adminStaffRegistry";
import { generateAdminOtpCode, hashAdminOtpCode, verifyAdminOtpCode } from "@/lib/adminOtpCrypto";
import { sendAdminSignInOtpEmail } from "@/lib/sendAdminOtpEmail";
import { verifyTotpCode } from "@/lib/adminTotp";

const OTP_TTL_MS = 15 * 60 * 1000;

type Body = {
  step?: string;
  email?: string;
  password?: string;
  code?: string;
  /** Google Authenticator / TOTP (6 digits) after email OTP when 2FA is enabled */
  totp?: string;
};

/**
 * Staff admin sign-in:
 * - ADMIN: password → email OTP → (if 2FA on) TOTP → session
 * - STAFF: password → session (no OTP, no TOTP)
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const body = (await req.json()) as Body;
    const stepRaw = typeof body.step === "string" ? body.step : "credentials";
    const step = stepRaw === "otp" ? "otp" : stepRaw === "totp" ? "totp" : "credentials";

    if (step === "totp") {
      return handleTotpStep(ip, body);
    }

    if (step === "credentials") {
      return handleCredentialsStep(ip, body);
    }

    // step === "otp"
    return handleOtpStep(ip, body);
  } catch (e) {
    console.error("Admin auth error:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2021" || e.code === "P2022") {
        return NextResponse.json(
          {
            error:
              "Database schema is missing updates. Run `npx prisma migrate deploy` against your production database, then try again.",
          },
          { status: 503 }
        );
      }
      if (e.code === "P1001") {
        return NextResponse.json(
          { error: "Cannot reach the database. Verify DATABASE_URL / DIRECT_URL on the server." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const shown = local.length <= 2 ? "*" : `${local.slice(0, 2)}…`;
  return `${shown}@${domain}`;
}

async function handleCredentialsStep(ip: string, body: Body) {
  if (!allowAuthAttempt(`admin-login:credentials:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const canonical = normalizeStaffEmail(emailRaw);

  if (!canonical || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const registry = await getStaffRegistryEntry(canonical);
  const existing = await prisma.user.findFirst({
    where: { email: { equals: canonical, mode: "insensitive" } },
  });

  if (!registry && (!existing || existing.role !== "STAFF")) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (existing?.role === "CLIENT") {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const bootstrap = defaultAdminBootstrapPassword();
  if (!bootstrap) {
    return NextResponse.json(
      {
        error:
          "Admin email sign-in is not configured (set MEX509_ADMIN_DEFAULT_PASSWORD or MEX509_ADMIN_PASSWORD).",
      },
      { status: 503 }
    );
  }

  // STAFF: email + password only (no email OTP, no TOTP on our side)
  if (existing?.role === "STAFF") {
    const bcryptOk = await verifyPassword(password, existing.password);
    const bootstrapOk = timingSafeStringEqual(password, bootstrap);
    if (!bcryptOk && !bootstrapOk) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (bootstrapOk && !bcryptOk) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: await hashPassword(password) },
      });
    } else if (bcryptOk && shouldUpgradePasswordHash(existing.password)) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: await hashPassword(password) },
      });
    }

    const cookieStore = await cookies();
    const opts = sessionCookieOptions();
    clearAuthSessionCookies(cookieStore);
    cookieStore.set(ADMIN_SESSION_COOKIE, existing.id, opts);

    return NextResponse.json({
      ok: true,
      step: "signed_in",
      needsProfile: !existing.adminProfileComplete,
    });
  }

  if (!existing) {
    if (!timingSafeStringEqual(password, bootstrap)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
  } else if (existing.role === "ADMIN" && existing.adminProfileComplete) {
    const bcryptOk = await verifyPassword(password, existing.password);
    if (!bcryptOk) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password. The shared bootstrap password is only for first-time setup — use the password you set when you completed registration.",
        },
        { status: 401 }
      );
    }
    if (shouldUpgradePasswordHash(existing.password)) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: await hashPassword(password) },
      });
    }
  } else {
    const bcryptOk = await verifyPassword(password, existing.password);
    const bootstrapOk = timingSafeStringEqual(password, bootstrap);
    if (!bcryptOk && !bootstrapOk) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (bootstrapOk && !bcryptOk) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: await hashPassword(password) },
      });
    } else if (bcryptOk && shouldUpgradePasswordHash(existing.password)) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: await hashPassword(password) },
      });
    }
  }

  if (!existing) {
    await prisma.user.create({
      data: {
        email: canonical,
        password: await hashPassword(password),
        role: "ADMIN",
        isVerified: true,
        firstName: "Staff",
        lastName: "MEX509",
        adminStaffRole: registry!.staffRole,
        adminProfileComplete: false,
      },
    });
  } else if (!existing.adminStaffRole && existing.role === "ADMIN") {
    await prisma.user.update({
      where: { id: existing.id },
      data: { adminStaffRole: registry!.staffRole },
    });
  }

  const code = generateAdminOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.adminLoginOtp.deleteMany({ where: { email: canonical } });
  await prisma.adminLoginOtp.create({
    data: {
      email: canonical,
      codeHash: hashAdminOtpCode(code),
      expiresAt,
    },
  });

  const emailed = await sendAdminSignInOtpEmail(canonical, code);
  if (process.env.NODE_ENV === "development") {
    console.log(`\n[MEX509] Admin OTP for ${canonical}. Emailed: ${emailed}. Code: ${code}\n`);
  }

  return NextResponse.json({
    ok: true,
    step: "otp_sent",
    devOtp: process.env.NODE_ENV === "development" ? code : undefined,
    emailMasked: maskEmail(canonical),
  });
}

async function handleOtpStep(ip: string, body: Body) {
  if (!allowAuthAttempt(`admin-login:otp:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const codeRaw = typeof body.code === "string" ? body.code : "";
  const canonical = normalizeStaffEmail(emailRaw);
  const digits = codeRaw.replace(/\D/g, "");

  if (!canonical || digits.length !== 6) {
    return NextResponse.json({ error: "Email and a valid 6-digit code are required." }, { status: 400 });
  }

  const row = await prisma.adminLoginOtp.findFirst({
    where: { email: canonical },
    orderBy: { createdAt: "desc" },
  });

  if (!row || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired code. Request a new code from the sign-in form." },
      { status: 401 }
    );
  }

  if (!verifyAdminOtpCode(digits, row.codeHash)) {
    return NextResponse.json({ error: "Invalid code." }, { status: 401 });
  }

  await prisma.adminLoginOtp.deleteMany({ where: { email: canonical } });

  const user = await prisma.user.findFirst({
    where: { email: { equals: canonical, mode: "insensitive" } },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    return NextResponse.json({
      ok: true,
      step: "totp_required",
      emailMasked: maskEmail(canonical),
    });
  }

  const cookieStore = await cookies();
  const opts = sessionCookieOptions();
  clearAuthSessionCookies(cookieStore);
  cookieStore.set(ADMIN_SESSION_COOKIE, user.id, opts);

  return NextResponse.json({
    ok: true,
    needsProfile: !user.adminProfileComplete,
  });
}

async function handleTotpStep(ip: string, body: Body) {
  if (!allowAuthAttempt(`admin-login:totp:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const totpRaw = typeof body.totp === "string" ? body.totp : "";
  const canonical = normalizeStaffEmail(emailRaw);

  if (!canonical || !totpRaw) {
    return NextResponse.json({ error: "Email and authenticator code are required." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: canonical, mode: "insensitive" } },
  });

  if (!user || user.role !== "ADMIN" || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "Two-factor sign-in is not available for this account." }, { status: 400 });
  }

  if (!verifyTotpCode(user.twoFactorSecret, totpRaw)) {
    return NextResponse.json({ error: "Invalid authenticator code." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const opts = sessionCookieOptions();
  clearAuthSessionCookies(cookieStore);
  cookieStore.set(ADMIN_SESSION_COOKIE, user.id, opts);

  return NextResponse.json({
    ok: true,
    needsProfile: !user.adminProfileComplete,
  });
}
