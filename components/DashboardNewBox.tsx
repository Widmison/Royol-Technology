"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, MapPin, CheckCircle, ArrowRight } from "lucide-react";

export default function DashboardNewBox({ user }: { user: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // We pre-fill their info so they only have to select the package details!
  const [departure, setDeparture] = useState("Miami Warehouse");
  const [category, setCategory] = useState("Standard Box");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/shipments/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || "Not Provided",
          departure,
          category,
          description,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard?tab=overview"); // Send them back to overview!
          router.refresh(); // Refresh the data
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-green-100 text-center animate-in zoom-in duration-300">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-mex-dark mb-2">Box Registered!</h2>
        <p className="text-gray-500 font-medium">Your package is ready to be dropped off. Redirecting you...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl animate-in fade-in duration-500">
      <div className="mb-6 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-black text-mex-dark">Pre-Register a New Box</h2>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Your personal details ({user.firstName} {user.lastName}) are already attached to this order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16}/> Drop-off Location</label>
            <select value={departure} onChange={(e) => setDeparture(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium">
              <option>Miami Warehouse</option>
              <option>Orlando Warehouse</option>
              <option>Atlanta Warehouse</option>
            </select>
          </div>
          <div>
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