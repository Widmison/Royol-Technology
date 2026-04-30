"use client";

import Link from "next/link";
import {
  CheckCircle,
  Truck,
  Package as PackageIcon,
  MapPin,
  CreditCard,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { packageStatusShortLabel, packageStatusTimelineTitle } from "@/lib/packageStatusDisplay";
import { shipmentRouteLabel } from "@/lib/shipmentRouteLabel";

export type TrackingDetailInvoice = {
  id: string;
  status: string;
  totalAmount: number;
  actualWeightLbs: number;
  paidVia?: string | null;
};

export type TrackingDetailEvent = {
  id: string;
  status: string;
  location: string;
  description: string | null;
  date: string;
};

export type TrackingDetailPackage = {
  trackingId: string;
  status: string;
  shippingMethod: string;
  departure: string;
  destinationCountry?: string | null;
  invoice: TrackingDetailInvoice | null;
  events: TrackingDetailEvent[];
};

export type TrackingDetailViewProps = TrackingDetailPackage & {
  /** When false, invoice column is hidden (e.g. public `/track`). Default true. */
  showInvoice?: boolean;
  /**
   * Public tracker: timeline is the only source of truth — no package-level “current status”
   * unless it comes from the latest admin-posted event.
   */
  publicTracker?: boolean;
};

/** Timeline + optional invoice (portal). Public track uses `showInvoice={false}` + `publicTracker`. */
export default function TrackingDetailView({
  showInvoice = true,
  publicTracker = false,
  trackingId,
  status,
  shippingMethod,
  departure,
  destinationCountry,
  invoice,
  events,
}: TrackingDetailViewProps) {
  const latest = events[0];
  const displayInvoice = showInvoice && invoice != null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      <div
        className={`min-w-0 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8 ${
          displayInvoice ? "lg:col-span-2" : "lg:col-span-3"
        }`}
      >
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-500">Tracking number</p>
            <h2 className="text-xl font-black tracking-tight text-mex-dark">{trackingId}</h2>
            <p className="mt-1 text-xs font-medium text-gray-400">
              {shipmentRouteLabel(departure, destinationCountry)} · {shippingMethod}
            </p>
          </div>
          <div className="text-left sm:text-right">
            {publicTracker ? (
              <>
                <p className="mb-1 text-sm font-medium text-gray-500">Latest warehouse update</p>
                {latest ? (
                  <span className="inline-flex max-w-full flex-col items-start gap-1 sm:items-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-bold text-mex-blue">
                      {latest.status === "DELIVERED" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-mex-blue" />
                      )}
                      {packageStatusShortLabel(latest.status)}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {new Date(latest.date).toLocaleString()}
                    </span>
                  </span>
                ) : (
                  <p className="max-w-xs text-sm font-bold leading-snug text-gray-500 sm:ml-auto">
                    No updates yet. This page only shows changes posted by MEX509 staff after your package is
                    scanned into the system.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-medium text-gray-500">Current status</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-bold text-mex-blue">
                  {status === "DELIVERED" ? (
                    <CheckCircle size={14} />
                  ) : (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-mex-blue" />
                  )}
                  {packageStatusShortLabel(status)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="relative space-y-8 pl-8 before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-gray-100">
          {events.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-100 py-4 text-center font-medium text-gray-500">
              {publicTracker
                ? "No tracking history yet. Updates from our warehouse will appear here as soon as they are posted."
                : "No tracking events recorded yet. Check back soon!"}
            </div>
          ) : (
            events.map((event, index) => {
              const isLatest = index === 0;
              return (
                <div
                  key={event.id}
                  className={`relative z-10 flex items-start gap-6 ${!isLatest ? "opacity-60" : ""}`}
                >
                  <div
                    className={`absolute -left-[40px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white text-white ${
                      isLatest ? "bg-mex-orange shadow-lg shadow-orange-500/30" : "bg-gray-400"
                    }`}
                  >
                    {event.status === "DELIVERED" ? (
                      <CheckCircle size={18} />
                    ) : String(event.status).includes("IN_TRANSIT") ? (
                      <Truck size={18} />
                    ) : String(event.status).includes("CUSTOMS") ? (
                      <Receipt size={18} />
                    ) : event.status === "READY_FOR_PICKUP" ? (
                      <MapPin size={18} />
                    ) : (
                      <PackageIcon size={18} />
                    )}
                  </div>

                  <div
                    className={`flex-1 ${isLatest ? "-mt-3 rounded-2xl border border-mex-orange/20 bg-orange-50/50 p-4" : ""}`}
                  >
                    <div
                      className={`text-base font-bold leading-snug sm:text-lg ${
                        isLatest ? "text-mex-orange" : "text-mex-dark"
                      }`}
                    >
                      {event.location}
                    </div>
                    <div className="mt-1 text-xs font-black uppercase tracking-wide text-gray-500">
                      {packageStatusShortLabel(event.status)}
                    </div>
                    <div className="mt-1.5 text-sm text-gray-600">
                      <span className="font-medium">
                        {packageStatusTimelineTitle(event.status, event.description)}
                      </span>
                    </div>
                    <div className={`mt-2 text-xs font-bold ${isLatest ? "text-orange-400" : "text-gray-400"}`}>
                      {new Date(event.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {displayInvoice && invoice && (
        <div className="h-fit min-w-0 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
          <h2 className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 text-lg font-black uppercase tracking-wide text-mex-dark">
            <Receipt className="h-5 w-5 text-mex-orange" />
            Invoice summary
          </h2>

          <div className="mb-6 space-y-3 rounded-2xl bg-gray-50 p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Status:</span>
              {invoice.status === "PAID" ? (
                <span className="flex items-center gap-1 font-bold text-green-600">
                  <CheckCircle size={14} /> PAID
                </span>
              ) : (
                <span className="flex items-center gap-1 font-bold text-red-500">
                  <AlertCircle size={14} /> UNPAID
                </span>
              )}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Weight:</span>
              <span className="font-bold text-mex-dark">{invoice.actualWeightLbs} LBS</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping method:</span>
              <span className="font-bold text-mex-dark">{shippingMethod}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="font-bold text-gray-800">Total due:</span>
              <span className="text-2xl font-black text-mex-orange">${invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {invoice.status === "UNPAID" ? (
            <div className="space-y-3">
              <Link
                href={`/pay/${invoice.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-mex-dark py-4 font-bold text-white shadow-md transition-colors hover:bg-gray-800"
              >
                <CreditCard size={18} />
                Pay securely
              </Link>
              <p className="mt-5 text-center text-xs font-medium text-gray-400">
                Payments must be cleared before pickup.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center text-green-700">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-lg font-black">Invoice paid</p>
              {invoice.paidVia && (
                <p className="mt-2 text-xs font-bold uppercase text-green-800/90">
                  {invoice.paidVia === "NATCASH"
                    ? "NatCash"
                    : invoice.paidVia === "MONCASH"
                      ? "MonCash"
                      : invoice.paidVia === "CARD"
                        ? "Card / online"
                        : invoice.paidVia}
                </p>
              )}
              <p className="mt-1 text-xs font-medium">Thank you for shipping with MEX509!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
