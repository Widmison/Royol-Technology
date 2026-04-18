import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Receipt, CheckCircle, Copy, AlertCircle, Info } from "lucide-react";
import AdminPrintDocumentLinks from "@/components/admin/AdminPrintDocumentLinks";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { request: { include: { package: true } } },
    orderBy: { createdAt: "desc" },
  });

  const unpaidInvoices = invoices.filter((inv: any) => inv.status === "UNPAID");
  const paidInvoices = invoices.filter((inv: any) => inv.status === "PAID");

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-black text-mex-dark sm:text-3xl">
          <Receipt className="h-8 w-8 shrink-0 text-mex-blue" aria-hidden />
          Financial overview
        </h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Awaiting payment first, then recently paid — scroll vertically; each row is a card.
        </p>
        <div className="mt-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-gray-700">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-mex-blue" aria-hidden />
          <p>
            <strong className="text-mex-dark">Documents.</strong> Invoice and warehouse label use your live database
            record. Open a link, then use <strong className="text-mex-dark">Print → Save as PDF</strong> to download.
          </p>
        </div>
      </div>

      {/* Awaiting payment — same shell as other admin cards (top red accent) */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm border-t-4 border-t-red-500">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:p-6">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-mex-dark">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden />
            Awaiting payment
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-500">
            {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {unpaidInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="font-medium">All invoices are paid.</p>
            </div>
          ) : (
            unpaidInvoices.map((inv: any) => (
              <article key={inv.id} className="p-4 transition-colors hover:bg-gray-50 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-mex-dark">
                      {inv.request.firstName} {inv.request.lastName}
                    </p>
                    <p className="mt-0.5 break-all text-xs font-medium text-gray-500">{inv.request.phone}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                        {inv.actualWeightLbs} lbs
                      </span>
                      <span className="text-xl font-black tabular-nums text-red-600 sm:text-2xl">
                        ${inv.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0 lg:border-l lg:border-t-0 lg:pl-4">
                      {inv.request.package ? (
                        <AdminPrintDocumentLinks requestId={inv.request.id} layout="row" />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                      <Link
                        href={`/pay/${inv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-mex-blue transition-colors hover:bg-blue-100"
                      >
                        <Copy className="h-4 w-4 shrink-0" aria-hidden />
                        Pay link
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Recently paid — green top accent, matches admin pattern */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm border-t-4 border-t-green-500">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:p-6">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-mex-dark">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500" aria-hidden />
            Recently paid
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-500">
            {paidInvoices.length} paid in this list
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {paidInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="font-medium">No paid invoices yet.</p>
            </div>
          ) : (
            paidInvoices.map((inv: any) => (
              <article key={inv.id} className="p-4 transition-colors hover:bg-gray-50 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-mex-dark">
                        {inv.request.firstName} {inv.request.lastName}
                      </p>
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                        Paid
                      </span>
                    </div>
                    {inv.request.package?.trackingId ? (
                      <p className="mt-1.5 font-mono text-sm font-bold tracking-wide text-mex-blue">
                        {inv.request.package.trackingId}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-gray-400">No tracking on file</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:justify-end">
                    <span className="text-xl font-black tabular-nums text-green-600 sm:text-2xl">
                      ${inv.totalAmount.toFixed(2)}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0 lg:border-l lg:border-t-0 lg:pl-4">
                      {inv.request.package ? (
                        <AdminPrintDocumentLinks requestId={inv.request.id} layout="row" />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
