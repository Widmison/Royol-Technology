"use client";

import { useState } from "react";
import { Package, Send, Plane, Ship, ArrowRight, ArrowLeft, MapPin, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. THIS CAPTURES ALL THE DATA FROM THE FORM
  const [formData, setFormData] = useState({
    departure: "",
    category: "",
    description: "",
    shippingMethod: "Air Freight",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    state: "Florida",
    city: "",
    zipCode: "",
  });

  // 2. UPDATES THE STATE WHEN THE USER TYPES
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. SENDS DATA TO YOUR DATABASE WHEN SUBMITTED
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
        setIsSuccess(true); // Shows the beautiful success screen!
        window.scrollTo(0, 0);
      } else {
        alert("Something went wrong. Please check your connection and try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black italic text-mex-blue uppercase mb-3 tracking-tight">Pre-Register Shipment</h1>
          <p className="text-gray-600 font-medium text-lg max-w-2xl mx-auto">
            Fill out your details below. Once submitted, bring your packages to our office to be weighed. We will generate your final invoice, and upon payment, your official tracking number will be issued!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* ============================== */}
          {/* SUCCESS SCREEN */}
          {/* ============================== */}
          {isSuccess ? (
            <div className="p-12 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="bg-green-100 p-6 rounded-full mb-6">
                <CheckCircle className="h-20 w-20 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-mex-dark mb-4">Registration Complete!</h2>
              <p className="text-lg text-gray-600 max-w-lg mb-8">
                We have successfully received your shipping details. Please bring your items to our office for weighing to generate your final invoice.
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 w-full max-w-md mb-8">
                <h4 className="font-bold text-mex-dark mb-2">Drop-off Location</h4>
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <MapPin className="text-mex-orange" size={18} /> 1962 NW 82nd Ave, Doral, FL 33126
                </p>
              </div>
              <Link href="/" className="bg-mex-blue text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-500/30">
                Return to Home
              </Link>
            </div>
          ) : (
            <>
              {/* ============================== */}
              {/* PRO MULTI-STEP INDICATOR */}
              {/* ============================== */}
              <div className="bg-mex-blue px-6 md:px-12 py-6 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] w-full h-full"></div>
                <div className={`flex items-center gap-4 relative z-10 transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full font-black text-lg shadow-inner ${step >= 1 ? 'bg-mex-orange text-white' : 'bg-blue-900 text-blue-300'}`}>1</div>
                  <h2 className="text-white font-bold text-lg hidden sm:block">Package Details</h2>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-blue-400/50 mx-4 sm:mx-8 relative z-10"></div>
                <div className={`flex items-center gap-4 relative z-10 transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full font-black text-lg shadow-inner ${step >= 2 ? 'bg-mex-orange text-white' : 'bg-blue-900 text-blue-300'}`}>2</div>
                  <h2 className="text-white font-bold text-lg hidden sm:block">Shipping Address</h2>
                </div>
              </div>
              
              {/* THE FORM IS NOW CONNECTED TO onSubmit */}
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 relative">
                
                {/* ============================== */}
                {/* STEP 1: PACKAGE DETAILS */}
                {/* ============================== */}
                <div className={`${step === 1 ? 'block' : 'hidden'} animate-in fade-in slide-in-from-left-4 duration-500`}>
                  <h3 className="font-bold text-mex-dark mb-6 flex items-center gap-2 text-xl pb-3 border-b border-gray-100">
                    <Package className="text-mex-orange" /> Package Information
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Country of Departure *</label>
                        <select name="departure" value={formData.departure} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange focus:border-transparent outline-none bg-white text-gray-700 font-medium hover:border-mex-blue transition-colors">
                          <option value="">Select Country</option>
                          <option value="USA">United States (USA)</option>
                          <option value="DR">Dominican Republic (DR)</option>
                          <option value="China">China</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Item Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange focus:border-transparent outline-none bg-white text-gray-700 font-medium hover:border-mex-blue transition-colors">
                          <option value="">Select Category</option>
                          <option value="Electronics">Electronics (Phone, Laptop)</option>
                          <option value="Clothing">Clothing & Shoes</option>
                          <option value="Documents">Documents</option>
                          <option value="Heavy">Heavy Appliances / Barrels</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description *</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange focus:border-transparent outline-none text-gray-700 font-medium hover:border-mex-blue transition-colors resize-none" placeholder="E.g., 2 iPhones and 5 pairs of sneakers..."></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Preferred Shipping Method *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-5 border-2 border-mex-blue/20 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-mex-blue transition-all group">
                          <div className="flex items-center gap-4">
                            <input type="radio" name="shippingMethod" value="Air Freight" checked={formData.shippingMethod === "Air Freight"} onChange={handleChange} className="w-5 h-5 text-mex-blue focus:ring-mex-blue" />
                            <div>
                              <div className="font-bold text-mex-dark text-lg">Air Freight</div>
                              <div className="text-sm text-gray-500 font-medium">5-7 Days (Faster)</div>
                            </div>
                          </div>
                          <Plane className="text-mex-blue group-hover:scale-110 transition-transform h-8 w-8" />
                        </label>

                        <label className="flex items-center justify-between p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-mex-blue transition-all group">
                          <div className="flex items-center gap-4">
                            <input type="radio" name="shippingMethod" value="Ocean Freight" checked={formData.shippingMethod === "Ocean Freight"} onChange={handleChange} className="w-5 h-5 text-mex-blue focus:ring-mex-blue" />
                            <div>
                              <div className="font-bold text-mex-dark text-lg">Ocean Freight</div>
                              <div className="text-sm text-gray-500 font-medium">14-21 Days (Cheaper for heavy)</div>
                            </div>
                          </div>
                          <Ship className="text-gray-400 group-hover:text-mex-blue group-hover:scale-110 transition-transform h-8 w-8" />
                        </label>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button type="button" onClick={() => { window.scrollTo(0,0); setStep(2); }} className="bg-mex-blue text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2">
                        Next Step <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ============================== */}
                {/* STEP 2: ADDRESS & CONTACT DETAILS */}
                {/* ============================== */}
                <div className={`${step === 2 ? 'block' : 'hidden'} animate-in fade-in slide-in-from-right-4 duration-500`}>
                  <h3 className="font-bold text-mex-dark mb-6 flex items-center gap-2 text-xl pb-3 border-b border-gray-100">
                    <MapPin className="text-mex-orange" /> Client & Destination Info
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First name *</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Nom Konple" className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange focus:border-transparent outline-none text-gray-700 font-medium hover:border-mex-blue transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last name *</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="MEXShipping" className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange focus:border-transparent outline-none text-gray-700 font-medium hover:border-mex-blue transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone number *</label>
                      <div className="flex shadow-sm rounded-xl">
                        <span className="inline-flex items-center px-5 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-bold">US+1</span>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="8095667700" className="flex-1 border border-gray-300 rounded-r-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange focus:border-transparent outline-none text-gray-700 font-medium hover:border-mex-blue transition-colors" />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
                      <h4 className="font-bold text-mex-dark mb-2 text-lg">Shipping Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
                          <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="1962 NW 82nd Ave, DO-78437" className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange focus:border-transparent outline-none text-gray-700 font-medium hover:border-mex-blue transition-colors" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                          <select name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange outline-none bg-white font-medium hover:border-mex-blue">
                            <option value="Florida">Florida</option>
                            <option value="New York">New York</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Doral" className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange outline-none font-medium hover:border-mex-blue" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">ZIP code *</label>
                          <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required placeholder="33126" className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-mex-orange outline-none font-medium hover:border-mex-blue" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-4 sm:justify-between items-center">
                      <button type="button" onClick={() => { window.scrollTo(0,0); setStep(1); }} className="w-full sm:w-auto text-gray-500 font-bold px-6 py-4 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft size={20} /> Back
                      </button>
                      
                      {/* SUBMIT BUTTON WITH LOADING STATE */}
                      <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-mex-orange text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                          <span className="animate-pulse">Saving...</span>
                        ) : (
                          <><Send size={20} /> Complete Registration</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}