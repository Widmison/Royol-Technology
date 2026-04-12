import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminShell, { type AdminShellStats } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingQuotes, unpaidInvoices, activeShipments, clientCount] = await Promise.all([
    prisma.shipmentRequest.count({ where: { status: "PENDING_DROPOFF" } }),
    prisma.invoice.count({ where: { status: "UNPAID" } }),
    prisma.package.count({ where: { status: { not: "DELIVERED" } } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
  ]);

  const stats: AdminShellStats = {
    pendingQuotes,
    unpaidInvoices,
    activeShipments,
    clientCount,
  };

  return <AdminShell stats={stats}>{children}</AdminShell>;
}
