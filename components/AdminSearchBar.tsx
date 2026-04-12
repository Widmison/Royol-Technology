"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, ScanBarcode, Camera, X } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';

export default function AdminSearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/admin/search" || typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q != null) setQuery(q);
  }, [pathname]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const scannedValue = result[0].rawValue;
      setQuery(scannedValue);
      setIsCameraOpen(false); // Close modal instantly
      router.push(`/admin/search?q=${encodeURIComponent(scannedValue)}`); // Auto-search!
    }
  };

  return (
    <>
      <form onSubmit={handleSearch} className="flex items-center bg-gray-50 rounded-xl px-4 py-2 w-full max-w-md border border-gray-200 shadow-sm focus-within:border-mex-blue focus-within:ring-2 focus-within:ring-blue-50 transition-all">
        <Search className="text-gray-400 h-5 w-5 mr-3 shrink-0" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Scan barcode or type ID..." 
          className="bg-transparent border-none focus:outline-none w-full text-sm font-bold text-mex-dark uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-400" 
        />
        
        {/* THE NEW CAMERA BUTTON IS RIGHT HERE! */}
        <button 
          type="button" 
          onClick={() => setIsCameraOpen(true)} 
          className="text-mex-orange hover:text-orange-700 transition-colors shrink-0 ml-2" 
          title="Open Device Camera"
        >
          <Camera size={20} />
        </button>
        
        <button type="submit" className="text-mex-blue hover:text-blue-800 transition-colors shrink-0 ml-3 pl-3 border-l border-gray-200" title="Search">
          <ScanBarcode size={20} />
        </button>
      </form>

      {/* THE CAMERA SCANNER MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-black text-mex-dark flex items-center gap-2">
                <Camera className="text-mex-blue"/> Scan to Search
              </h2>
              <button type="button" onClick={() => setIsCameraOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              <div className="rounded-2xl overflow-hidden border-4 border-mex-blue shadow-inner relative">
                <Scanner
                  onScan={handleScan}
                  onError={(error: any) => console.error("Camera Scan Error:", error?.message || error)}
                />
                <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>
              </div>
              <p className="text-center text-sm font-bold text-gray-400 mt-4">Point camera at QR Code or Barcode. Auto-searches on detection.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}