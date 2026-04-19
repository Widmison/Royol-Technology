import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

function parseAllowlist(): Set<string> {
  const raw = process.env.MEX509_ADMIN_GOOGLE_ALLOWLIST?.trim();
  if (!raw) return new Set();
  return new Set(raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/access-denied",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      const allow = parseAllowlist();
      if (allow.size === 0) {
        console.error(
          "[auth] MEX509_ADMIN_GOOGLE_ALLOWLIST is empty — denying Google admin sign-in."
        );
        return false;
      }
      if (!allow.has(email)) return false;

      const { prisma } = await import("@/lib/prisma");
      const { hashPassword } = await import("@/lib/passwordCrypto");
      const { randomBytes } = await import("crypto");

      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.role === "CLIENT") return false;

      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          password: await hashPassword(randomBytes(32).toString("hex")),
          role: "ADMIN",
          isVerified: true,
          firstName: user.name?.trim().split(/\s+/)[0] ?? "Admin",
          lastName: user.name?.trim().split(/\s+/).slice(1).join(" ") || "User",
        },
        update: {
          role: "ADMIN",
          firstName: user.name?.trim().split(/\s+/)[0] ?? undefined,
          lastName: user.name?.trim().split(/\s+/).slice(1).join(" ") || undefined,
        },
      });

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const email = user.email.trim().toLowerCase();
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });
        if (dbUser?.role === "ADMIN") {
          token.sub = dbUser.id;
          token.email = dbUser.email;
          token.role = "admin";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role = typeof token.role === "string" ? token.role : "admin";
        session.user.email =
          (typeof token.email === "string" ? token.email : session.user.email) ?? "";
      }
      return session;
    },
  },
});
