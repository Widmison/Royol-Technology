"use client";

import { useState } from "react";
import { MapPin, Navigation, Copy, Check, Warehouse } from "lucide-react";

const ADDRESS_LINE1 = "1962 NW 82nd Ave";
const ADDRESS_LINE2 = "Doral, FL 33126";
const ADDRESS_SINGLE = `${ADDRESS_LINE1}, ${ADDRESS_LINE2}`;

const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_SINGLE)}`;

type Props = {
  /** Table cell: tighter horizontal layout */
  variant?: "default" | "compact";
};

export default function PendingDropoffHelp({ variant = "default" }: Props) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS_SINGLE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API unavailable
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex flex-col gap-2 min-w-0 max-w-[280px]">
        <p className="text-[11px] font-bold uppercase tracking-wide text-mex-blue flex items-center gap-1">
          <Warehouse size={12} className="shrink-0" />
          US receiving dock
        </p>
        <p className="text-xs text-gray-600 leading-snug">
          {ADDRESS_LINE1}
          <br />
          {ADDRESS_LINE2}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-mex-orange px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow-sm hover:bg-orange-700 transition-colors"
          >
            <Navigation size={14} className="shrink-0" />
            Maps
          </a>
          <button
            type="button"
            onClick={copyAddress}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-mex-blue/20 bg-gradient-to-br from-blue-50/80 to-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mex-blue text-white shadow-md">
          <MapPin size={22} strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-mex-blue mb-1">
            Bring your sealed box here
          </p>
          <p className="font-bold text-mex-dark leading-snug">{ADDRESS_LINE1}</p>
          <p className="font-bold text-mex-dark">{ADDRESS_LINE2}</p>
          <p className="mt-2 text-xs text-gray-500 font-medium leading-relaxed">
            Mon–Sat during warehouse hours. Have your ID ready; mention MEX509 pre-registration.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-mex-orange px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 hover:bg-orange-700 transition-colors"
        >
          <Navigation size={18} />
          Open in Google Maps
        </a>
        <button
          type="button"
          onClick={copyAddress}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:border-mex-blue/30 hover:bg-gray-50 transition-colors"
        >
          {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
          {copied ? "Copied to clipboard" : "Copy address"}
        </button>
      </div>
    </div>
  );
}
