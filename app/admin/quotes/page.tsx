import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileText, LayoutDashboard } from "lucide-react";
import QuoteTable from "@/components/QuoteTable";

export const dynamic = "force-dynamic";

export default async function AdminQuotesQueuePage() {
  const [pendingList, otherList] = await Promise.all([
    prisma.shipmentRequest.findMany({
      where: { status: "PENDING_DROPOFF" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shipmentRequest.findMany({
      where: { status: { not: "PENDING_DROPOFF" } },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
  ]);

  const ordered = [...pendingList, ...otherList];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-mex-dark flex items-center gap-3">
            <FileText className="h-8 w-8 shrink-0 text-mex-orange" />
            Quote queue
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-gray-600">
            Pre-registrations from the public form and client portal. Use{" "}
            <strong>Weigh &amp; Invoice</strong> when the box arrives in Doral — that creates tracking and billing.
          </p>
          <p className="mt-2 text-sm font-bold text-mex-orange">
            {pendingList.length} pending drop-off{pendingList.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-mex-dark shadow-sm transition hover:bg-gray-50"
        >
          <LayoutDashboard size={18} />
          Operations overview
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-black text-mex-dark">All pre-registrations</h2>
          <p className="text-xs font-medium text-gray-500">
            Pending requests are listed first, then recent pipeline history (invoiced / paid).
          </p>
        </div>
        <QuoteTable quotes={ordered} />
      </div>
    </div>
  );
}
