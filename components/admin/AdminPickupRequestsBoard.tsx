"use client";

import { useMemo, useState } from "react";

type PickupStatus = "PENDING" | "PRICE_SENT" | "CONFIRMED" | "PICKED_UP" | "CANCELLED";

export type PickupRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  packagePhotoUrl: string | null;
  autoTotalAmount: number | null;
  adminOverrideTotalAmount: number | null;
  finalQuotedAmount: number | null;
  status: PickupStatus;
  adminNote: string | null;
  createdAt: Date | string;
};

const STATUSES: PickupStatus[] = ["PENDING", "PRICE_SENT", "CONFIRMED", "PICKED_UP", "CANCELLED"];

export default function AdminPickupRequestsBoard({ initialRows }: { initialRows: PickupRow[] }) {
  const [rows, setRows] = useState<PickupRow[]>(initialRows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const pendingCount = useMemo(() => rows.filter((r) => r.status === "PENDING").length, [rows]);

  async function updateRow(
    id: string,
    payload: Partial<{ status: PickupStatus; adminOverrideTotalAmount: number; finalQuotedAmount: number; adminNote: string }>
  ) {
    setSavingId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/pickups/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; request?: PickupRow };
      if (!res.ok || !data.request) throw new Error(data.error || "Could not update pickup request.");
      setRows((prev) => prev.map((r) => (r.id === id ? data.request! : r)));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update pickup request.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h1 className="text-2xl font-black text-mex-dark">Pickup requests</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Pending requests: <span className="font-black text-mex-blue">{pendingCount}</span>
        </p>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">No pickup requests yet.</div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-mex-dark">{row.name}</p>
                  <p className="text-sm text-gray-600">{row.phone}</p>
                  <p className="text-sm text-gray-700">{row.address}</p>
                  <p className="text-xs text-gray-500">
                    {row.city || "—"}, {row.state || "—"} {row.zipCode || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-bold uppercase"
                    value={row.status}
                    onChange={(e) => {
                      void updateRow(row.id, { status: e.target.value as PickupStatus });
                    }}
                    disabled={savingId === row.id}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="text-xs text-gray-500">Auto quote</p>
                  <p className="font-black">${Number(row.autoTotalAmount ?? 0).toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="text-xs text-gray-500">Override</p>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={row.adminOverrideTotalAmount ?? ""}
                    className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      if (!raw) return;
                      const n = Number(raw);
                      if (Number.isFinite(n)) {
                        void updateRow(row.id, { adminOverrideTotalAmount: n, finalQuotedAmount: n });
                      }
                    }}
                    disabled={savingId === row.id}
                  />
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="text-xs text-gray-500">Final quote</p>
                  <p className="font-black">${Number(row.finalQuotedAmount ?? row.autoTotalAmount ?? 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-3">
                <textarea
                  rows={2}
                  defaultValue={row.adminNote ?? ""}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Internal note"
                  onBlur={(e) => {
                    void updateRow(row.id, { adminNote: e.target.value });
                  }}
                  disabled={savingId === row.id}
                />
              </div>

              {row.packagePhotoUrl ? (
                <p className="mt-2 text-xs">
                  <a className="font-bold text-mex-blue hover:underline" href={row.packagePhotoUrl} target="_blank" rel="noreferrer">
                    View package photo
                  </a>
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>

      {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}
    </div>
  );
}
