"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Send,
  Plane,
  Ship,
  Truck,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  DESTINATION_COUNTRIES,
  regionFieldForCountry,
  type RegionField,
} from "@/lib/address-options";

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    departure: "",
    category: "",
    description: "",
    shippingMethod: "Air Freight",
    firstName: "",
    lastName: "",
    phone: "",
    destinationCountry: "US",
    address: "",
    state: "FL",
    city: "",
    zipCode: "",
  });

  const regionField: RegionField = useMemo(
    () => regionFieldForCountry(formData.destinationCountry),
    [formData.destinationCountry]
  );

  useEffect(() => {
    const rf = regionFieldForCountry(formData.destinationCountry);
    if (rf.kind !== "select") return;
    const codes = new Set(rf.options.map((o) => o.code));
    setFormData((d) => {
      if (codes.has(d.state)) return d;
      return { ...d, state: rf.options[0]?.code ?? "" };
    });
  }, [formData.destinationCountry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Error submitting to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-black italic tracking-tight text-mex-blue md:text-4xl">
            Pre-register shipment
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-gray-600 sm:text-base">
            Submit your details, then bring your packages to our Doral office to weigh. We&apos;ll invoice you and
            issue tracking after payment.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
          {isSuccess ? (
            <div className="flex flex-col items-center gap-4 p-10 text-center animate-in fade-in zoom-in duration-300 sm:p-12">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-mex-dark">You&apos;re on the list!</h2>
              <p className="max-w-sm text-sm text-gray-600">
                We received your details. Visit{" "}
                <strong className="text-mex-dark">1962 NW 82nd Ave, Doral, FL 33126</strong> with your package to
                weigh and pay.
              </p>
              <Link
                href="/"
                className="mt-2 rounded-xl bg-mex-blue px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-900"
              >
                Home
              </Link>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-between gap-4 bg-mex-blue px-6 py-5 md:px-10">
                <div className={`flex items-center gap-3 ${step >= 1 ? "opacity-100" : "opacity-40"}`}>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                      step >= 1 ? "bg-mex-orange text-white" : "bg-blue-900 text-blue-300"
                    }`}
                  >
                    1
                  </div>
                  <span className="font-bold text-white sm:text-lg">Package</span>
                </div>
                <div className="mx-2 flex-1 border-t-2 border-dashed border-white/40" />
                <div className={`flex items-center gap-3 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                      step >= 2 ? "bg-mex-orange text-white" : "bg-blue-900 text-blue-300"
                    }`}
                  >
                    2
                  </div>
                  <span className="font-bold text-white sm:text-lg">Address</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="space-y-6 p-6 md:space-y-8 md:p-10">
                  {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-200 space-y-6">
                      <h3 className="flex items-center gap-2 border-b border-gray-100 pb-3 text-xl font-black text-mex-dark">
                        <Package className="h-5 w-5 text-mex-orange" /> Package information
                      </h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">Country of departure *</label>
                          <select
                            name="departure"
                            value={formData.departure}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-mex-orange"
                          >
                            <option value="">Select</option>
                            <option value="USA">United States</option>
                            <option value="DR">Dominican Republic</option>
                            <option value="China">China</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">Item category *</label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-mex-orange"
                          >
                            <option value="">Select</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing &amp; shoes</option>
                            <option value="Documents">Documents</option>
                            <option value="Heavy">Heavy / barrels</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">Detailed description *</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-mex-orange"
                          placeholder="What are you shipping?"
                        />
                      </div>
                      <div>
                        <p className="mb-3 text-sm font-bold text-gray-700">Preferred shipping method *</p>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-mex-blue/25 bg-blue-50/50 p-4 text-left transition hover:border-mex-blue">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="Air Freight"
                              checked={formData.shippingMethod === "Air Freight"}
                              onChange={handleChange}
                              className="h-5 w-5 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-black text-mex-dark">Air freight</div>
                              <div className="text-xs text-gray-500">About 5–7 business days</div>
                            </div>
                            <Plane className="ml-auto h-7 w-7 shrink-0 text-mex-blue" />
                          </label>
                          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-100 p-4 text-left transition hover:border-mex-blue">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="Ocean Freight"
                              checked={formData.shippingMethod === "Ocean Freight"}
                              onChange={handleChange}
                              className="h-5 w-5 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-black text-mex-dark">Ocean freight</div>
                              <div className="text-xs text-gray-500">About 14–21 business days</div>
                            </div>
                            <Ship className="ml-auto h-7 w-7 shrink-0 text-gray-400" />
                          </label>
                          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-amber-100 bg-amber-50/50 p-4 text-left transition hover:border-amber-400">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="Ground Freight"
                              checked={formData.shippingMethod === "Ground Freight"}
                              onChange={handleChange}
                              className="h-5 w-5 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-black text-mex-dark">Ground</div>
                              <div className="text-xs text-gray-500">Truck / regional</div>
                            </div>
                            <Truck className="ml-auto h-7 w-7 shrink-0 text-amber-700" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200 space-y-6">
                      <h3 className="flex items-center gap-2 border-b border-gray-100 pb-3 text-xl font-black text-mex-dark">
                        <MapPin className="h-5 w-5 text-mex-orange" /> Contact &amp; destination
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">First name *</label>
                          <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">Last name *</label>
                          <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">Phone number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                          placeholder="+1 …"
                        />
                      </div>
                      <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:p-6">
                        <p className="text-sm font-black text-mex-dark">Delivery address</p>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">Country *</label>
                        <select
                          name="destinationCountry"
                          value={formData.destinationCountry}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                        >
                          {DESTINATION_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">Street address *</label>
                          <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                          />
                        </div>
                        {regionField.kind === "select" ? (
                          <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                              {regionField.label} *
                            </label>
                            <select
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                            >
                              {regionField.options.map((o) => (
                                <option key={o.code} value={o.code}>
                                  {o.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                              {regionField.label} *
                            </label>
                            <input
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              placeholder={regionField.placeholder}
                              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">City *</label>
                            <input
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Postal / ZIP</label>
                            <input
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-mex-orange"
                              placeholder="If applicable"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="ml-auto flex w-full items-center justify-center gap-2 rounded-xl bg-mex-blue px-6 py-3.5 text-base font-bold text-white shadow-lg hover:bg-blue-900 sm:w-auto"
                    >
                      Next step <ArrowRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-base font-bold text-gray-600 shadow-sm hover:bg-gray-50 sm:w-auto"
                      >
                        <ArrowLeft className="h-5 w-5" /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-mex-orange px-6 py-3.5 text-base font-bold text-white shadow-lg hover:bg-orange-700 disabled:opacity-60 sm:w-auto"
                      >
                        {isSubmitting ? "Saving…" : (
                          <>
                            <Send className="h-5 w-5" /> Complete registration
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
