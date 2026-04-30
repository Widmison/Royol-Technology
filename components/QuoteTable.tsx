"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Info,
  Sparkles,
  Package,
  Copy,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { calculateFreightTotal } from "@/lib/freightRates";
import { QUOTE_SHIPPING_METHODS, normalizeQuoteShippingMethod } from "@/lib/shippingMethods";
import AdminPrintDocumentLinks from "@/components/admin/AdminPrintDocumentLinks";
import { shipmentRouteLabel } from "@/lib/shipmentRouteLabel";

type IntakeCreatedSummary = {
  requestId: string;
  invoiceId: string;
  trackingId: string;
  totalAmount: number;
  weight: number;
  shippingMethod: string;
  recipient: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    destinationCountry: string | null;
    departure: string;
    category: string;
    description: string;
  };
};

export default function QuoteTable({ quotes }: { quotes: any[] }) {
  const router = useRouter();

  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [createdSummary, setCreatedSummary] = useState<IntakeCreatedSummary | null>(null);
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [intakeShippingMethod, setIntakeShippingMethod] = useState<string>("Air Freight");
  const priceTouched = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyPayHint, setCopyPayHint] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteQuote(quote: any) {
    if (
      !window.confirm(
        `Permanently delete this quote for ${quote.firstName} ${quote.lastName}? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingId(quote.id);
    try {
      const res = await fetch(`/api/admin/shipment-requests/${quote.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(typeof data.error === "string" ? data.error : "Could not delete quote.");
        return;
      }
      if (selectedQuote?.id === quote.id) setSelectedQuote(null);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    if (!selectedQuote) return;
    priceTouched.current = false;
    setWeight("");
    setPrice("");
    setIntakeShippingMethod(
      normalizeQuoteShippingMethod(selectedQuote.shippingMethod, "Air Freight")
    );
  }, [selectedQuote?.id]);

  useEffect(() => {
    if (!selectedQuote || priceTouched.current) return;
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) {
      setPrice("");
      return;
    }
    setPrice(calculateFreightTotal(w, intakeShippingMethod).toFixed(2));
  }, [weight, intakeShippingMethod, selectedQuote]);

  const handleInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedQuote.id,
          weight,
          price,
          shippingMethod: intakeShippingMethod,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const summary: IntakeCreatedSummary = {
          requestId: data.requestId as string,
          invoiceId: data.invoice?.id as string,
          trackingId: data.trackingId as string,
          totalAmount: Number(data.totalAmount),
          weight: Number(data.invoice?.actualWeightLbs ?? weight),
          shippingMethod: (data.shippingMethod as string) || intakeShippingMethod,
          recipient: data.recipient as IntakeCreatedSummary["recipient"],
        };
        setCreatedSummary(summary);
        setSelectedQuote(null);
        setWeight("");
        setPrice("");
        priceTouched.current = false;
        router.refresh();
      } else {
        window.alert(data.error || "Failed to generate invoice.");
      }
    } catch (error) {
      console.error(error);
      window.alert("Failed to generate invoice.");
    } finally {
      setIsProcessing(false);
    }
  };

  const autoPreview =
    selectedQuote && weight && parseFloat(weight) > 0
      ? calculateFreightTotal(parseFloat(weight), intakeShippingMethod)
      : null;

  const [absolutePayUrl, setAbsolutePayUrl] = useState("");

  useEffect(() => {
    if (!createdSummary) {
      setAbsolutePayUrl("");
      return;
    }
    setAbsolutePayUrl(`${window.location.origin}/pay/${createdSummary.invoiceId}`);
  }, [createdSummary]);

  const closeIntakeFlow = () => {
    setSelectedQuote(null);
    setCreatedSummary(null);
    setCopyPayHint(null);
    setAbsolutePayUrl("");
  };

  const payPath = createdSummary ? `/pay/${createdSummary.invoiceId}` : "#";

  const statusBadge = (status: string) => {
    if (status === "PENDING_DROPOFF") {
      return "bg-orange-100 text-orange-700";
    }
    if (status === "INVOICED") {
      return "bg-blue-100 text-blue-800";
    }
    if (status === "PAID") {
      return "bg-green-100 text-green-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  return (
    <>
      <div className="overflow-x-auto overscroll-x-contain -mx-px">
        <table className="w-full text-left min-w-[640px]">
          <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold">Client</th>
              <th className="p-4 font-bold">Route & Item</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500 font-medium">
                  No recent requests found.
                </td>
              </tr>
            ) : (
              quotes.map((quote: any) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-mex-dark">
                      {quote.firstName} {quote.lastName}
                    </div>
                    <div className="text-gray-500 text-xs">{quote.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-700">
                      {shipmentRouteLabel(quote.departure, quote.destinationCountry)}
                    </div>
                    <div className="text-gray-500 text-xs">{quote.category}</div>
                    <div className="text-[10px] font-bold text-mex-blue uppercase tracking-wider mt-1">
                      {quote.shippingMethod}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${statusBadge(quote.status)}`}
                    >
                      {String(quote.status).replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {quote.status === "PENDING_DROPOFF" ? (
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setCreatedSummary(null);
                            setSelectedQuote(quote);
                          }}
                          className="bg-mex-dark text-white text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition-colors"
                        >
                          Weigh & Invoice
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === quote.id}
                          onClick={() => handleDeleteQuote(quote)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          title="Delete quote"
                        >
                          <Trash2 size={14} aria-hidden />
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-green-600 text-xs font-bold flex items-center justify-end gap-1">
                        <CheckCircle size={14} /> In pipeline
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(selectedQuote || createdSummary) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl animate-in zoom-in duration-200">
            {createdSummary ? (
              <>
                <div className="relative overflow-hidden bg-gradient-to-br from-mex-dark via-[#1a1f4a] to-mex-blue px-6 pb-8 pt-7 text-white">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-mex-orange/25 blur-2xl" />
                  <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-48 rounded-full bg-white/10 blur-2xl" />
                  <button
                    type="button"
                    onClick={closeIntakeFlow}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                  >
                    <span className="text-xl font-bold leading-none">&times;</span>
                  </button>
                  <div className="relative flex items-center gap-2 text-mex-orange">
                    <Sparkles className="h-6 w-6 shrink-0" aria-hidden />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Intake complete</span>
                  </div>
                  <h3 className="relative mt-2 text-2xl font-black leading-tight">
                    Package &amp; invoice are live
                  </h3>
                  <p className="relative mt-2 max-w-md text-sm font-medium text-white/80">
                    Official tracking is active. Print a carrier-style label for the box and a
                    professional invoice for your files or the client.
                  </p>
                </div>

                <div className="space-y-5 px-6 py-6">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Tracking ID
                    </p>
                    <p className="mt-1 break-all font-mono text-xl font-black tracking-wider text-mex-blue">
                      {createdSummary.trackingId}
                    </p>
                    <div className="mt-4 grid gap-3 border-t border-gray-200 pt-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Invoice total</span>
                        <span className="font-black text-mex-orange">
                          ${createdSummary.totalAmount.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Billed weight</span>
                        <span className="font-bold text-mex-dark">{createdSummary.weight} lbs</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Method</span>
                        <span className="font-bold text-mex-dark">{createdSummary.shippingMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Deliver to
                    </p>
                    <p className="mt-1 font-bold text-mex-dark">
                      {createdSummary.recipient.firstName} {createdSummary.recipient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{createdSummary.recipient.phone}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-800">
                      {createdSummary.recipient.address}
                      <br />
                      {createdSummary.recipient.city}, {createdSummary.recipient.state}{" "}
                      {createdSummary.recipient.zipCode}
                      {createdSummary.recipient.destinationCountry ? (
                        <>
                          <br />
                          {createdSummary.recipient.destinationCountry}
                        </>
                      ) : null}
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-gray-200/90 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-5 shadow-inner">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                          Saved in admin
                        </p>
                        <p className="mt-1 text-sm font-black text-mex-dark">Invoice &amp; warehouse label</p>
                        <p className="mt-1 max-w-md text-xs leading-relaxed text-gray-600">
                          These links stay available on{" "}
                          <Link
                            href="/admin/invoices"
                            className="font-bold text-mex-blue underline decoration-mex-blue/30 underline-offset-2"
                          >
                            Invoices &amp; billing
                          </Link>{" "}
                          and on each shipment row. Open anytime — use{" "}
                          <strong className="text-mex-dark">Print → Save as PDF</strong> to download.
                        </p>
                      </div>
                      <AdminPrintDocumentLinks
                        requestId={createdSummary.requestId}
                        layout="stack"
                        className="sm:items-end"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-mex-blue/30 bg-blue-50/50 p-4">
                    <p className="text-xs font-bold text-mex-dark">Client payment link</p>
                    <p className="mt-1 break-all font-mono text-[11px] text-gray-700">
                      {absolutePayUrl || payPath}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const toCopy = absolutePayUrl || `${window.location.origin}${payPath}`;
                            await navigator.clipboard.writeText(toCopy);
                            setCopyPayHint("Copied to clipboard.");
                            setTimeout(() => setCopyPayHint(null), 2500);
                          } catch {
                            setCopyPayHint("Copy failed — select the link above.");
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-mex-dark px-4 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800"
                      >
                        <Copy className="h-4 w-4 shrink-0" aria-hidden />
                        Copy pay link
                      </button>
                      <a
                        href={payPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-mex-dark transition hover:bg-gray-50"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                        Open pay page
                      </a>
                    </div>
                    {copyPayHint ? (
                      <p className="mt-2 text-xs font-medium text-green-700">{copyPayHint}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={closeIntakeFlow}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 text-sm font-black text-gray-700 transition hover:bg-gray-200"
                  >
                    <Package className="h-5 w-5 shrink-0" aria-hidden />
                    Done — back to queue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between bg-mex-dark p-5">
                  <h3 className="text-lg font-bold text-white">Warehouse intake</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(null)}
                    className="text-xl font-bold text-gray-400 transition hover:text-white"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleInvoice} className="space-y-5 p-6">
              <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  Client:{" "}
                  <strong className="text-mex-dark">
                    {selectedQuote.firstName} {selectedQuote.lastName}
                  </strong>
                </p>
                <div>
                  <label htmlFor="intake-shipping-method" className="mb-1.5 block text-sm font-bold text-gray-700">
                    Shipping method *
                  </label>
                  <select
                    id="intake-shipping-method"
                    value={intakeShippingMethod}
                    onChange={(e) => {
                      priceTouched.current = false;
                      setIntakeShippingMethod(e.target.value);
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-mex-dark outline-none focus:ring-2 focus:ring-mex-orange"
                  >
                    {QUOTE_SHIPPING_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] font-medium text-gray-500">
                    Requested online:{" "}
                    <span className="text-mex-dark">{selectedQuote.shippingMethod}</span>. You can
                    correct it here before invoicing; it is saved on the shipment record.
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Contents:{" "}
                  <strong className="text-mex-dark">{selectedQuote.description || "—"}</strong>
                </p>
              </div>

              <div className="flex gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <Info className="shrink-0 text-mex-blue" size={16} />
                <p>
                  A <strong>MEX</strong> tracking ID and live package record are created now so
                  the client can track while the invoice is unpaid. Payment still clears the shipment
                  for dispatch.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Actual weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-orange outline-none"
                  placeholder="e.g. 12.5"
                />
              </div>

              {autoPreview != null && (
                <p className="text-xs text-gray-500 font-medium -mt-2">
                  Auto total (same per-lb rates as the shipping calculator):{" "}
                  <span className="text-mex-dark font-black">${autoPreview.toFixed(2)}</span>
                </p>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Total to invoice (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => {
                    priceTouched.current = true;
                    setPrice(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-orange outline-none"
                  placeholder="Auto-filled from weight"
                />
                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                  Edit this field to override the auto-calculated total (discounts, special items,
                  etc.).
                </p>
              </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQuote(null)}
                      className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 rounded-xl bg-mex-orange py-3 font-bold text-white shadow-lg transition-colors hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isProcessing ? "Saving..." : "Create package & invoice"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
