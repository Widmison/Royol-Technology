"use client";

/**
 * Admin uses `/api/admin/auth` + cookie session — no NextAuth SessionProvider (avoids polling `/api/auth/session`).
 */
export default function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
