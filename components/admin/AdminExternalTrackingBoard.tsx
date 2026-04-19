"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";

type Entry = {
  id: string;
  trackingNumber: string;
  storeLabel: string | null;
  carrier: string | null;
  notes: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null; phone: string | null };
  linkedPackage: { id: string; trackingId: string; status: string } | null;
};

const STATUSES = ["PENDING_REVIEW", "LINKED", "NEEDS_INFO", "CLOSED"] as const;

export default function AdminExternalTrackingBoard({ highlightId }: { highlightId?: string | null }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/external-tracking", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load.");
        return;
      }
      setEntries(data.entries || []);
      setError(null);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function savePatch(id: string, patch: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/external-tracking/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Save failed.");
        return;
      }
      setEditing(null);
      await load();
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-mex-dark">External tracking inbox</h1>
          <p className="mt-1 font-medium text-gray-500">
            Third-party ecommerce tracking clients add from other stores. Link to an internal MEX509 package when it
            matches.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-mex-dark shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>
      )}

      {loading && entries.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-mex-blue" size={36} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">External #</th>
                  <th className="p-4">Meta</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Linked MEX</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((e) => (
                  <tr
                    key={e.id}
                    className={`hover:bg-gray-50/80 ${
                      highlightId === e.id ? "bg-orange-50/90 ring-1 ring-inset ring-mex-orange/30" : ""
                    }`}
                  >
                    <td className="p-4 align-top">
                      <p className="font-bold text-mex-dark">
                        {e.user.firstName} {e.user.lastName}
                      </p>
                      <p className="text-xs font-medium text-gray-500">{e.user.email}</p>
                      {e.user.phone && <p className="text-xs text-gray-400">{e.user.phone}</p>}
                    </td>
                    <td className="p-4 align-top font-black tracking-wide text-mex-blue">{e.trackingNumber}</td>
                    <td className="p-4 align-top text-xs text-gray-600">
                      {[e.storeLabel, e.carrier].filter(Boolean).join(" · ") || "—"}
                      {e.notes && <p className="mt-1 line-clamp-2">{e.notes}</p>}
                    </td>
                    <td className="p-4 align-top">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-black uppercase">
                        {e.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 align-top font-mono text-xs">
                      {e.linkedPackage ? (
                        <span className="font-bold text-green-700">{e.linkedPackage.trackingId}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(e)}
                        className="rounded-lg bg-mex-blue px-3 py-1.5 text-xs font-black text-white hover:bg-blue-900"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {entries.length === 0 && !loading && (
            <p className="py-12 text-center text-sm font-medium text-gray-500">No external tracking entries yet.</p>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-mex-dark">Update entry</h3>
            <p className="mt-1 font-mono text-sm font-bold text-mex-blue">{editing.trackingNumber}</p>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-black uppercase text-gray-400">
                Status
                <select
                  defaultValue={editing.status}
                  id="ext-status"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 font-bold text-mex-dark"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-black uppercase text-gray-400">
                Link to MEX tracking ID (optional)
                <input
                  id="ext-mex"
                  defaultValue={editing.linkedPackage?.trackingId ?? ""}
                  placeholder="MEX…"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 font-mono font-bold uppercase"
                />
              </label>
              <label className="block text-xs font-black uppercase text-gray-400">
                Internal note to client (optional)
                <textarea
                  id="ext-note"
                  defaultValue={editing.adminNote ?? ""}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Visible to the client in their portal."
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  const st = (document.getElementById("ext-status") as HTMLSelectElement)?.value;
                  const mex = (document.getElementById("ext-mex") as HTMLInputElement)?.value.trim().toUpperCase();
                  const note = (document.getElementById("ext-note") as HTMLTextAreaElement)?.value;
                  const patch: Record<string, unknown> = {
                    status: st,
                    adminNote: note,
                  };
                  if (mex) patch.linkMexTrackingId = mex;
                  else if (editing.linkedPackage) patch.linkedPackageId = null;
                  void savePatch(editing.id, patch);
                }}
                className="rounded-xl bg-mex-orange px-5 py-2 text-sm font-black text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save & notify client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
