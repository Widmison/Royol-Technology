import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { validateSignupPassword } from "@/lib/passwordPolicy";
import {
  sendClientVerificationEmail,
  type ClientVerificationPurpose,
} from "@/lib/sendVerificationEmail";
import { sendPasswordResetEmail } from "@/lib/sendPasswordResetEmail";
import { sendClientWelcomeEmail } from "@/lib/sendNotificationEmails";
import { getPortalSiteUrl } from "@/lib/siteUrl";
import {
  CLIENT_SESSION_COOKIE,
  clearAuthSessionCookies,
  sessionCookieOptions,
} from "@/lib/authCookies";
import { isAdminPortalLoginEmail } from "@/lib/adminAuthConfig";
import { hashPassword, verifyPassword, shouldUpgradePasswordHash } from "@/lib/passwordCrypto";
import { allowAuthAttempt, clientIp } from "@/lib/authRateLimit";

// Helper function to generate a random 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const isProduction = () => process.env.NODE_ENV === "production";

const EMAIL_SEND_FAILED =
  "We could not send the verification email. Please try again in a moment or contact support if this continues.";

function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.length >= 5 ? cleaned : null;
}

async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 10; i += 1) {
    const code = `MEX${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return `MEX${Date.now().toString(36).toUpperCase()}`;
}

function normalizeResetCode(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 6 ? digits : null;
}

async function validateActiveResetCode(
  emailRaw: string,
  rawToken: string
): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  const em = emailRaw.trim();
  const tkNorm = normalizeResetCode(rawToken.trim());
  if (!tkNorm) {
    return { ok: false, message: "Enter the 6-digit code from your email." };
  }

  const account = await prisma.user.findFirst({
    where: {
      email: em,
      passwordResetExpires: { gt: new Date() },
      role: "CLIENT",
      passwordResetToken: { not: null },
    },
  });

  if (!account?.passwordResetToken) {
    return {
      ok: false,
      message: "Invalid or expired code. Request a new reset from the login page.",
    };
  }

  const a = Buffer.from(account.passwordResetToken, "utf8");
  const b = Buffer.from(tkNorm, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return {
      ok: false,
      message: "Invalid or expired code. Request a new reset from the login page.",
    };
  }

  return { ok: true, userId: account.id };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zipCode,
      referredBy,
      code,
      token,
      newPassword,
    } = body;

    const ip = clientIp(req);
    const rateBuckets = [
      "login",
      "signup",
      "forgot_password",
      "verify_reset_code",
      "reset_password",
      "resend_verification",
    ];
    if (
      typeof action === "string" &&
      rateBuckets.includes(action) &&
      !allowAuthAttempt(`portal-auth:${action}:${ip}`)
    ) {
      return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
    }

    if (action === "forgot_password") {
      const em = typeof email === "string" ? email.trim() : "";
      if (!em) return NextResponse.json({ error: "Email is required" }, { status: 400 });

      const account = await prisma.user.findUnique({ where: { email: em } });
      let devResetCode: string | undefined;

      if (account?.role === "CLIENT" && account.isVerified) {
        const resetCode = generateCode();
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: account.id },
          data: { passwordResetToken: resetCode, passwordResetExpires },
        });
        const emailed = await sendPasswordResetEmail(em, resetCode);
        if (process.env.NODE_ENV === "development") {
          console.log(`\n[MEX509] Password reset for ${em}. Email sent: ${emailed}. Code (1h): ${resetCode}\n`);
          if (!emailed) devResetCode = resetCode;
        }
      }

      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email, you will receive a 6-digit reset code shortly. Check your inbox and spam folder.",
        ...(devResetCode ? { devResetCode } : {}),
      });
    }

    if (action === "verify_reset_code") {
      const em = typeof email === "string" ? email.trim() : "";
      const tk = typeof token === "string" ? token.trim() : "";
      if (!em || !tk) {
        return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 });
      }

      const v = await validateActiveResetCode(em, tk);
      if (!v.ok) {
        return NextResponse.json({ error: v.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "reset_password") {
      const em = typeof email === "string" ? email.trim() : "";
      const tk = typeof token === "string" ? token.trim() : "";
      const np = typeof newPassword === "string" ? newPassword : "";
      if (!em || !tk || !np) {
        return NextResponse.json({ error: "Email, verification code, and new password are required." }, { status: 400 });
      }
      const pwError = validateSignupPassword(np);
      if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

      const v = await validateActiveResetCode(em, tk);
      if (!v.ok) {
        return NextResponse.json({ error: v.message }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: v.userId },
        data: {
          password: await hashPassword(np),
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return NextResponse.json({ success: true, message: "Password updated. You can sign in now." });
    }

    if (action === "resend_verification") {
      const em = typeof email === "string" ? email.trim() : "";
      const pwd = typeof password === "string" ? password : "";
      if (!em || !pwd) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
      }

      const u = await prisma.user.findUnique({ where: { email: em } });
      if (!u || !(await verifyPassword(pwd, u.password))) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
      if (u.role !== "CLIENT") {
        return NextResponse.json({ error: "Invalid account." }, { status: 403 });
      }
      const newCode = generateCode();
      const purpose: ClientVerificationPurpose = u.isVerified ? "signin" : "signup";

      if (isProduction()) {
        const emailed = await sendClientVerificationEmail(em, newCode, purpose);
        if (!emailed) {
          return NextResponse.json({ error: EMAIL_SEND_FAILED }, { status: 503 });
        }
      }

      await prisma.user.update({
        where: { id: u.id },
        data: { verificationCode: newCode },
      });

      if (!isProduction()) {
        const emailed = await sendClientVerificationEmail(em, newCode, purpose);
        if (process.env.NODE_ENV === "development") {
          console.log(`\n[MEX509] Resend verification for ${em}. Code: ${newCode}. Email ok: ${emailed}\n`);
        }
        return NextResponse.json({
          success: true,
          verificationEmailSent: emailed,
        });
      }

      return NextResponse.json({
        success: true,
        verificationEmailSent: true,
      });
    }

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    let user;

    if (action === "signup") {
      if (await isAdminPortalLoginEmail(email)) {
        return NextResponse.json(
          { error: "This email is reserved for administrator sign-in." },
          { status: 400 }
        );
      }

      const pwError = validateSignupPassword(password);
      if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return NextResponse.json({ error: "Email already in use." }, { status: 400 });

      const phoneRaw = typeof phone === "string" ? phone.trim() : "";

      const newCode = generateCode();
      const referralCode = await generateUniqueReferralCode();
      const referredByCode = normalizeReferralCode(referredBy);
      let referredById: string | null = null;
      if (referredByCode) {
        const referrer = await prisma.user.findUnique({
          where: { referralCode: referredByCode },
          select: { id: true, role: true },
        });
        if (!referrer || referrer.role !== "CLIENT") {
          return NextResponse.json({ error: "Referral code is invalid." }, { status: 400 });
        }
        referredById = referrer.id;
      }

      if (isProduction()) {
        const emailed = await sendClientVerificationEmail(email, newCode, "signup");
        if (!emailed) {
          return NextResponse.json({ error: EMAIL_SEND_FAILED }, { status: 503 });
        }
      }

      user = await prisma.user.create({
        data: {
          email,
          password: await hashPassword(password),
          firstName,
          lastName,
          phone: phoneRaw,
          address,
          city,
          state,
          zipCode,
          referralCode,
          referredById,
          isVerified: false,
          verificationCode: newCode,
        },
      });

      if (!isProduction()) {
        const emailed = await sendClientVerificationEmail(email, newCode, "signup");

        if (process.env.NODE_ENV === "development") {
          console.log(`\n========================================`);
          console.log(`🔒 EMAIL VERIFICATION CODE FOR ${email}: ${newCode}`);
          console.log(
            emailed ? "   (copy also sent by email via Resend)" : "   (email not sent — check RESEND_API_KEY / EMAIL_FROM)"
          );
          console.log(`========================================\n`);
        }

        return NextResponse.json(
          {
            success: true,
            requireVerification: true,
            verificationEmailSent: emailed,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          requireVerification: true,
          verificationEmailSent: true,
        },
        { status: 200 }
      );
    }

    if (action === "login") {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await verifyPassword(password, user.password))) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      if (shouldUpgradePasswordHash(user.password)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: await hashPassword(password) },
        });
      }

      if (user.role === "ADMIN" || user.role === "STAFF") {
        return NextResponse.json(
          { error: "This account is for the admin dashboard. Sign in on the admin portal instead." },
          { status: 403 }
        );
      }

      if (user.role === "CLIENT") {
        const newCode = generateCode();

        if (isProduction()) {
          const emailed = await sendClientVerificationEmail(email, newCode, "signin");
          if (!emailed) {
            return NextResponse.json({ error: EMAIL_SEND_FAILED }, { status: 503 });
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { verificationCode: newCode },
        });

        if (!isProduction()) {
          const emailed = await sendClientVerificationEmail(email, newCode, "signin");

          if (process.env.NODE_ENV === "development") {
            console.log(`\n========================================`);
            console.log(`🔒 SIGN-IN VERIFICATION CODE FOR ${email}: ${newCode}`);
            console.log(`Email sent via Resend: ${emailed}`);
            console.log(`========================================\n`);
          }

          return NextResponse.json({
            success: true,
            requireVerification: true,
            verificationEmailSent: emailed,
          });
        }

        return NextResponse.json({
          success: true,
          requireVerification: true,
          verificationEmailSent: true,
        });
      }
    }

    if (action === "verify") {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      if (user.verificationCode !== code) {
        return NextResponse.json({ error: "Invalid verification code." }, { status: 401 });
      }

      const wasVerified = user.isVerified;

      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationCode: null }
      });

      if (user.role === "CLIENT" && !wasVerified) {
        await sendClientWelcomeEmail({
          to: user.email,
          firstName: user.firstName,
          referralCode: user.referralCode,
          portalUrl: `${getPortalSiteUrl()}/dashboard?tab=overview`,
        });
      }
    }

    if (user && user.isVerified) {
      if (user.role === "ADMIN" || user.role === "STAFF") {
        return NextResponse.json(
          { error: "Admin accounts must sign in through the admin portal." },
          { status: 403 }
        );
      }

      const cookieStore = await cookies();
      const opts = sessionCookieOptions();
      clearAuthSessionCookies(cookieStore);
      cookieStore.set(CLIENT_SESSION_COOKIE, user.id, opts);
      return NextResponse.json({ success: true, verified: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });

  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  clearAuthSessionCookies(cookieStore);
  return NextResponse.json({ success: true });
}