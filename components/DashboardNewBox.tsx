"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, MapPin, CheckCircle, ArrowRight } from "lucide-react";

/** USA intake sites (lanes to Haiti). */
const USA_DROPOFFS = ["Miami Warehouse", "Orlando Warehouse", "Atlanta Warehouse"] as const;
/** Dominican Republic intake sites (lanes within DR). */
const DR_DROPOFFS = [
  "Santo Domingo Warehouse",
  "Santiago Warehouse",
  "Puerto Plata Warehouse",
  "La Romana Warehouse",
] as const;

export default function DashboardNewBox({ user }: { user: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [destinationCountry, setDestinationCountry] = useState<"HT" | "DO">("HT");

  const departureOptions = useMemo(
    () => (destinationCountry === "DO" ? [...DR_DROPOFFS] : [...USA_DROPOFFS]),
    [destinationCountry]
  );

  const [departure, setDeparture] = useState<string>(USA_DROPOFFS[0]);

  useEffect(() => {
    setDeparture(departureOptions[0] ?? USA_DROPOFFS[0]);
  }, [departureOptions]);
  const [category, setCategory] = useState("Standard Box");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || "Not Provided",
          departure,
          destinationCountry,
          category,
          description,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard?tab=overview");
          router.refresh();
        }, 2000);
      } else {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not save your registration. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-green-100 text-center animate-in zoom-in duration-300 max-w-full w-full">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-mex-dark mb-2">Box Registered!</h2>
        <p className="text-gray-500 font-medium">Your package is ready to be dropped off. Redirecting you...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl w-full mx-auto animate-in fade-in duration-500">
      <div className="mb-6 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-black text-mex-dark">Pre-Register a New Box</h2>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Your personal details ({user.firstName} {user.lastName}) are already attached to this order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16}/> Delivery country</label>
            <select
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value as "HT" | "DO")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium"
            >
              <option value="HT">Haiti</option>
              <option value="DO">Dominican Republic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16}/> Drop-off location</label>
            <select
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium"
            >
              {departureOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Package size={16}/> Item Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium">
              <option>Standard Box</option>
              <option>Electronics</option>
              <option>Pallet / Freight</option>
              <option>Vehicle Parts</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">What is inside the box? (Optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium min-h-[100px]" placeholder="e.g. Clothes, shoes, and canned goods..." />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-mex-orange text-white font-black text-lg px-6 py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Submit Registration"} <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}