"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { packageStatusShortLabel } from "@/lib/packageStatusDisplay";
import type { TrackingDetailPackage } from "@/components/tracking/TrackingDetailView";

type Props = {
  pkg: TrackingDetailPackage & { route?: string };
  onViewFull: () => void;
};

/** Single-line summary + “view more” for dense multi-shipment lists */
export default function TrackingCompactRow({ pkg, onViewFull }: Props) {
  const routeLabel = pkg.route ?? `${pkg.departure} → Haiti`;
  const latest = pkg.events[0];
  const summaryLine = latest
    ? `${latest.location} · ${packageStatusShortLabel(latest.status)}`
    : "No warehouse updates yet — we’ll post here as soon as your package moves.";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-mex-orange/25 hover:shadow-md">
      <div className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-mex-orange via-mex-orange/80 to-mex-blue/90 opacity-90" />

      <div className="flex flex-col gap-3 pl-5 pr-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:py-3 sm:pl-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={onViewFull}
              className="font-black tracking-wider text-mex-blue underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2 rounded-sm"
            >
              {pkg.trackingId}
            </button>
            <span className="hidden h-3 w-px bg-gray-200 sm:inline" aria-hidden />
            <span className="text-xs font-semibold text-gray-500">{routeLabel}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm font-medium text-gray-700">
            <span className="text-gray-400">Latest — </span>
            {summaryLine}
          </p>
          {latest && (
            <p className="mt-0.5 text-xs font-bold text-gray-400">
              {new Date(latest.date).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-mex-blue">
            <Sparkles size={12} className="text-mex-orange opacity-80" />
            {packageStatusShortLabel(pkg.status)}
          </span>
          <button
            type="button"
            onClick={onViewFull}
            className="inline-flex items-center gap-1 rounded-xl bg-mex-dark px-4 py-2.5 text-sm font-bold text-white shadow-md transition group-hover:bg-mex-orange group-hover:shadow-orange-500/25"
          >
            View full timeline
            <ChevronRight size={18} className="transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
