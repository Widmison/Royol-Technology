import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { sharePreviewOgImage } from "@/lib/share-image";
import { Search, AlertCircle } from "lucide-react";
import TrackingDetailView from "@/components/tracking/TrackingDetailView";
import { shouldOmitClientTrackingEvent, stripManualAdminTrackingSuffix } from "@/lib/trackingClientTimeline";

export const metadata: Metadata = {
  title: "Track your package",
  description:
    "Track MEX509 shipments in real time. Enter your tracking ID to see status, location updates, and delivery progress for cargo to Haiti.",
  alternates: { canonical: "/track" },
  openGraph: {
    title: "Package tracking | MEX509",
    description: "Look up your MEX509 tracking number for live shipment status.",
    url: "/track",
    images: [sharePreviewOgImage],
  },
  twitter: {
    card: "summary",
    images: [sharePreviewOgImage.url],
  },
};

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
        events: { orderBy: { date: "desc" } },
        request: { select: { shippingMethod: true, departure: true } },
      },
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
          <h1 className="text-2xl sm:text-3xl font-black italic text-mex-blue uppercase mb-4 px-1">Track Your Package</h1>
          
          {/* Native HTML Form - Updates the URL instantly to ?id=MEX... */}
          <form action="/track" method="GET" className="bg-white p-2 rounded-xl shadow-sm flex flex-col sm:flex-row max-w-2xl mx-auto border border-gray-200 focus-within:ring-2 focus-within:ring-mex-orange transition-all gap-2 sm:gap-0">
            <div className="flex items-center flex-1 min-w-0 rounded-lg sm:rounded-none bg-gray-50/50 sm:bg-transparent border border-gray-100 sm:border-0">
              <div className="flex items-center pl-3 sm:pl-4 text-gray-400 shrink-0">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                name="id"
                required
                defaultValue={trackingId || ""} 
                placeholder="Enter Tracking ID (e.g. MEX12345)"
                className="w-full min-w-0 pl-2 sm:pl-3 pr-3 py-3 focus:outline-none text-mex-dark font-black tracking-wider uppercase placeholder:font-medium placeholder:tracking-normal text-sm sm:text-base"
              />
            </div>
            <button type="submit" className="w-full sm:w-auto shrink-0 bg-mex-orange text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-md">
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
          <div className="animate-in slide-in-from-bottom-8 duration-500">
            <TrackingDetailView
              publicTracker
              showInvoice={false}
              trackingId={pkg.trackingId}
              status={pkg.status}
              shippingMethod={pkg.request.shippingMethod}
              departure={pkg.request.departure}
              invoice={null}
              events={pkg.events
                .filter((e) => !shouldOmitClientTrackingEvent(e.description))
                .map((e) => ({
                  id: e.id,
                  status: e.status,
                  location: e.location,
                  description: stripManualAdminTrackingSuffix(e.description) ?? e.description,
                  date: e.date.toISOString(),
                }))}
            />
          </div>
        )}

      </div>
    </div>
  );
}