"use client";

import { useState, useRef, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle, XCircle, Camera, Keyboard } from "lucide-react";
import { ALL_ADMIN_SCAN_STATUS_OPTIONS, optionForStatus } from "@/lib/adminTrackingStatusOptions";

export default function AdminScanHubPage() {
  const [trackingId, setTrackingId] = useState("");
  const [status, setStatus] = useState("RECEIVED_USA_WAREHOUSE");
  const [location, setLocation] = useState(
    () => optionForStatus("RECEIVED_USA_WAREHOUSE")?.defaultLocation ?? "1962 NW 82nd Ave Doral, FL 33191"
  );

  const [hubTitle, setHubTitle] = useState("Barcode Scanner Hub");
  const [themeColor, setThemeColor] = useState("text-mex-blue");
  const [headerAvatar, setHeaderAvatar] = useState("WH");

  const [isScanning, setIsScanning] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [recentScans, setRecentScans] = useState<
    { id: string; success: boolean; message: string; time: Date }[]
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("mode");

    if (mode === "us") {
      setHubTitle("US Dispatch Hub (Scan Out)");
      setStatus("RECEIVED_USA_WAREHOUSE");
      setLocation(optionForStatus("RECEIVED_USA_WAREHOUSE")?.defaultLocation ?? "1962 NW 82nd Ave Doral, FL 33191");
      setThemeColor("text-mex-blue");
      setHeaderAvatar("US");
    } else if (mode === "haiti") {
      setHubTitle("Haiti Receiving Hub (Scan In)");
      setStatus("ARRIVED_HT_MAIN_WAREHOUSE");
      setLocation(
        optionForStatus("ARRIVED_HT_MAIN_WAREHOUSE")?.defaultLocation ?? "St Marc Rue louverture #336 Bon jean Market"
      );
      setThemeColor("text-mex-orange");
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
        body: JSON.stringify({
          trackingId: currentScan,
          status,
          location,
          description: optionForStatus(status)?.detail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setRecentScans((prev) => [
          {
            id: currentScan,
            success: true,
            message: `Updated ${data.clientName}'s package to ${String(status).split("_").join(" ")}`,
            time: new Date(),
          },
          ...prev,
        ]);
      } else {
        setRecentScans((prev) => [
          { id: currentScan, success: false, message: data.error, time: new Date() },
          ...prev,
        ]);
      }
    } catch {
      setRecentScans((prev) => [
        { id: currentScan, success: false, message: "Network Error", time: new Date() },
        ...prev,
      ]);
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
    <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md ${
              headerAvatar === "US" ? "bg-mex-blue" : headerAvatar === "HT" ? "bg-mex-orange" : "bg-gray-700"
            }`}
          >
            {headerAvatar}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Station</p>
            <h1 className={`text-xl sm:text-3xl font-black tracking-tight break-words ${themeColor}`}>{hubTitle}</h1>
          </div>
        </div>
      </div>

      <p className="text-gray-500 font-medium text-sm text-center sm:text-left">
        Set location and action, then scan with USB keyboard or device camera.
      </p>

      <div className="w-full bg-white p-5 sm:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              1. Current location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-3 focus:border-mex-blue outline-none font-bold text-mex-dark bg-gray-50 text-sm sm:text-base max-w-full"
            >
              <option>1962 NW 82nd Ave Doral, FL 33191</option>
              <option>St Marc Rue louverture #336 Bon jean Market</option>
              <option>Haiti Customs Port</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              2. Action to apply
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-3 focus:border-mex-blue outline-none font-bold text-mex-dark bg-gray-50 text-sm sm:text-base max-h-48"
            >
              {ALL_ADMIN_SCAN_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <button
            type="button"
            onClick={() => setUseCamera(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all text-sm sm:text-base ${
              !useCamera ? "bg-mex-dark text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Keyboard size={20} /> USB / manual
          </button>
          <button
            type="button"
            onClick={() => setUseCamera(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all text-sm sm:text-base ${
              useCamera
                ? `${headerAvatar === "US" ? "bg-mex-blue" : "bg-mex-orange"} text-white shadow-lg`
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Camera size={20} /> Camera
          </button>
        </div>

        {useCamera ? (
          <div className="animate-in zoom-in-95 duration-300">
            <div
              className={`rounded-2xl overflow-hidden border-4 shadow-inner relative max-h-[70vh] ${headerAvatar === "US" ? "border-mex-blue" : "border-mex-orange"}`}
            >
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    processScan(result[0].rawValue);
                  }
                }}
                onError={(error: unknown) =>
                  console.error("Camera Scan Error:", error instanceof Error ? error.message : error)
                }
              />
              <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none" />
            </div>
            <p className="text-center text-sm font-bold text-gray-400 mt-4">
              Point at barcode — auto-submits on read.
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="relative animate-in zoom-in-95 duration-300">
            <label className="block text-sm font-black text-mex-dark mb-2 text-center">3. Scan or type ID</label>
            <input
              ref={inputRef}
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              disabled={isScanning}
              placeholder="MEX… then Enter"
              className={`w-full border-4 rounded-2xl px-4 sm:px-6 py-5 sm:py-6 text-center text-xl sm:text-3xl font-black text-mex-dark placeholder:text-gray-300 focus:outline-none focus:ring-4 transition-all shadow-inner uppercase max-w-full ${headerAvatar === "US" ? "border-mex-blue focus:ring-blue-100" : "border-mex-orange focus:ring-orange-100"}`}
            />
            <button type="submit" className="hidden">
              Submit
            </button>
          </form>
        )}
      </div>

      <div className="w-full max-w-3xl mx-auto px-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-4">
          <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Recent scans</h3>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm w-fit">
            {recentScans.length} this session
          </span>
        </div>
        <div className="space-y-3">
          {recentScans.length === 0 ? (
            <div className="text-center text-gray-400 font-medium py-8 bg-white rounded-2xl border border-gray-100 border-dashed">
              Waiting for first scan…
            </div>
          ) : (
            recentScans.map((scan, i) => (
              <div
                key={i}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border shadow-sm animate-in slide-in-from-top-2 duration-300 ${
                  scan.success ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                }`}
              >
                <div className="flex items-start gap-3 shrink-0">
                  {scan.success ? (
                    <CheckCircle className="text-green-500" size={24} />
                  ) : (
                    <XCircle className="text-red-500" size={24} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span
                        className={`font-black break-all ${scan.success ? "text-green-800" : "text-red-800"}`}
                      >
                        {scan.id}
                      </span>
                      <span className="text-xs font-bold text-gray-400 shrink-0">
                        {scan.time.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={`text-sm font-medium mt-1 break-words ${scan.success ? "text-green-600" : "text-red-600"}`}>
                      {scan.message}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
