import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import ClientTrackingIdLink from "@/components/ClientTrackingIdLink";
import { Banknote, CheckCircle, Receipt, MapPin, Package, ShieldCheck, Smartphone } from "lucide-react";
import { MOBILE_MONEY_QR } from "@/lib/paymentPublicConfig";
import { shipmentRouteLabel } from "@/lib/shipmentRouteLabel";

export const dynamic = "force-dynamic";

// NEXT.JS 15 FIX: params must be treated as a Promise
export default async function ClientPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Await the parameters before using the ID!
  const resolvedParams = await params;

  // 2. Fetch the invoice using the securely resolved ID
  const invoice = await prisma.invoice.findUnique({
    where: { id: resolvedParams.id },
    include: { 
      request: {
        include: { package: true } 
      } 
    },
  });

  if (!invoice) return notFound();

  const isPaid = invoice.status === "PAID";
  const trackingNumber = invoice.request.package?.trackingId;

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans">
      
      {/* LOGO */}
      <div className="mb-8 flex justify-center">
        <BrandLogo href="/" width={240} height={80} alt="MEX509" className="h-12 w-auto object-left" prefetch={false} />
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden">
        
        {/* DYNAMIC HEADER */}
        <div className={`p-8 text-center ${isPaid ? 'bg-green-600' : 'bg-mex-dark'} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 flex flex-col items-center">
            {isPaid ? (
              <CheckCircle className="h-16 w-16 text-white mb-4" />
            ) : (
              <Receipt className="h-16 w-16 text-mex-orange mb-4" />
            )}
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {isPaid ? "Payment Successful!" : "Invoice Summary"}
            </h1>
            <p className="font-medium text-white/80">
              {isPaid ? "Your package is now being processed." : `Billed to: ${invoice.request.firstName} ${invoice.request.lastName}`}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6">
          
          {/* Tracking: show as soon as the package row exists (usually created at warehouse intake). */}
          {!isPaid && trackingNumber && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-bold mb-2 uppercase text-sm tracking-widest">
                Your tracking number
              </p>
              <div className="py-2">
                <ClientTrackingIdLink
                  trackingId={trackingNumber}
                  className="text-3xl text-amber-800 tracking-wider block text-center"
                />
              </div>
              <p className="text-sm text-amber-900/80 mt-3 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck size={16} /> Send payment using the options below; our team will mark your invoice paid after we verify funds. Track this ID anytime on /track.
              </p>
            </div>
          )}

          {isPaid && trackingNumber && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center animate-in zoom-in duration-500">
              <p className="text-green-800 font-bold mb-2 uppercase text-sm tracking-widest">Official Tracking Number</p>
              <div className="py-2">
                <ClientTrackingIdLink
                  trackingId={trackingNumber}
                  className="text-4xl text-green-600 tracking-wider block text-center"
                />
              </div>
              <p className="text-sm text-green-700 mt-3 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck size={16} /> Save this number to track your package
              </p>
              {invoice.paidVia && (
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-green-800/90">
                  Payment method recorded:{" "}
                  {invoice.paidVia === "NATCASH"
                    ? "NatCash"
                    : invoice.paidVia === "MONCASH"
                      ? "MonCash"
                      : invoice.paidVia === "CASH"
                        ? "Cash (office)"
                        : invoice.paidVia === "CARD"
                          ? "Card / online"
                          : invoice.paidVia}
                </p>
              )}
            </div>
          )}

          {/* ORDER DETAILS */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={18}/> Route</span>
              <span className="font-black text-mex-dark">
                {shipmentRouteLabel(invoice.request.departure, invoice.request.destinationCountry)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-gray-500 font-bold flex items-center gap-2"><Package size={18}/> Weight</span>
              <span className="font-black text-mex-dark">{invoice.actualWeightLbs} LBS</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-800 font-black text-xl">Total Due</span>
              <span className="font-black text-3xl text-mex-blue">${invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* IF UNPAID: QR + instructions only — staff records payment in Admin → Invoices */}
          {!isPaid && (
            <div className="space-y-6 pt-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-mex-dark">
                <p className="font-black">How payment works</p>
                <p className="mt-1 font-medium leading-relaxed text-gray-700">
                  Use MonCash, NatCash, or cash below.{" "}
                  <strong>MEX509 staff verifies your payment</strong> and marks this invoice paid in our system — you cannot
                  self-confirm here. Card payments may be added later.
                </p>
                <p className="mt-2 text-xs font-medium text-gray-600">
                  Questions? Email{" "}
                  <a href="mailto:info@mex509.com" className="font-bold text-mex-blue underline">
                    info@mex509.com
                  </a>{" "}
                  with this page link or invoice ID.
                </p>
              </div>

              <div>
                <p className="text-center text-sm font-black uppercase tracking-wide text-gray-500">Pay this invoice</p>
                <p className="mt-1 text-center text-xs font-medium text-gray-400">
                  Scan the QR or send <span className="font-bold text-mex-dark">${invoice.totalAmount.toFixed(2)} USD</span>{" "}
                  to the account shown. Include your name so we can match your payment.
                </p>
              </div>

              {/* MonCash */}
              <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-5 space-y-4">
                <div className="flex items-center gap-2 text-sky-900">
                  <Smartphone className="shrink-0" size={22} />
                  <span className="text-lg font-black">{MOBILE_MONEY_QR.moncash.label}</span>
                </div>
                <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-white bg-white shadow-inner">
                  <Image
                    src={MOBILE_MONEY_QR.moncash.imageSrc}
                    alt="MonCash QR code"
                    fill
                    sizes="240px"
                    className="object-contain p-2"
                    priority
                  />
                </div>
                <div className="text-center text-sm font-semibold text-sky-950">
                  <p>{MOBILE_MONEY_QR.moncash.recipient}</p>
                  <p className="mt-1 font-mono text-base font-black tracking-wide">{MOBILE_MONEY_QR.moncash.phoneDisplay}</p>
                </div>
              </div>

              {/* NatCash */}
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-950">
                  <Smartphone className="shrink-0" size={22} />
                  <span className="text-lg font-black">{MOBILE_MONEY_QR.natcash.label}</span>
                </div>
                <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-white bg-white shadow-inner">
                  <Image
                    src={MOBILE_MONEY_QR.natcash.imageSrc}
                    alt="NatCash QR code"
                    fill
                    sizes="240px"
                    className="object-contain p-2"
                  />
                </div>
                <div className="text-center text-sm font-semibold text-emerald-950">
                  <p>{MOBILE_MONEY_QR.natcash.recipient}</p>
                  <p className="mt-1 font-mono text-base font-black tracking-wide">{MOBILE_MONEY_QR.natcash.phoneDisplay}</p>
                </div>
              </div>

              {/* Cash */}
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-950">
                  <Banknote className="shrink-0" size={22} />
                  <span className="text-lg font-black">Cash at MEX509</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-amber-950/90">
                  Pay in person at our counter (e.g. Doral warehouse). Reference:{" "}
                  <span className="font-mono font-black text-amber-950">{invoice.id.slice(0, 8)}…</span> Staff records payment on
                  their dashboard after receiving cash.
                </p>
              </div>

              <p className="flex items-start justify-center gap-2 text-center text-xs font-medium leading-snug text-gray-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                You will receive an email and portal notification when your invoice is marked paid.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}