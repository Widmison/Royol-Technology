import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Package as PackageIcon, Plane, Ship, Truck, ArrowRight, X } from "lucide-react";

import ShipmentActionMenu from "@/components/ShipmentActionMenu";

export const dynamic = "force-dynamic";

type ShipmentsFilter = "active" | "delivered_week" | "customs" | undefined;

export default async function AdminShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: raw } = await searchParams;
  const filter = raw as ShipmentsFilter;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  let where: Prisma.PackageWhereInput = {};
  let filterTitle = "All packages";

  if (filter === "active") {
    where = { status: { not: "DELIVERED" } };
    filterTitle = "Active (not delivered)";
  } else if (filter === "delivered_week") {
    where = { status: "DELIVERED", updatedAt: { gte: weekAgo } };
    filterTitle = "Delivered in the last 7 days";
  } else if (filter === "customs") {
    where = { status: "CUSTOMS" };
    filterTitle = "Containers at port (customs status)";
  }

  const packages = await prisma.package.findMany({
    where,
    include: {
      request: true,
      events: { orderBy: { date: "desc" }, take: 5 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const chip = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition ${
        active
          ? "bg-mex-blue text-white shadow-md"
          : "border border-gray-200 bg-white text-gray-600 hover:border-mex-blue/40 hover:text-mex-blue"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-mex-dark flex items-center gap-3 flex-wrap">
          <PackageIcon className="text-mex-blue shrink-0" />
          Shipments
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Full master list — scroll horizontally on small screens to see every column.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chip("/admin/shipments", "All", filter == null)}
          {chip("/admin/shipments?filter=active", "Active", filter === "active")}
          {chip("/admin/shipments?filter=delivered_week", "Delivered (7d)", filter === "delivered_week")}
          {chip("/admin/shipments?filter=customs", "Customs", filter === "customs")}
        </div>
        {filter && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-mex-blue/20 bg-blue-50/80 px-4 py-3 text-sm font-medium text-mex-dark">
            <span>
              Viewing: <strong>{filterTitle}</strong>
            </span>
            <Link
              href="/admin/shipments"
              className="inline-flex items-center gap-1 font-bold text-mex-blue hover:underline"
            >
              <X className="h-4 w-4" aria-hidden />
              Clear filter
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4 sm:p-5 font-bold whitespace-nowrap">Tracking ID</th>
                <th className="p-4 sm:p-5 font-bold min-w-[140px]">Client</th>
                <th className="p-4 sm:p-5 font-bold min-w-[160px]">Route &amp; ETA</th>
                <th className="p-4 sm:p-5 font-bold min-w-[140px]">Status</th>
                <th className="p-4 sm:p-5 font-bold min-w-[180px]">Last location</th>
                <th className="p-4 sm:p-5 font-bold text-right min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                    No packages yet. Use <strong>Weigh &amp; Invoice</strong> in the{" "}
                    <Link href="/admin/quotes" className="font-bold text-mex-blue underline">
                      quote queue
                    </Link>{" "}
                    when a box arrives.
                  </td>
                </tr>
              ) : (
                packages.map((pkg: any) => {
                  const method = pkg.request.shippingMethod?.toLowerCase() || "";
                  const isAir = method.includes("air") || method.includes("avyon");
                  const isGround = method.includes("ground");
                  const MethodIcon = isGround ? Truck : isAir ? Plane : Ship;
                  const etaText = isGround
                    ? "Ground / regional"
                    : isAir
                      ? "5–7 days (air)"
                      : "14–21 days (ocean)";
                  const lastEv = pkg.events?.[0];

                  return (
                    <tr key={pkg.id} className="hover:bg-gray-50 align-top">
                      <td className="p-4 sm:p-5 font-black text-mex-dark text-base tracking-wider uppercase whitespace-nowrap">
                        {pkg.trackingId}
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-mex-dark">
                          {pkg.request.firstName} {pkg.request.lastName}
                        </div>
                        <div className="text-gray-500 text-xs font-medium mt-0.5 break-all">{pkg.request.phone}</div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-gray-700 flex items-center gap-2 flex-wrap">
                          USA <ArrowRight size={14} className="text-gray-400 shrink-0" /> Haiti
                        </div>
                        <div
                          className={`text-[10px] font-black mt-1.5 flex items-center gap-1.5 uppercase tracking-wider ${isAir ? "text-mex-blue" : "text-gray-500"}`}
                        >
                          <MethodIcon size={14} /> ETA: {etaText}
                        </div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-800">
                          {String(pkg.status).split("_").join(" ")}
                        </span>
                        {lastEv && (
                          <div className="mt-1.5 text-[10px] font-medium text-gray-400">
                            Updated {new Date(lastEv.date).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 text-xs font-medium text-gray-700">
                        {lastEv ? (
                          <>
                            <div className="font-bold text-mex-dark line-clamp-2">{lastEv.location}</div>
                            {lastEv.description && (
                              <div className="mt-0.5 line-clamp-2 text-gray-500">{lastEv.description}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">No events yet</span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <ShipmentActionMenu pkg={pkg} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
