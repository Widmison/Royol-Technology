"use client";

import { Printer, X } from "lucide-react";

export default function PrintChrome() {
  return (
    <div className="print:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-mex-orange px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-700"
        >
          <Printer className="h-5 w-5 shrink-0" aria-hidden />
          Print or Save as PDF
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          <X className="h-5 w-5 shrink-0" aria-hidden />
          Close tab
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-lg text-center text-[11px] text-gray-500">
        Tip: in the print dialog, choose <strong>Save as PDF</strong> to download a file.
      </p>
    </div>
  );
}
