"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, ScanBarcode, Camera, X } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

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

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  useEffect(() => {
    if (!isCameraOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCamera();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isCameraOpen, closeCamera]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleScan = (result: unknown) => {
    const r = result as { rawValue?: string }[] | null;
    if (r && r.length > 0 && r[0]?.rawValue) {
      const scannedValue = r[0].rawValue;
      setQuery(scannedValue);
      closeCamera();
      router.push(`/admin/search?q=${encodeURIComponent(scannedValue)}`);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="flex w-full max-w-md items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 shadow-sm transition-all focus-within:border-mex-blue focus-within:ring-2 focus-within:ring-blue-50"
      >
        <Search className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Scan barcode or type ID..."
          className="w-full border-none bg-transparent text-sm font-bold uppercase text-mex-dark placeholder:normal-case placeholder:font-medium placeholder:text-gray-400 focus:outline-none"
        />

        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="ml-2 shrink-0 text-mex-orange transition-colors hover:text-orange-700"
          title="Open camera scanner"
          aria-expanded={isCameraOpen}
          aria-haspopup="dialog"
        >
          <Camera size={20} />
        </button>

        <button
          type="submit"
          className="ml-3 shrink-0 border-l border-gray-200 pl-3 text-mex-blue transition-colors hover:text-blue-800"
          title="Search"
        >
          <ScanBarcode size={20} />
        </button>
      </form>

      {isCameraOpen && (
        <div
          className="fixed inset-0 z-[450] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeCamera}
          onKeyDown={(e) => e.key === "Escape" && closeCamera()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="camera-scan-title"
            className="flex max-h-[min(92vh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-4 sm:px-6">
              <h2 id="camera-scan-title" className="flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
                <Camera className="shrink-0 text-mex-blue" size={22} aria-hidden />
                Scan to search
              </h2>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-full bg-white p-2.5 text-gray-500 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-mex-dark"
                aria-label="Close camera"
              >
                <X size={22} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="relative overflow-hidden rounded-2xl border-4 border-mex-blue shadow-inner">
                <Scanner
                  onScan={handleScan}
                  onError={(error: unknown) =>
                    console.error("Camera scan error:", error instanceof Error ? error.message : error)
                  }
                />
                <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
              </div>
              <p className="mt-4 text-center text-sm font-bold text-gray-500">
                Point at a QR code or barcode — search runs automatically when detected.
              </p>
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={closeCamera}
                className="w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 text-sm font-black text-mex-dark shadow-sm transition hover:bg-gray-50"
              >
                Close camera
              </button>
              <p className="mt-2 text-center text-xs font-medium text-gray-400">
                Tap outside, press Esc, or use Close to stop the camera.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
