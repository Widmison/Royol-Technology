"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Scanner } from '@yudiel/react-qr-scanner';
import { 
  LayoutDashboard, Package as PackageIcon, FileText, Users, 
  Receipt, ScanBarcode, CheckCircle, XCircle, ScanLine, Camera, Keyboard
} from "lucide-react";

export default function AdminScanHubPage() {
  const [trackingId, setTrackingId] = useState("");
  const [status, setStatus] = useState("READY_FOR_PICKUP");
  const [location, setLocation] = useState("St Marc Rue louverture #336 Bon jean Market"); // Updated default
  
  // DYNAMIC UI STATE BASED ON URL
  const [hubTitle, setHubTitle] = useState("Barcode Scanner Hub");
  const [themeColor, setThemeColor] = useState("text-mex-blue");
  const [themeBg, setThemeBg] = useState("bg-blue-100");
  const [headerAvatar, setHeaderAvatar] = useState("WH");

  const [isScanning, setIsScanning] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [recentScans, setRecentScans] = useState<{id: string, success: boolean, message: string, time: Date}[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("mode");

    if (mode === "us") {
      setHubTitle("US Dispatch Hub (Scan Out)");
      setLocation("1962 NW 82nd Ave Doral, FL 33126"); // Updated Doral
      setStatus("IN_TRANSIT");
      setThemeColor("text-mex-blue");
      setThemeBg("bg-blue-100");
      setHeaderAvatar("US");
    } else if (mode === "haiti") {
      setHubTitle("Haiti Receiving Hub (Scan In)");
      setLocation("St Marc Rue louverture #336 Bon jean Market"); // Updated St Marc
      setStatus("READY_FOR_PICKUP");
      setThemeColor("text-mex-orange");
      setThemeBg("bg-orange-100");
      setHeaderAvatar("HT");
    }
  }, []);

  useEffect(() => {
    if (!useCamera) inputRef.current?.focus();
  }, [recentScans, useCamera]);

  const processScan = async (scannedId: string) => {
    if (isScanning) return;
    setIsScanning(true);
    
    const currentScan = scannedId.trim().toUpperCase();

    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId: currentScan, status, location }),
      });

      const data = await res.json();

      if (res.ok) {
        setRecentScans(prev => [{ id: currentScan, success: true, message: `Updated ${data.clientName}'s package to ${status.replace('_', ' ')}`, time: new Date() }, ...prev]);
      } else {
        setRecentScans(prev => [{ id: currentScan, success: false, message: data.error, time: new Date() }, ...prev]);
      }
    } catch (err) {
      setRecentScans(prev => [{ id: currentScan, success: false, message: "Network Error", time: new Date() }, ...prev]);
    } finally {
      setIsScanning(false);
      setTrackingId(""); 
      setUseCamera(false); 
      if (!useCamera) inputRef.current?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) processScan(trackingId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-mex-dark text-white hidden md:flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-white">
          <Image src="/logo.jpg" alt="Mex509 Logo" width={120} height={40} className="h-8 w-auto object-contain" />
          <span className="ml-2 text-xs font-bold bg-mex-orange/20 text-mex-orange px-2 py-0.5 rounded">ADMIN</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <FileText size={20} /> Quote Requests 
          </Link>
          <Link href="/admin/invoices" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <Receipt size={20} /> Invoices & Billing
          </Link>
          <Link href="/admin/shipments" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <PackageIcon size={20} /> Manage Shipments
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <Users size={20} /> Client Database
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scanner Operations</p>
            <Link href="/admin/scan?mode=us" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${headerAvatar === 'US' ? 'bg-mex-blue text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-mex-blue hover:bg-white/5'}`}>
              <ScanLine size={20} /> US: Scan Out (Dispatch)
            </Link>
            <Link href="/admin/scan?mode=haiti" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${headerAvatar === 'HT' ? 'bg-mex-orange text-white shadow-lg shadow-orange-900/50' : 'text-gray-400 hover:text-mex-orange hover:bg-white/5'}`}>
              <ScanBarcode size={20} /> HT: Scan In (Receive)
            </Link>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-2">
             <h2 className="font-black text-xl text-mex-dark tracking-tight hidden md:block">Warehouse Operations</h2>
          </div>
          <div className="flex items-center gap-3 border-l border-gray-100 pl-6 cursor-pointer">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${headerAvatar === 'US' ? 'bg-mex-blue' : 'bg-mex-orange'}`}>
              {headerAvatar}
            </div>
            <div>
              <div className="text-sm font-bold text-mex-dark">Scanner Hub</div>
              <div className="text-xs text-gray-500">Station 1</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col items-center">
          
          <div className="text-center mb-8 animate-in fade-in duration-500">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${themeBg} ${themeColor}`}>
              <ScanBarcode size={40} />
            </div>
            <h1 className={`text-4xl font-black mb-2 tracking-tight ${themeColor}`}>{hubTitle}</h1>
            <p className="text-gray-500 font-medium">Verify location and action below, then begin scanning packages rapidly.</p>
          </div>

          <div className="w-full max-w-3xl bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* SCANNER SETTINGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">1. Current Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-mex-blue outline-none font-bold text-mex-dark bg-gray-50 truncate">
                  {/* UPDATED WAREHOUSE LOCATIONS */}
                  <option>1962 NW 82nd Ave Doral, FL 33126</option>
                  <option>St Marc Rue louverture #336 Bon jean Market</option>
                  <option>Haiti Customs Port</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">2. Action to Apply</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-mex-blue outline-none font-bold text-mex-dark bg-gray-50">
                  <option value="IN_TRANSIT">Shipped! (In Transit to Haiti)</option>
                  <option value="CUSTOMS">Held at Customs</option>
                  <option value="READY_FOR_PICKUP">Ready for Client Pickup (Triggers Email!)</option>
                  <option value="DELIVERED">Package Delivered / Picked Up</option>
                </select>
              </div>
            </div>

            {/* SCANNER TOGGLE BUTTONS */}
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setUseCamera(false)} 
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${!useCamera ? 'bg-mex-dark text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <Keyboard size={20} /> USB / Manual
              </button>
              <button 
                onClick={() => setUseCamera(true)} 
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${useCamera ? `${headerAvatar === 'US' ? 'bg-mex-blue' : 'bg-mex-orange'} text-white shadow-lg` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <Camera size={20} /> Device Camera
              </button>
            </div>

            {/* CONDITIONAL SCANNER RENDER */}
            {useCamera ? (
              <div className="animate-in zoom-in-95 duration-300">
                <div className={`rounded-2xl overflow-hidden border-4 shadow-inner relative ${headerAvatar === 'US' ? 'border-mex-blue' : 'border-mex-orange'}`}>
                  <Scanner
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        processScan(result[0].rawValue);
                      }
                    }}
                    onError={(error: any) => console.error("Camera Scan Error:", error?.message || error)}
                  />
                  {/* Visual Scanning Overlay Line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>
                </div>
                <p className="text-center text-sm font-bold text-gray-400 mt-4">Point camera at QR Code or Barcode. Auto-submits on detection.</p>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="relative animate-in zoom-in-95 duration-300">
                <label className="block text-sm font-black text-mex-dark mb-2 text-center">3. Scan QR or Barcode</label>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  disabled={isScanning}
                  placeholder="Scan or type MEX... and press Enter"
                  className={`w-full border-4 rounded-2xl px-6 py-6 text-center text-3xl font-black text-mex-dark placeholder:text-gray-300 focus:outline-none focus:ring-4 transition-all shadow-inner uppercase ${headerAvatar === 'US' ? 'border-mex-blue focus:ring-blue-100' : 'border-mex-orange focus:ring-orange-100'}`}
                />
                <button type="submit" className="hidden">Submit</button>
              </form>
            )}
          </div>

          {/* RECENT SCANS LOG */}
          <div className="w-full max-w-3xl">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Recent Scans</h3>
              <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">{recentScans.length} packages scanned</span>
            </div>
            <div className="space-y-3">
              {recentScans.length === 0 ? (
                 <div className="text-center text-gray-400 font-medium py-8 bg-white rounded-2xl border border-gray-100 border-dashed">Waiting for first scan...</div>
              ) : (
                recentScans.map((scan, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm animate-in slide-in-from-top-2 duration-300 ${scan.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    {scan.success ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-black ${scan.success ? 'text-green-800' : 'text-red-800'}`}>{scan.id}</span>
                        <span className="text-xs font-bold text-gray-400">{scan.time.toLocaleTimeString()}</span>
                      </div>
                      <div className={`text-sm font-medium mt-0.5 ${scan.success ? 'text-green-600' : 'text-red-600'}`}>{scan.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}