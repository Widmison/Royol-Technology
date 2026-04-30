import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ExternalTrackingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import AdminShell, { type AdminShellStats } from "@/components/admin/AdminShell";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";
import { redirectToAdminLogin } from "@/lib/adminLoginRedirect";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isPortalStaffRole, isSuperAdminUser } from "@/lib/staffAccess";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const emptyStats: AdminShellStats = {
  pendingQuotes: 0,
  unpaidInvoices: 0,
  activeShipments: 0,
  clientCount: 0,
  pendingExternalTracking: 0,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-url-path") || "";
  const isLoginSurface =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login?") ||
    pathname.startsWith("/login?") ||
    pathname === "/admin/access-denied" ||
    pathname.startsWith("/admin/access-denied?");
  const isPrint = pathname.startsWith("/admin/print");
  const isProfileSurface =
    pathname === "/admin/complete-profile" || pathname.startsWith("/admin/complete-profile?");

  const adminUser = await getAdminSessionUser();
  const isSuperAdmin = adminUser ? isSuperAdminUser(adminUser) : false;

  if (!isLoginSurface && !isPrint && !adminUser) {
    await redirectToAdminLogin();
  }

  const needsProfileCompletion =
    !!adminUser && isPortalStaffRole(adminUser.role) && adminUser.adminProfileComplete === false;

  if (!isLoginSurface && !isPrint && adminUser && needsProfileCompletion && !isProfileSurface) {
    redirect("/admin/complete-profile");
  }

  // STAFF scope: operational surfaces only (no dashboard analytics, quote queue, staff directory, CRM, or settings).
  if (!isLoginSurface && !isPrint && adminUser && adminUser.role === "STAFF") {
    const staffBlocked =
      pathname === "/admin/dashboard" ||
      pathname.startsWith("/admin/dashboard?") ||
      pathname.startsWith("/admin/quotes") ||
      pathname.startsWith("/admin/staff") ||
      pathname.startsWith("/admin/search") ||
      pathname.startsWith("/admin/settings");
    if (staffBlocked) {
      redirect("/admin/shipments");
    }
  }

  let stats = emptyStats;
  if (adminUser && !isLoginSurface && !isPrint) {
    try {
      const [pendingQuotes, unpaidInvoices, activeShipments, clientCount, pendingExternalTracking] =
        await Promise.all([
          prisma.shipmentRequest.count({ where: { status: "PENDING_DROPOFF" } }),
          prisma.invoice.count({ where: { status: "UNPAID" } }),
          prisma.package.count({ where: { status: { not: "DELIVERED" } } }),
          prisma.user.count({ where: { role: "CLIENT" } }),
          prisma.clientExternalTracking.count({ where: { status: ExternalTrackingStatus.PENDING_REVIEW } }),
        ]);
      stats = { pendingQuotes, unpaidInvoices, activeShipments, clientCount, pendingExternalTracking };
    } catch (err) {
      console.error("[admin/layout] Shell stats query failed — check DATABASE_URL and `npx prisma migrate deploy`.", err);
    }
  }

  /** Login / access-denied / print — full-page content only (no sidebar or admin header). */
  if (isLoginSurface || isPrint) {
    return <AdminSessionProvider>{children}</AdminSessionProvider>;
  }

  return (
    <AdminSessionProvider>
      <AdminShell
        stats={stats}
        canAccessStaffDirectory={isSuperAdmin}
        canAccessRestrictedAdminPages={isSuperAdmin}
      >
        {children}
      </AdminShell>
    </AdminSessionProvider>
  );
}
