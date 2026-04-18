"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Package, AlertCircle } from "lucide-react";
import TrackingDetailView, {
  type TrackingDetailPackage,
} from "@/components/tracking/TrackingDetailView";

type TrackedPackage = TrackingDetailPackage & {
  id: string;
  route: string;
  updatedAt: string;
};

export default function ClientDashboardTracking() {
  const [packages, setPackages] = useState<TrackedPackage[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lookupInput, setLookupInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupPackage, setLookupPackage] = useState<TrackingDetailPackage | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/client/tracking", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load tracking.");
        return;
      }
      setPackages(data.packages || []);
      setUpdatedAt(data.updatedAt || null);
      setError(null);
    } catch {
      setError("Network error while refreshing tracking.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 12_000);
    return () => clearInterval(t);
  }, [load]);

  const runLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = lookupInput.trim().toUpperCase();
    if (!id) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupPackage(null);
    try {
      const res = await fetch(`/api/client/tracking?id=${encodeURIComponent(id)}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Lookup failed.");
        return;
      }
      if (data.package) setLookupPackage(data.package as TrackingDetailPackage);
    } catch {
      setLookupError("Network error.");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-mex-dark sm:text-3xl">Live tracking</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Full timeline on this page. Refreshes about every 12 seconds.
            {updatedAt && (
              <span className="ml-1 text-xs text-gray-400">
                Last sync: {new Date(updatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-mex-dark hover:bg-gray-100"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh now
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-gray-500">
          <Search size={18} className="text-mex-orange" />
          Look up a tracking ID
        </h2>
        <form onSubmit={runLookup} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
            placeholder="MEX…"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 font-black uppercase tracking-wider text-mex-dark outline-none focus:ring-2 focus:ring-mex-orange"
          />
          <button
            type="submit"
            disabled={lookupLoading}
            className="rounded-xl bg-mex-orange px-6 py-3 font-bold text-white shadow-md hover:bg-orange-700 disabled:opacity-60"
          >
            {lookupLoading ? "Loading…" : "Show timeline"}
          </button>
        </form>
        {lookupError && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            <AlertCircle size={18} /> {lookupError}
          </div>
        )}
        {lookupPackage && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <TrackingDetailView {...lookupPackage} showInvoice={false} />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {loading && packages.length === 0 ? (
        <div className="py-16 text-center text-gray-500 font-medium">Loading your shipments…</div>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-bold text-mex-dark">No packages yet</p>
          <p className="mt-1 text-sm">When the warehouse registers a shipment for you, the full timeline appears here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Your shipment</p>
                <p className="font-black tracking-wider text-mex-blue">{pkg.trackingId}</p>
                <p className="text-xs font-medium text-gray-500">{pkg.route}</p>
              </div>
              <div className="p-4 sm:p-6">
                <TrackingDetailView
                  trackingId={pkg.trackingId}
                  status={pkg.status}
                  shippingMethod={pkg.shippingMethod}
                  departure={pkg.departure}
                  invoice={pkg.invoice}
                  events={pkg.events}
                  showInvoice={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
