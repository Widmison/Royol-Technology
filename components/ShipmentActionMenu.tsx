"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScanLine, ScanBarcode, CheckCircle, Edit2, X, Save } from "lucide-react";

export default function ShipmentActionMenu({ pkg }: { pkg: any }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [status, setStatus] = useState(
    pkg.status === "PROCESSING" ? "IN_TRANSIT" : 
    pkg.status === "IN_TRANSIT" ? "READY_FOR_PICKUP" : "DELIVERED"
  );
  
  // Set default location to Doral or St Marc based on package status!
  const [location, setLocation] = useState(
    pkg.status === "PROCESSING" ? "1962 NW 82nd Ave Doral, FL 33126" : "St Marc Rue louverture #336 Bon jean Market"
  );
  
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // PRIMARY BUTTON LOGIC (Scanner Link)
  // ==========================================
  let ScanButton;
  if (pkg.status === 'PROCESSING') {
    ScanButton = (
      <Link href="/admin/scan?mode=us" className="text-white bg-mex-blue hover:bg-blue-900 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 flex-1 shadow-sm">
        <ScanLine size={16}/> Scan Out (US)
      </Link>
    );
  } else if (pkg.status === 'IN_TRANSIT' || pkg.status === 'CUSTOMS') {
    ScanButton = (
      <Link href="/admin/scan?mode=haiti" className="text-white bg-mex-orange hover:bg-orange-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 flex-1 shadow-sm">
        <ScanBarcode size={16}/> Scan In (HT)
      </Link>
    );
  } else if (pkg.status === 'READY_FOR_PICKUP') {
    ScanButton = (
      <Link href="/admin/scan?mode=haiti" className="text-white bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 flex-1 shadow-sm">
        <CheckCircle size={16}/> Mark Delivered
      </Link>
    );
  } else {
    ScanButton = (
      <span className="text-gray-400 bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 flex-1 border border-gray-200">
        <CheckCircle size={16}/> Completed
      </span>
    );
  }

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId: pkg.trackingId, status, location, description: description || "Manually updated by Admin" }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2 justify-end w-full md:w-auto">
      {ScanButton}
      
      {/* SECONDARY MANUAL EDIT BUTTON */}
      {pkg.status !== 'DELIVERED' && (
        <button onClick={() => setIsModalOpen(true)} className="p-2.5 bg-white text-gray-500 hover:bg-gray-100 hover:text-mex-blue rounded-xl transition-colors shadow-sm border border-gray-200 shrink-0" title="Manual Override">
          <Edit2 size={16} />
        </button>
      )}

      {/* MANUAL UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-black text-mex-dark flex items-center gap-2"><Edit2 className="text-mex-blue"/> Manual Update</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleManualUpdate} className="p-6 space-y-5">
              <div className="bg-blue-50 text-mex-blue px-4 py-3 rounded-xl font-black border border-blue-100 text-center mb-2 uppercase tracking-widest text-lg">
                {pkg.trackingId}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-mex-blue outline-none font-bold text-mex-dark bg-gray-50">
                  <option value="PROCESSING">Processing (At US Hub)</option>
                  <option value="IN_TRANSIT">Shipped! (In Transit to Haiti)</option>
                  <option value="CUSTOMS">Held at Customs</option>
                  <option value="READY_FOR_PICKUP">Ready for Pickup (Emails Client!)</option>
                  <option value="DELIVERED">Delivered / Picked Up</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-mex-blue outline-none font-bold text-mex-dark bg-gray-50">
                  <option>1962 NW 82nd Ave Doral, FL 33126</option>
                  <option>St Marc Rue louverture #336 Bon jean Market</option>
                  <option>Haiti Customs Port</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Note (Optional)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Delay due to weather" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-mex-blue outline-none font-bold text-mex-dark" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-mex-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? "Saving..." : <><Save size={18}/> Update Tracking</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}