import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { isStaffEmailAllowed } from "@/lib/adminStaffRegistry";
import { ensureGoogleAdminUser } from "@/lib/googleAdminSignIn";

const googleConfigured =
  typeof process.env.GOOGLE_CLIENT_ID === "string" &&
  process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
  typeof process.env.GOOGLE_CLIENT_SECRET === "string" &&
  process.env.GOOGLE_CLIENT_SECRET.trim().length > 0;

/**
 * Admin sign-in:
 * - Primary: `/api/admin/auth` (email + OTP) + `adminId` cookie
 * - Secondary: Google OAuth (allowlisted staff in `ADMIN_STAFF_REGISTRY` / DB ADMIN only)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      id: "admin-portal",
      name: "Admin portal",
      credentials: {},
      /** Sign-in happens via `/api/admin/auth`; keeps Auth.js config valid. */
      async authorize() {
        return null;
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            id: "google-admin",
            name: "Google",
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/access-denied",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user?.email) {
        return true;
      }
      if (!isStaffEmailAllowed(user.email)) {
        return false;
      }
      const existing = await prisma.user.findFirst({
        where: { email: { equals: user.email.trim(), mode: "insensitive" } },
      });
      if (existing && existing.role !== "ADMIN") {
        return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const dbUser = await ensureGoogleAdminUser(user.email);
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = "admin";
          token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role = typeof token.role === "string" ? token.role : "";
        session.user.email =
          (typeof token.email === "string" ? token.email : session.user.email) ?? "";
      }
      return session;
    },
  },
});
