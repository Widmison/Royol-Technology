"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, Search, Package, AlertCircle } from "lucide-react";
import type { TrackingDetailPackage } from "@/components/tracking/TrackingDetailView";
import TrackingCompactRow from "@/components/tracking/TrackingCompactRow";
import TrackingTimelineModal from "@/components/tracking/TrackingTimelineModal";

type TrackedPackage = TrackingDetailPackage & {
  id: string;
  route: string;
  updatedAt: string;
};

type ModalPackage = TrackingDetailPackage & { route?: string };

export default function ClientDashboardTracking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openFromQuery = searchParams.get("open")?.trim().toUpperCase() ?? "";

  const [packages, setPackages] = useState<TrackedPackage[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lookupInput, setLookupInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [modalPackage, setModalPackage] = useState<ModalPackage | null>(null);

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

  /** Deep-link from other dashboard tabs: `/dashboard?tab=tracking&open=MEX…` */
  useEffect(() => {
    if (!openFromQuery || loading) return;

    let cancelled = false;

    (async () => {
      try {
        const match = packages.find((p) => p.trackingId.toUpperCase() === openFromQuery);
        if (match) {
          if (!cancelled) setModalPackage(match);
          return;
        }

        const res = await fetch(`/api/client/tracking?id=${encodeURIComponent(openFromQuery)}`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.package) {
          setModalPackage(data.package as ModalPackage);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          router.replace("/dashboard?tab=tracking", { scroll: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [openFromQuery, loading, packages, router]);

  const runLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = lookupInput.trim().toUpperCase();
    if (!id) return;
    setLookupLoading(true);
    setLookupError(null);
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
      if (data.package) {
        const pkg = data.package as TrackingDetailPackage;
        setModalPackage(pkg);
      }
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
            Snapshots on this page — open any row for warehouse scans and the full timeline. Refreshes about every 12
            seconds.
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
            {lookupLoading ? "Loading…" : "Open timeline"}
          </button>
        </form>
        {lookupError && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            <AlertCircle size={18} /> {lookupError}
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
          <p className="mt-1 text-sm">
            When the warehouse registers a shipment for you, a summary row appears here — tap it to see the full
            timeline.
          </p>
        </div>
      ) : (
        <>
          {packages.length > 1 ? (
            <div className="rounded-2xl border border-dashed border-mex-orange/25 bg-gradient-to-br from-orange-50/80 to-white px-4 py-3 text-center sm:text-left">
              <p className="text-sm font-bold text-mex-dark">
                You have <span className="text-mex-orange">{packages.length}</span> active shipments
              </p>
              <p className="mt-1 text-xs font-medium text-gray-600">
                Each row is a snapshot — tap <span className="font-black text-mex-dark">View full timeline</span> for
                scans, locations, and history.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-3 text-center sm:text-left">
              <p className="text-sm font-bold text-mex-dark">Your shipment</p>
              <p className="mt-1 text-xs font-medium text-gray-600">
                Summary below — use <span className="font-black text-mex-dark">View full timeline</span> for every
                update.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {packages.map((pkg) => (
              <TrackingCompactRow key={pkg.id} pkg={pkg} onViewFull={() => setModalPackage(pkg)} />
            ))}
          </div>
        </>
      )}

      <TrackingTimelineModal
        open={modalPackage != null}
        packageData={modalPackage}
        onClose={() => setModalPackage(null)}
      />
    </div>
  );
}
