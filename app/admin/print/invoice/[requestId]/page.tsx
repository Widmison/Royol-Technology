import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MEX509_WAREHOUSE } from "@/lib/mex509Warehouse";
import { getSiteUrlString } from "@/lib/site";
import PrintChrome from "@/components/print/PrintChrome";

export const dynamic = "force-dynamic";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function AdminPrintInvoicePage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const row = await prisma.invoice.findUnique({
    where: { requestId },
    include: {
      request: { include: { package: true } },
    },
  });

  if (!row) notFound();

  const r = row.request;
  const pkg = r.package;
  const issued = new Date(row.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const invNo = `MEX-INV-${row.id.slice(-10).toUpperCase()}`;
  const trackUrl = pkg
    ? `${getSiteUrlString()}/track?id=${encodeURIComponent(pkg.trackingId)}`
    : getSiteUrlString();

  return (
    <div className="relative min-h-screen bg-white text-mex-dark print:min-h-0 print:bg-white">
      <PrintChrome />

      <div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
        <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-mex-orange/10 blur-3xl" />
        <div className="absolute -left-10 top-40 h-64 w-64 rounded-full bg-mex-blue/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-10 print:max-w-none print:px-8 print:py-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-4 border-mex-orange pb-6 print:mb-6 print:pb-4">
          <div>
            <p className="text-3xl font-black tracking-tight text-mex-blue print:text-2xl">
              MEX<span className="text-mex-orange">509</span>
            </p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Shipping services</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Invoice</p>
            <p className="font-mono text-lg font-black text-mex-dark">{invNo}</p>
            <p className="text-sm text-gray-600">Issued {issued}</p>
            <p
              className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                row.status === "PAID" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"
              }`}
            >
              {row.status === "PAID" ? "Paid" : "Payment due"}
            </p>
          </div>
        </header>

        <div className="mb-8 grid gap-8 sm:grid-cols-2 print:mb-6 print:gap-6">
          <section>
            <h2 className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Bill to</h2>
            <p className="text-lg font-black text-mex-dark">
              {r.firstName} {r.lastName}
            </p>
            <p className="text-sm font-medium text-gray-700">{r.phone}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-800">
              {r.address}
              <br />
              {r.city}, {r.state} {r.zipCode}
              {r.destinationCountry ? (
                <>
                  <br />
                  <span className="font-bold">{r.destinationCountry}</span>
                </>
              ) : null}
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Warehouse</h2>
            <p className="text-sm font-bold text-mex-dark">{MEX509_WAREHOUSE.name}</p>
            <p className="text-sm leading-relaxed text-gray-700">
              {MEX509_WAREHOUSE.line1}
              <br />
              {MEX509_WAREHOUSE.line2}
            </p>
            <p className="mt-2 text-xs text-mex-blue">{MEX509_WAREHOUSE.website}</p>
          </section>
        </div>

        <section className="mb-8 rounded-2xl border border-gray-200 bg-gray-50/80 p-5 print:border-gray-300 print:bg-transparent">
          <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Shipment</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold text-gray-500">Tracking</dt>
              <dd className="font-mono text-base font-black tracking-wider text-mex-blue">
                {pkg?.trackingId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-gray-500">Route</dt>
              <dd className="font-bold text-mex-dark">
                {r.departure} → Haiti
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-gray-500">Method</dt>
              <dd className="font-bold">{r.shippingMethod}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-gray-500">Category</dt>
              <dd>{r.category}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold text-gray-500">Contents (client)</dt>
              <dd className="text-gray-800">{r.description || "—"}</dd>
            </div>
          </dl>
        </section>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-mex-dark text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
              <th className="py-3 pr-4">Description</th>
              <th className="w-28 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4 pr-4">
                <p className="font-bold text-mex-dark">International freight</p>
                <p className="text-xs text-gray-600">
                  Actual weight billed: <strong>{row.actualWeightLbs} lbs</strong> · {r.shippingMethod}
                </p>
              </td>
              <td className="py-4 text-right font-black text-mex-dark">{money(row.totalAmount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                Total due
              </td>
              <td className="pt-4 text-right text-xl font-black text-mex-orange">{money(row.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <footer className="mt-12 border-t border-gray-200 pt-6 text-center text-xs leading-relaxed text-gray-500 print:mt-8">
          <p className="font-bold text-mex-dark">Thank you for shipping with MEX509.</p>
          <p className="mt-1">
            Track this package anytime:{" "}
            <span className="break-all font-mono text-mex-blue">{trackUrl}</span>
          </p>
          {row.status !== "PAID" ? (
            <p className="mt-3 rounded-xl bg-mex-blue/5 px-4 py-3 font-medium text-mex-dark">
              Payment link (share with client):{" "}
              <span className="break-all font-mono text-sm">{`${getSiteUrlString()}/pay/${row.id}`}</span>
            </p>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
