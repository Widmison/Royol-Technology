"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Info } from "lucide-react";
import { calculateFreightTotal } from "@/lib/freightRates";

export default function QuoteTable({ quotes }: { quotes: any[] }) {
  const router = useRouter();

  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const priceTouched = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedQuote) return;
    priceTouched.current = false;
    setWeight("");
    setPrice("");
  }, [selectedQuote?.id]);

  useEffect(() => {
    if (!selectedQuote || priceTouched.current) return;
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) {
      setPrice("");
      return;
    }
    setPrice(calculateFreightTotal(w, selectedQuote.shippingMethod).toFixed(2));
  }, [weight, selectedQuote]);

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
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const tid = data.trackingId as string | undefined;
        if (tid) {
          window.alert(
            `Invoice created.\n\nOfficial tracking ID:\n${tid}\n\nShare /pay link with the client from Invoices.`
          );
        }
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
      ? calculateFreightTotal(parseFloat(weight), selectedQuote.shippingMethod)
      : null;

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
      <div className="overflow-x-auto">
        <table className="w-full text-left">
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
                      {quote.departure} &rarr; HT
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
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="bg-mex-dark text-white text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition-colors"
                      >
                        Weigh & Invoice
                      </button>
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

      {selectedQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-mex-dark p-5 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Warehouse intake</h3>
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="text-gray-400 hover:text-white font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleInvoice} className="p-6 space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
                <p className="text-sm text-gray-600">
                  Client:{" "}
                  <strong className="text-mex-dark">
                    {selectedQuote.firstName} {selectedQuote.lastName}
                  </strong>
                </p>
                <p className="text-sm text-gray-600">
                  Method:{" "}
                  <strong className="text-mex-dark">{selectedQuote.shippingMethod}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Contents:{" "}
                  <strong className="text-mex-dark">{selectedQuote.description}</strong>
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
                  Auto rate from published pricing:{" "}
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

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-mex-orange text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  {isProcessing ? "Saving..." : "Create package & invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
