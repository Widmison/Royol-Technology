import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell, { type AdminShellStats } from "@/components/admin/AdminShell";
import { getAdminSessionUser } from "@/lib/serverSession";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const emptyStats: AdminShellStats = {
  pendingQuotes: 0,
  unpaidInvoices: 0,
  activeShipments: 0,
  clientCount: 0,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-url-path") || "";
  const isLoginSurface =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login?") ||
    pathname.startsWith("/login?");
  const isPrint = pathname.startsWith("/admin/print");

  const adminUser = await getAdminSessionUser();

  if (!isLoginSurface && !isPrint && !adminUser) {
    redirect("/admin/login");
  }

  let stats = emptyStats;
  if (adminUser && !isLoginSurface && !isPrint) {
    const [pendingQuotes, unpaidInvoices, activeShipments, clientCount] = await Promise.all([
      prisma.shipmentRequest.count({ where: { status: "PENDING_DROPOFF" } }),
      prisma.invoice.count({ where: { status: "UNPAID" } }),
      prisma.package.count({ where: { status: { not: "DELIVERED" } } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
    ]);
    stats = { pendingQuotes, unpaidInvoices, activeShipments, clientCount };
  }

  return <AdminShell stats={stats}>{children}</AdminShell>;
}
