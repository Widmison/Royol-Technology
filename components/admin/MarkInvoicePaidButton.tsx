"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type PaidVia = "MONCASH" | "NATCASH" | "CASH";

export default function MarkInvoicePaidButton({
  invoiceId,
  amountLabel,
}: {
  invoiceId: string;
  amountLabel: string;
}) {
  const [paidVia, setPaidVia] = useState<PaidVia>("MONCASH");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onConfirm() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidVia }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg(data.error || "Could not save.");
        return;
      }
      window.location.reload();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <select
        value={paidVia}
        onChange={(e) => setPaidVia(e.target.value as PaidVia)}
        disabled={busy}
        className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-bold text-mex-dark"
        aria-label="Payment method received"
      >
        <option value="MONCASH">MonCash</option>
        <option value="NATCASH">NatCash</option>
        <option value="CASH">Cash</option>
      </select>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onConfirm()}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-green-900 disabled:opacity-50"
      >
        {busy ? <Loader2 className="animate-spin" size={14} /> : null}
        Record paid ({amountLabel})
      </button>
      {msg && <span className="text-xs font-bold text-red-600">{msg}</span>}
    </div>
  );
}
