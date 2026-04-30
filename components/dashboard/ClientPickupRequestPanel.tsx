"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type PickupStatus = "PENDING" | "PRICE_SENT" | "CONFIRMED" | "PICKED_UP" | "CANCELLED";

type PickupRequestRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  packagePhotoUrl: string | null;
  distanceMiles: number | null;
  pricePerMile: number | null;
  autoTotalAmount: number | null;
  adminOverrideTotalAmount: number | null;
  finalQuotedAmount: number | null;
  status: PickupStatus;
  createdAt: string;
};

const statusTone: Record<PickupStatus, string> = {
  PENDING: "bg-amber-50 text-amber-900 border-amber-200",
  PRICE_SENT: "bg-blue-50 text-blue-900 border-blue-200",
  CONFIRMED: "bg-green-50 text-green-900 border-green-200",
  PICKED_UP: "bg-emerald-50 text-emerald-900 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function ClientPickupRequestPanel() {
  const [rows, setRows] = useState<PickupRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    packagePhotoUrl: "",
  });

  async function loadRows() {
    setLoading(true);
    try {
      const res = await fetch("/api/client/pickup-requests", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as { requests?: PickupRequestRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load pickup requests.");
      setRows(data.requests || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load pickup requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRows();
  }, []);

  const latestPendingConfirm = useMemo(
    () => rows.find((r) => r.status === "PRICE_SENT"),
    [rows]
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      let packagePhotoUrl = form.packagePhotoUrl.trim();
      if (photoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", photoFile);
        const up = await fetch("/api/client/pickup-requests/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const upData = (await up.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!up.ok || !upData.url) throw new Error(upData.error || "Could not upload package photo.");
        packagePhotoUrl = upData.url;
      }

      const res = await fetch("/api/client/pickup-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, packagePhotoUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not submit pickup request.");
      setForm({ name: "", phone: "", address: "", city: "", state: "", zipCode: "", packagePhotoUrl: "" });
      setPhotoFile(null);
      setMessage("Pickup request submitted.");
      await loadRows();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not submit pickup request.");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  async function confirmPickup(id: string) {
    setMessage("");
    const res = await fetch(`/api/client/pickup-requests/${id}/confirm`, {
      method: "POST",
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setMessage(data.error || "Could not confirm pickup.");
      return;
    }
    setMessage("Pickup confirmed. Our team will schedule collection.");
    await loadRows();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-black text-mex-dark">Request pickup</h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Enter your details and a photo URL. We estimate distance-based pricing, then admin confirms the quote.
        </p>
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <input className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="Phone number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          <input className="sm:col-span-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="Pickup address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
          <input className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <input className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
          <input className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="ZIP code" value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} />
          <input
            type="file"
            accept="image/*"
            className="sm:col-span-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          <input className="sm:col-span-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="Or paste package photo URL (optional)" value={form.packagePhotoUrl} onChange={(e) => setForm((f) => ({ ...f, packagePhotoUrl: e.target.value }))} />
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="rounded-xl bg-mex-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-60">
              {saving || uploading ? "Submitting..." : "Submit pickup request"}
            </button>
          </div>
        </form>
      </div>

      {latestPendingConfirm ? (
        <div className="rounded-2xl border border-mex-blue/20 bg-blue-50 p-4 sm:p-5">
          <p className="text-sm font-bold text-mex-blue">Price received for your latest pickup request.</p>
          <p className="mt-1 text-sm text-gray-700">
            Quoted amount: <span className="font-black">${Number(latestPendingConfirm.finalQuotedAmount ?? 0).toFixed(2)}</span>
          </p>
          <button onClick={() => void confirmPickup(latestPendingConfirm.id)} className="mt-3 rounded-lg bg-mex-blue px-4 py-2 text-sm font-bold text-white hover:bg-blue-900">
            Confirm pickup
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-black text-mex-dark">My pickup requests</h3>
        {loading ? (
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No pickup requests yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-mex-dark">{r.address}</p>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusTone[r.status]}`}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {r.city || "—"}, {r.state || "—"} {r.zipCode || ""}
                </p>
                <p className="mt-2 text-sm">
                  Quote: <span className="font-black">${Number(r.finalQuotedAmount ?? r.autoTotalAmount ?? 0).toFixed(2)}</span>
                  {" · "}
                  Distance: {Number(r.distanceMiles ?? 0).toFixed(1)} mi
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {message ? <p className="text-sm font-medium text-mex-blue">{message}</p> : null}
    </div>
  );
}
