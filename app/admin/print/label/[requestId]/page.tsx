import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MEX509_WAREHOUSE } from "@/lib/mex509Warehouse";
import { getSiteUrlString } from "@/lib/site";
import PrintChrome from "@/components/print/PrintChrome";
import { destinationCountryLabel } from "@/lib/shipmentRouteLabel";

export const dynamic = "force-dynamic";

export default async function AdminPrintLabelPage({
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
  if (!pkg) notFound();

  const trackUrl = `${getSiteUrlString()}/track?id=${encodeURIComponent(pkg.trackingId)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(trackUrl)}`;

  return (
    <>
      <style>{`
        @page { size: 4in 6in; margin: 0.2in; }
        @media print {
          html, body { background: white !important; height: auto !important; }
          .label-print-root { page-break-after: avoid; page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      <div className="label-print-root min-h-screen bg-slate-100 print:min-h-0 print:bg-white">
        <PrintChrome />

        <div className="mx-auto flex min-h-[576px] max-w-[384px] flex-col bg-white p-4 shadow-xl print:mx-0 print:max-w-none print:min-h-0 print:shadow-none print:p-0">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-mex-dark via-[#0f172a] to-mex-blue p-4 text-white print:rounded-lg">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mex-orange/30 blur-2xl print:hidden" />
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/70">MEX509 warehouse</p>
            <p className="mt-1 text-xl font-black tracking-tight">
              MEX<span className="text-mex-orange">509</span>
            </p>
            <p className="mt-3 font-mono text-2xl font-black tracking-[0.15em] text-white">{pkg.trackingId}</p>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 border-b-2 border-dashed border-gray-200 pb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">Scan to track</p>
              <div className="relative mt-1 h-[100px] w-[100px] overflow-hidden rounded-lg border border-gray-200 bg-white p-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- external QR API; print-only */}
                <img src={qrSrc} alt="" width={92} height={92} className="h-full w-full object-contain" />
              </div>
            </div>
            <div className="text-right text-[10px] leading-tight text-gray-500">
              <p className="font-bold text-gray-700">Air / ocean / ground</p>
              <p className="mt-2 font-black text-mex-dark">{r.shippingMethod}</p>
              <p className="mt-2">
                <span className="text-gray-400">Weight</span>
                <br />
                <span className="text-sm font-black text-mex-dark">{row.actualWeightLbs} lbs</span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex-1 space-y-4 text-sm">
            <section>
              <p className="text-[9px] font-black uppercase tracking-wider text-mex-orange">Ship from</p>
              <p className="font-bold text-mex-dark">{MEX509_WAREHOUSE.name}</p>
              <p className="text-xs leading-snug text-gray-700">
                {MEX509_WAREHOUSE.line1}, {MEX509_WAREHOUSE.line2}
              </p>
            </section>
            <section className="rounded-xl border-2 border-mex-blue/20 bg-blue-50/40 p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-mex-blue">Deliver to</p>
              <p className="text-lg font-black leading-tight text-mex-dark">
                {r.firstName} {r.lastName}
              </p>
              <p className="text-xs font-bold text-gray-700">{r.phone}</p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-gray-800">
                {r.address}
                <br />
                {r.city}, {r.state} {r.zipCode}
                {r.destinationCountry ? (
                  <>
                    <br />
                    {r.destinationCountry}
                  </>
                ) : null}
              </p>
            </section>
            <section className="rounded-lg bg-gray-50 p-2 text-[10px] text-gray-600">
              <span className="font-bold text-gray-800">Contents:</span> {r.description || "—"} ·{" "}
              <span className="font-bold text-gray-800">Category:</span> {r.category}
            </section>
          </div>

          <div className="mt-auto border-t border-gray-200 pt-3 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
            Handle with care · {destinationCountryLabel(r.destinationCountry)}
          </div>
        </div>
      </div>
    </>
  );
}
