import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { CheckCircle, CreditCard, Receipt, MapPin, Package, ShieldCheck } from "lucide-react";

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

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden">
        
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
              <div className="text-3xl font-black text-amber-800 tracking-wider py-2">{trackingNumber}</div>
              <p className="text-sm text-amber-900/80 mt-3 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck size={16} /> Pay below to clear your invoice; you can already use this ID on /track.
              </p>
            </div>
          )}

          {isPaid && trackingNumber && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center animate-in zoom-in duration-500">
              <p className="text-green-800 font-bold mb-2 uppercase text-sm tracking-widest">Official Tracking Number</p>
              <div className="text-4xl font-black text-green-600 tracking-wider py-2">{trackingNumber}</div>
              <p className="text-sm text-green-700 mt-3 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck size={16} /> Save this number to track your package
              </p>
            </div>
          )}

          {/* ORDER DETAILS */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={18}/> Route</span>
              <span className="font-black text-mex-dark">{invoice.request.departure} &rarr; Haiti</span>
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

          {/* IF UNPAID: SHOW PAYMENT BUTTON */}
          {!isPaid && (
            <form action="/api/pay" method="POST" className="pt-4">
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <button type="submit" className="w-full bg-mex-orange text-white font-black text-lg px-8 py-5 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 hover:gap-4">
                <CreditCard size={24} /> Pay Securely Now
              </button>
              <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1">
                <ShieldCheck size={14}/> 256-bit Secure Encryption (Simulation Mode)
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}