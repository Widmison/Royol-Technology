"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

type ClientRow = { id: string; email: string; firstName: string | null; lastName: string | null };

export default function AdminAddClientPackageForm({ clients }: { clients: ClientRow[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [weightLbs, setWeightLbs] = useState("");
  const [shippingMethod, setShippingMethod] = useState("Air Freight");
  const [serviceFee, setServiceFee] = useState("0");
  const [destinationCity, setDestinationCity] = useState("Port-au-Prince");
  const [priceOverride, setPriceOverride] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientId,
          weightLbs: weightLbs,
          shippingMethod,
          serviceFee: serviceFee === "" ? 0 : parseFloat(serviceFee),
          destinationCity,
          priceOverride: priceOverride.trim() === "" ? undefined : parseFloat(priceOverride),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Request failed");
        return;
      }
      setMsg(
        `Created tracking ${data.trackingId} — invoice $${Number(data.totalAmount).toFixed(2)} (unpaid). Client can pay on /pay/${data.invoiceId}`
      );
      setWeightLbs("");
      setPriceOverride("");
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  if (clients.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-mex-dark flex items-center gap-2">
        <Plus className="text-mex-orange" size={24} />
        Add package &amp; send invoice
      </h2>
      <p className="mt-1 text-sm text-gray-500 font-medium">
        Creates a shipment, tracking ID, and unpaid invoice. Freight auto-calculated from lbs + lane; add a service fee
        if needed.
      </p>

      {err && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{err}</div>
      )}
      {msg && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-800">{msg}</div>
      )}

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold text-mex-dark outline-none focus:border-mex-blue"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {(c.firstName || "") + " " + (c.lastName || "")} — {c.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            required
            value={weightLbs}
            onChange={(e) => setWeightLbs(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-mex-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">Lane</label>
          <select
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-mex-blue"
          >
            <option>Air Freight</option>
            <option>Ocean Freight</option>
            <option>Ground</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
            Service fee (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={serviceFee}
            onChange={(e) => setServiceFee(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-mex-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
            Destination office city
          </label>
          <select
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-mex-blue"
          >
            <option value="Port-au-Prince">Port-au-Prince</option>
            <option value="Cap-Haitien">Cap-Haïtien</option>
            <option value="Hinche">Hinche</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
            Total override (optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Leave blank to use freight + service fee"
            value={priceOverride}
            onChange={(e) => setPriceOverride(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-mex-blue"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-mex-blue py-4 font-black text-white shadow-lg hover:bg-blue-900 disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={22} /> : <Plus size={22} />}
            Create package &amp; invoice
          </button>
        </div>
      </form>
    </div>
  );
}
