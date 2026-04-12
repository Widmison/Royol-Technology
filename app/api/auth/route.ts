import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { validateSignupPassword } from "@/lib/passwordPolicy";
import { sendSignupVerificationEmail } from "@/lib/sendVerificationEmail";

// Helper function to generate a random 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Added 'phone' here!
    const { action, email, password, firstName, lastName, phone, address, city, state, zipCode, code } = body;

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    let user;

    if (action === "signup") {
      const pwError = validateSignupPassword(password);
      if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return NextResponse.json({ error: "Email already in use." }, { status: 400 });

      const newCode = generateCode();

      user = await prisma.user.create({
        data: {
          email, password, firstName, lastName, phone, // Added 'phone' here!
          address, city, state, zipCode, 
          isVerified: false,
          verificationCode: newCode,
        },
      });

      const emailed = await sendSignupVerificationEmail(email, newCode);

      console.log(`\n========================================`);
      console.log(`🔒 EMAIL VERIFICATION CODE FOR ${email}: ${newCode}`);
      console.log(emailed ? "   (copy also sent by email via Resend)" : "   (email not sent — check RESEND_API_KEY / EMAIL_FROM)");
      console.log(`========================================\n`);

      return NextResponse.json(
        {
          success: true,
          requireVerification: true,
          verificationEmailSent: emailed,
          ...(process.env.NODE_ENV === "development" && {
            devVerificationCode: newCode,
            devVerificationNote: emailed
              ? "A verification email was sent. The code is also shown here in development only."
              : "RESEND_API_KEY or EMAIL_FROM may be missing — code shown here for local testing.",
          }),
        },
        { status: 200 }
      );
    }

    if (action === "login") {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.password !== password) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      if (!user.isVerified) {
        const newCode = generateCode();
        await prisma.user.update({
          where: { id: user.id },
          data: { verificationCode: newCode }
        });

        console.log(`\n========================================`);
        console.log(`🔒 NEW VERIFICATION CODE FOR ${email}: ${newCode}`);
        console.log(`========================================\n`);

        return NextResponse.json(
          {
            success: true,
            requireVerification: true,
            ...(process.env.NODE_ENV === "development" && {
              devVerificationCode: newCode,
              devVerificationNote:
                "Email/SMS is not wired yet; this code is only returned in development.",
            }),
          },
          { status: 200 }
        );
      }
    }

    if (action === "verify") {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      if (user.verificationCode !== code) {
        return NextResponse.json({ error: "Invalid verification code." }, { status: 401 });
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationCode: null }
      });
    }

    if (user && user.isVerified) {
      const cookieStore = await cookies();
      cookieStore.set("clientId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return NextResponse.json({ success: true, verified: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });

  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}