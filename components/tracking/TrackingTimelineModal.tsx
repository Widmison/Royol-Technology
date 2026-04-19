"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import TrackingDetailView, {
  type TrackingDetailPackage,
} from "@/components/tracking/TrackingDetailView";

type Props = {
  open: boolean;
  packageData: TrackingDetailPackage | null;
  onClose: () => void;
};

export default function TrackingTimelineModal({ open, packageData, onClose }: Props) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  if (!open || !packageData) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-mex-dark/55 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div
        className="relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-4xl flex-col rounded-t-[1.75rem] border border-white/20 bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-4 duration-300 sm:rounded-3xl sm:shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0">
            <p id="tracking-modal-title" className="text-xs font-black uppercase tracking-[0.2em] text-mex-orange">
              Full timeline
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-600">
              Every warehouse scan and status update for this shipment.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-mex-dark"
            aria-label="Close"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-6">
          <TrackingDetailView {...packageData} showInvoice={false} />
        </div>
      </div>
    </div>
  );
}
