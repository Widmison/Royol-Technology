import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Receipt, CheckCircle, Copy, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { request: true },
    orderBy: { createdAt: "desc" },
  });

  const unpaidInvoices = invoices.filter((inv: any) => inv.status === "UNPAID");
  const paidInvoices = invoices.filter((inv: any) => inv.status === "PAID");

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-mex-dark flex items-center gap-3 flex-wrap">
          <Receipt className="text-mex-blue shrink-0" />
          Financial overview
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Pending and paid invoices — swipe tables sideways on phones to see all columns.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col border-t-4 border-t-red-500">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-lg text-mex-dark flex items-center gap-2">
              <AlertCircle className="text-red-500 h-5 w-5 shrink-0" />
              Awaiting payment
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[480px]">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold">Client</th>
                  <th className="p-4 font-bold whitespace-nowrap">Lbs</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold text-right min-w-[120px]">Pay link</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {unpaidInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500 font-medium">
                      All invoices are paid.
                    </td>
                  </tr>
                ) : (
                  unpaidInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50 align-top">
                      <td className="p-4">
                        <div className="font-bold text-mex-dark">
                          {inv.request.firstName} {inv.request.lastName}
                        </div>
                        <div className="text-gray-500 text-xs break-all">{inv.request.phone}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-600 whitespace-nowrap">{inv.actualWeightLbs} lbs</td>
                      <td className="p-4 font-black text-red-600 whitespace-nowrap">${inv.totalAmount.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/pay/${inv.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-end gap-1 text-mex-blue bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg font-bold text-xs transition-colors"
                        >
                          <Copy size={14} /> Pay link
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col border-t-4 border-t-green-500">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-lg text-mex-dark flex items-center gap-2">
              <CheckCircle className="text-green-500 h-5 w-5 shrink-0" />
              Recently paid
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[360px]">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold">Client</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {paidInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500 font-medium">
                      No paid invoices yet.
                    </td>
                  </tr>
                ) : (
                  paidInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-mex-dark">
                        {inv.request.firstName} {inv.request.lastName}
                      </td>
                      <td className="p-4 font-black text-green-600 whitespace-nowrap">${inv.totalAmount.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                          Paid
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
    </div>
  );
}
