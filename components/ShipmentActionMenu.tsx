"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScanLine, ScanBarcode, CheckCircle, Edit2, X, Save } from "lucide-react";
import AdminPrintDocumentLinks from "@/components/admin/AdminPrintDocumentLinks";
import { ALL_ADMIN_SCAN_STATUS_OPTIONS, optionForStatus } from "@/lib/adminTrackingStatusOptions";

const LOCATION_PRESETS = [
  "MEX509 — Miami hub (1962 NW 82nd Ave, Doral, FL)",
  "Departed US — in transit to Haiti (air)",
  "Miami Intl. / cargo transfer — awaiting connection",
  "Port-au-Prince — sort & distribution facility",
  "In transit — Route nationale (St-Marc / Gonaïves corridor)",
  "Cap-Haïtien — regional delivery hub",
  "Haiti customs — Port-au-Prince clearance",
  "Ready for pickup — Tabar / Delmas corridor",
  "Out for delivery — en route to client",
  "St-Marc — Bon Jean / local corridor",
  "Delivered — handed to recipient",
];

const CUSTOM_KEY = "__custom__";

type PkgShape = {
  requestId: string;
  trackingId: string;
  status: string;
  events?: { location: string; description: string | null; date: Date; status: string }[];
};

export default function ShipmentActionMenu({ pkg }: { pkg: PkgShape }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const latest = pkg.events?.[0];
  const defaultLocation = latest?.location ?? LOCATION_PRESETS[0]!;

  const initialPreset = useMemo(() => {
    if (LOCATION_PRESETS.includes(defaultLocation)) return defaultLocation;
    return CUSTOM_KEY;
  }, [defaultLocation]);

  const [status, setStatus] = useState(pkg.status);
  const [locPreset, setLocPreset] = useState(initialPreset);
  const [locCustom, setLocCustom] = useState(
    initialPreset === CUSTOM_KEY ? defaultLocation : ""
  );

  const resolvedLocation =
    locPreset === CUSTOM_KEY ? (locCustom.trim() || defaultLocation) : locPreset;

  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const usHubStatuses = new Set([
    "PROCESSING",
    "RECEIVED_USA_WAREHOUSE",
    "PROCESSING_SORTING_USA",
    "IN_TRANSIT_USA_TO_DR",
    "CUSTOMS_DR_ENTRY",
    "ARRIVED_RD_WAREHOUSE",
    "PREPARING_HAITI_TRANSFER",
  ]);

  let ScanButton: ReactNode;
  if (pkg.status === "DELIVERED") {
    ScanButton = (
      <span className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-400">
        <CheckCircle size={16} /> Done
      </span>
    );
  } else if (usHubStatuses.has(pkg.status)) {
    ScanButton = (
      <Link
        href="/admin/scan?mode=us"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-mex-blue px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-900"
      >
        <ScanLine size={16} /> Scan out (US)
      </Link>
    );
  } else {
    ScanButton = (
      <Link
        href="/admin/scan?mode=haiti"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-mex-orange px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-700"
      >
        <ScanBarcode size={16} /> Scan in (HT)
      </Link>
    );
  }

  const openModal = () => {
    setStatus(pkg.status);
    const lp = LOCATION_PRESETS.includes(defaultLocation) ? defaultLocation : CUSTOM_KEY;
    setLocPreset(lp);
    setLocCustom(lp === CUSTOM_KEY ? defaultLocation : "");
    setDescription("");
    setError("");
    setIsModalOpen(true);
  };

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: pkg.trackingId,
          status,
          location: resolvedLocation,
          description:
            description.trim() ||
            optionForStatus(status)?.detail ||
            `Status: ${String(status).replace(/_/g, " ")} — ${resolvedLocation}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Update failed");
        return;
      }
      setIsModalOpen(false);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
      <AdminPrintDocumentLinks requestId={pkg.requestId} layout="row" />
      {ScanButton}

      {pkg.status !== "DELIVERED" && (
        <button
          type="button"
          onClick={openModal}
          className="shrink-0 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-mex-blue"
          title="Manual update (status + location)"
        >
          <Edit2 size={16} />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex animate-in items-center justify-center bg-black/60 p-4 text-left fade-in duration-200">
          <div className="max-h-[90dvh] w-full max-w-md animate-in overflow-y-auto rounded-3xl bg-white shadow-2xl zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-5">
              <h2 className="flex items-center gap-2 text-xl font-black text-mex-dark">
                <Edit2 className="text-mex-blue" />
                Tracking update
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-white p-2 text-gray-400 shadow-sm hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualUpdate} className="space-y-4 p-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center text-lg font-black uppercase tracking-widest text-mex-blue">
                {pkg.trackingId}
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Package status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold text-mex-dark outline-none focus:border-mex-blue"
                >
                  {ALL_ADMIN_SCAN_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Location checkpoint
                </label>
                <select
                  value={locPreset}
                  onChange={(e) => setLocPreset(e.target.value)}
                  className="mb-2 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold text-mex-dark outline-none focus:border-mex-blue"
                >
                  {LOCATION_PRESETS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value={CUSTOM_KEY}>Custom location…</option>
                </select>
                {locPreset === CUSTOM_KEY && (
                  <textarea
                    value={locCustom}
                    onChange={(e) => setLocCustom(e.target.value)}
                    rows={2}
                    required
                    placeholder="e.g. In transit — Jacmel depot, awaiting transfer"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-mex-dark outline-none focus:border-mex-blue"
                  />
                )}
                <p className="mt-1 text-[10px] font-medium text-gray-500">
                  Clients see this line on the tracking timeline with the status above.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Public note (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Delay, flight, contact attempt…"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold text-mex-dark outline-none focus:border-mex-blue"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-mex-blue py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-900 disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : (
                    <>
                      <Save size={18} /> Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
