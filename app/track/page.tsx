import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Search, CheckCircle, Truck, Package as PackageIcon, 
  MapPin, CreditCard, Receipt, AlertCircle 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const resolvedParams = await searchParams;
  const trackingId = resolvedParams.id?.toUpperCase();

  let pkg = null;
  let error = null;

  // ONLY fetch from database if the user actually typed a tracking number!
  if (trackingId) {
    pkg = await prisma.package.findUnique({
      where: { trackingId },
      include: {
        events: { orderBy: { date: 'desc' } }, // Newest events first
        request: { include: { invoice: true } }
      }
    });

    if (!pkg) {
      error = "Tracking number not found. Please check your ID and try again.";
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================== */}
        {/* 1. HERO SEARCH SECTION (Always Visible)      */}
        {/* ========================================== */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black italic text-mex-blue uppercase mb-4">Track Your Package</h1>
          
          {/* Native HTML Form - Updates the URL instantly to ?id=MEX... */}
          <form action="/track" method="GET" className="bg-white p-2 rounded-xl shadow-sm flex max-w-2xl mx-auto border border-gray-200 focus-within:ring-2 focus-within:ring-mex-orange transition-all">
            <div className="flex items-center pl-4 text-gray-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              name="id"
              required
              defaultValue={trackingId || ""} 
              placeholder="Enter Tracking ID (e.g. MEX12345)"
              className="w-full pl-3 pr-4 py-3 focus:outline-none text-mex-dark font-black tracking-wider uppercase placeholder:font-medium placeholder:tracking-normal"
            />
            <button type="submit" className="bg-mex-orange text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-md">
              Track
            </button>
          </form>

          {/* Error Message if tracking ID is wrong */}
          {error && (
            <div className="mt-6 flex justify-center animate-in fade-in zoom-in duration-300">
              <span className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-red-100">
                <AlertCircle size={18} /> {error}
              </span>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 2. REAL TRACKING DATA (Hidden until searched) */}
        {/* ========================================== */}
        {pkg && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-500">
            
            {/* TRACKING TIMELINE */}
            {/* Note: It spans 3 columns if there is NO invoice, 2 columns if there IS an invoice */}
            <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-8 ${pkg.request.invoice ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Tracking Number</p>
                  <h2 className="text-xl font-black text-mex-dark tracking-tight">{pkg.trackingId}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium mb-1">Current Status</p>
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-mex-blue px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                    {pkg.status === 'DELIVERED' ? <CheckCircle size={14} /> : <span className="w-2 h-2 rounded-full bg-mex-blue animate-pulse"></span>}
                    {String(pkg.status).replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              {/* Dynamic Timeline Render */}
              <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-gray-100">
                
                {pkg.events.length === 0 ? (
                  <div className="text-gray-500 font-medium py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">
                    No tracking events recorded yet. Check back soon!
                  </div>
                ) : (
                  pkg.events.map((event: any, index: number) => {
                    const isLatest = index === 0; // The first item in the array is the newest event!

                    return (
                      <div key={event.id} className={`relative z-10 flex gap-6 items-start ${!isLatest && 'opacity-60'}`}>
                        
                        {/* Dynamic Icon based on Status */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white text-white shrink-0 absolute -left-[40px] ${isLatest ? 'bg-mex-orange shadow-lg shadow-orange-500/30' : 'bg-gray-400'}`}>
                          {event.status === 'DELIVERED' ? <CheckCircle size={18} /> : 
                           event.status === 'IN_TRANSIT' ? <Truck size={18} /> :
                           event.status === 'READY_FOR_PICKUP' ? <MapPin size={18} /> :
                           <PackageIcon size={18} />}
                        </div>
                        
                        <div className={`flex-1 ${isLatest ? 'bg-orange-50/50 p-4 rounded-2xl border border-mex-orange/20 -mt-3' : ''}`}>
                          <div className={`font-bold text-lg ${isLatest ? 'text-mex-orange' : 'text-mex-dark'}`}>
                            {String(event.status).replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <strong className="text-gray-800">{event.location}</strong>
                            {event.description && ` • ${event.description}`}
                          </div>
                          <div className={`text-xs font-bold mt-2 ${isLatest ? 'text-orange-400' : 'text-gray-400'}`}>
                            {new Date(event.date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ========================================== */}
            {/* 3. INVOICE MOCKUP (Hidden if no invoice!)  */}
            {/* ========================================== */}
            {pkg.request.invoice && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
                <h2 className="text-lg font-black text-mex-dark border-b border-gray-100 pb-4 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Receipt className="text-mex-orange w-5 h-5" />
                  Invoice Summary
                </h2>
                
                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Status:</span>
                    {pkg.request.invoice.status === 'PAID' ? (
                       <span className="font-bold text-green-600 flex items-center gap-1"><CheckCircle size={14}/> PAID</span>
                    ) : (
                       <span className="font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14}/> UNPAID</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Weight:</span>
                    <span className="font-bold text-mex-dark">{pkg.request.invoice.actualWeightLbs} LBS</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping Method:</span>
                    <span className="font-bold text-mex-dark">{pkg.request.shippingMethod}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3">
                    <span className="font-bold text-gray-800">Total Due:</span>
                    <span className="text-2xl font-black text-mex-orange">${pkg.request.invoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {pkg.request.invoice.status === 'UNPAID' ? (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <Link href={`/pay/${pkg.request.invoice.id}`} className="w-full bg-mex-dark text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md">
                      <CreditCard size={18} />
                      Pay Securely Online
                    </Link>
                    <p className="text-xs text-center text-gray-400 mt-5 font-medium">
                      Payments must be cleared before pickup.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl text-center animate-in fade-in duration-500">
                    <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                    <p className="font-black text-lg">Invoice Paid</p>
                    <p className="text-xs mt-1 font-medium">Thank you for shipping with MEX509!</p>
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}