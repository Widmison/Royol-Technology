"use client";

import { Calculator } from "lucide-react";
import { useShippingCalculator } from "@/components/ShippingCalculatorProvider";

type Props = {
  /** Dark sidebar (desktop) vs mobile drawer vs dense admin nav */
  variant?: "sidebar" | "drawer" | "admin";
};

export default function DashboardShippingCalcTrigger({ variant = "sidebar" }: Props) {
  const { open } = useShippingCalculator();

  const base =
    variant === "sidebar"
      ? "flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:border-mex-orange/50"
      : variant === "drawer"
        ? "flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-gray-200 transition hover:bg-white/10 hover:text-white"
        : "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-gray-400 transition hover:bg-white/5 hover:text-white";

  return (
    <button type="button" onClick={open} className={base}>
      <Calculator
        className={`shrink-0 text-mex-orange ${variant === "admin" ? "h-4 w-4" : "h-5 w-5"}`}
        aria-hidden
      />
      Calculate shipping
    </button>
  );
}
