"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { externalTrackingStatusLabel } from "@/lib/externalTrackingStatusDisplay";

type Entry = {
  id: string;
  storeLabel: string | null;
  carrier: string | null;
  trackingNumber: string;
  notes: string | null;
  status: string;
  adminNote: string | null;
  linkedPackage: { trackingId: string; status: string } | null;
  createdAt: string;
};

function statusLabel(s: string) {
  return externalTrackingStatusLabel(s);
}

/** POST/GET JSON → list row (live carrier tracking isn’t shown here — only what you saved). */
function normalizeEntry(raw: Record<string, unknown>): Entry | null {
  if (typeof raw.id !== "string" || typeof raw.trackingNumber !== "string") return null;
  const lp = raw.linkedPackage;
  return {
    id: raw.id,
    storeLabel: typeof raw.storeLabel === "string" ? raw.storeLabel : null,
    carrier: typeof raw.carrier === "string" ? raw.carrier : null,
    trackingNumber: raw.trackingNumber,
    notes: typeof raw.notes === "string" ? raw.notes : null,
    status: typeof raw.status === "string" ? raw.status : "PENDING_REVIEW",
    adminNote: typeof raw.adminNote === "string" ? raw.adminNote : null,
    linkedPackage:
      lp && typeof lp === "object" && lp !== null && "trackingId" in lp && typeof (lp as { trackingId: unknown }).trackingId === "string"
        ? {
            trackingId: (lp as { trackingId: string }).trackingId,
            status: String((lp as { status?: unknown }).status ?? ""),
          }
        : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

export default function ClientExternalTrackingPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storeLabel, setStoreLabel] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  /** Load saved rows when possible; failures are silent so a bad refresh never hides what you just saved. */
  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/client/external-tracking", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as { entries?: Record<string, unknown>[] };
      if (!res.ok || !Array.isArray(data.entries)) return;
      const rows = data.entries.map((r) => normalizeEntry(r)).filter(Boolean) as Entry[];
      setEntries(rows);
    } catch {
      /* ignore — list is best-effort */
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/client/external-tracking", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeLabel: storeLabel.trim() || null,
          carrier: carrier.trim() || null,
          trackingNumber: trackingNumber.trim(),
          notes: notes.trim() || null,
        }),
      });
      let data: { error?: string; entry?: Record<string, unknown> } = {};
      try {
        data = await res.json();
      } catch {
        setError("Could not read the server response. Try again.");
        return;
      }
      if (!res.ok) {
        setError(data.error || `Could not save (${res.status}).`);
        return;
      }
      setStoreLabel("");
      setCarrier("");
      setTrackingNumber("");
      setNotes("");
      const added = data.entry ? normalizeEntry(data.entry) : null;
      if (added) {
        setEntries((prev) => {
          const rest = prev.filter((p) => p.id !== added.id);
          return [added, ...rest];
        });
      }
      setSuccess("Saved — it’s listed below. We can’t show live carrier tracking here; MEX509 staff still see it on the admin side.");
      window.setTimeout(() => setSuccess(null), 10000);
      void loadList();
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-mex-orange">Add tracking</p>
            <h1 className="mt-1 text-2xl font-black text-mex-dark sm:text-3xl">Store &amp; marketplace tracking</h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-gray-500">
              Save the seller or carrier tracking number for orders you send to our warehouse. It’s stored here and on the
              admin dashboard — we don’t track the carrier live in this form, we just keep your numbers on file.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600">
            <ShoppingBag className="text-mex-orange" size={20} />
            Not your MEX509 label — other store shipping only.
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-gray-400">
              Tracking / order number *
            </label>
            <input
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Paste tracking or order ID"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-mex-dark outline-none focus:ring-2 focus:ring-mex-orange"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-gray-400">
              Store / seller (optional)
            </label>
            <input
              value={storeLabel}
              onChange={(e) => setStoreLabel(e.target.value)}
              placeholder="Amazon, Shein…"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium text-mex-dark outline-none focus:ring-2 focus:ring-mex-orange"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-gray-400">
              Carrier (optional)
            </label>
            <input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="UPS, FedEx, USPS…"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium text-mex-dark outline-none focus:ring-2 focus:ring-mex-orange"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-gray-400">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Order details, etc."
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-mex-dark outline-none focus:ring-2 focus:ring-mex-orange"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-mex-orange px-8 py-4 font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              Add tracking number
            </button>
          </div>
        </form>

        {success && (
          <div className="mt-4 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
            <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={18} aria-hidden />
            <p className="min-w-0 flex-1 leading-snug">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="shrink-0 rounded-lg p-1 text-green-700 hover:bg-green-100"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={18} aria-hidden />
            <p className="min-w-0 flex-1 leading-snug">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 rounded-lg p-1 text-red-700 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-black text-mex-dark">Saved tracking numbers</h2>
        <p className="mt-1 text-sm text-gray-500">
          Everything you added appears here (same data MEX509 staff see on their side).
        </p>

        {listLoading ? (
          <div className="flex justify-center py-12 text-gray-400">
            <Loader2 className="animate-spin" size={26} />
          </div>
        ) : entries.length === 0 ? (
          <p className="mt-6 text-center text-sm font-medium text-gray-500">
            Nothing saved yet — use the form above.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {entries.map((e) => (
              <li
                key={e.id}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 sm:flex sm:items-start sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="font-black tracking-wide text-mex-blue">{e.trackingNumber}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-gray-500">
                    {e.storeLabel && <span>{e.storeLabel}</span>}
                    {e.carrier && (
                      <span className="inline-flex items-center gap-1">
                        <Truck size={12} /> {e.carrier}
                      </span>
                    )}
                  </div>
                  {e.notes && <p className="mt-2 text-sm text-gray-600">{e.notes}</p>}
                  {e.adminNote && (
                    <p className="mt-3 rounded-xl border border-mex-blue/20 bg-blue-50/60 px-3 py-2 text-sm font-medium text-mex-dark">
                      <span className="font-black text-mex-blue">MEX509: </span>
                      {e.adminNote}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Saved {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 shrink-0 text-right sm:mt-0">
                  <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-700">
                    {statusLabel(e.status)}
                  </span>
                  {e.linkedPackage && (
                    <p className="mt-2 text-xs font-bold text-gray-600">
                      Linked to{" "}
                      <Link
                        href={`/dashboard?tab=tracking&open=${encodeURIComponent(e.linkedPackage.trackingId)}`}
                        className="text-mex-blue underline"
                      >
                        {e.linkedPackage.trackingId}
                      </Link>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
