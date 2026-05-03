import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    email?: string;
    /** Google admin portal session: mirrors DB after sign-in (may be stale until session refresh). */
    twoFactorEnabled?: boolean;
    portalRole?: string;
  }
}
