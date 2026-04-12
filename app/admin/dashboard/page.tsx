import type { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package as PackageIcon, FileText, Plus, MapPin, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [pendingQuotesCount, activeShipmentsCount, deliveredWeekCount, customsCount, recentPackages] =
    await Promise.all([
      prisma.shipmentRequest.count({ where: { status: "PENDING_DROPOFF" } }),
      prisma.package.count({ where: { status: { not: "DELIVERED" } } }),
      prisma.package.count({
        where: { status: "DELIVERED", updatedAt: { gte: weekAgo } },
      }),
      prisma.package.count({ where: { status: "CUSTOMS" } }),
      prisma.package.findMany({
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: { request: true },
      }),
    ]);

  const statCard = (
    href: string,
    icon: ReactNode,
    iconBg: string,
    value: number | string,
    label: string,
    valueClass = "text-mex-dark"
  ) => (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-mex-blue/30 hover:shadow-md"
    >
      <div className={`shrink-0 rounded-xl p-3 ${iconBg}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className={`text-2xl font-black tabular-nums sm:text-3xl ${valueClass} truncate`}>{value}</div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="mt-1 text-xs font-bold text-mex-blue opacity-0 transition group-hover:opacity-100">
          Open →
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-mex-dark sm:text-3xl">Operations overview</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Snapshot of volume — click a tile to jump to the right workspace.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/admin/quotes"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-mex-orange/40 bg-orange-50 px-5 py-3 text-sm font-black text-mex-orange transition hover:bg-mex-orange hover:text-white"
          >
            <FileText size={18} />
            Quote queue ({pendingQuotesCount})
          </Link>
          <Link
            href="/quote"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-mex-orange px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-700"
          >
            <Plus size={20} /> New public quote
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCard(
          "/admin/shipments?filter=active",
          <PackageIcon size={26} className="text-mex-blue" />,
          "bg-blue-50",
          activeShipmentsCount,
          "Active shipments"
        )}
        {statCard(
          "/admin/quotes",
          <FileText size={26} className="text-mex-orange" />,
          "bg-orange-50",
          pendingQuotesCount,
          "Pending drop-offs"
        )}
        {statCard(
          "/admin/shipments?filter=delivered_week",
          <CheckCircle size={26} className="text-green-600" />,
          "bg-green-50",
          deliveredWeekCount,
          "Delivered this week"
        )}
        {statCard(
          "/admin/shipments?filter=customs",
          <MapPin size={26} className="text-purple-600" />,
          "bg-purple-50",
          customsCount,
          "Containers at port"
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-mex-dark">
            <MapPin className="h-5 w-5 shrink-0 text-mex-blue" />
            Latest package activity
          </h2>
          <Link href="/admin/shipments" className="shrink-0 text-sm font-bold text-mex-blue hover:underline">
            All shipments →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[520px] w-full text-left">
            <thead className="border-b border-gray-100 bg-white text-xs font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="p-4 font-bold">Tracking</th>
                <th className="p-4 font-bold">Client</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {recentPackages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center font-medium text-gray-500">
                    No packages yet. Use <strong>Weigh &amp; Invoice</strong> in the{" "}
                    <Link href="/admin/quotes" className="font-bold text-mex-blue hover:underline">
                      quote queue
                    </Link>{" "}
                    when a box arrives.
                  </td>
                </tr>
              ) : (
                recentPackages.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap p-4 font-black tracking-wide text-mex-dark">
                      <Link
                        href="/admin/shipments"
                        className="hover:text-mex-blue hover:underline"
                      >
                        {pkg.trackingId}
                      </Link>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {pkg.request.firstName} {pkg.request.lastName}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-800">
                        {String(pkg.status).split("_").join(" ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
