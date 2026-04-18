"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { X, Plane, Ship, Truck } from "lucide-react";
import {
  type CalculatorMethod,
  estimateShippingTotal,
  formatUsd,
  CALC_AIR_PER_LB,
  CALC_SEA_PER_LB,
  CALC_GROUND_PER_LB,
} from "@/lib/shippingCalculatorRates";

export type ShippingCalculatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const METHODS: {
  id: CalculatorMethod;
  label: string;
  sub: string;
  rate: number;
  icon: typeof Plane;
}[] = [
  { id: "air", label: "Air", sub: "Avion", rate: CALC_AIR_PER_LB, icon: Plane },
  { id: "sea", label: "Sea", sub: "Bato", rate: CALC_SEA_PER_LB, icon: Ship },
  { id: "ground", label: "Ground", sub: "Terrestre", rate: CALC_GROUND_PER_LB, icon: Truck },
];

export default function ShippingCalculatorModal({ isOpen, onClose }: ShippingCalculatorModalProps) {
  const titleId = useId();
  const [weight, setWeight] = useState("");
  const [method, setMethod] = useState<CalculatorMethod>("air");

  const weightNum = useMemo(() => {
    const n = parseFloat(weight);
    return Number.isFinite(n) ? n : 0;
  }, [weight]);

  const total = useMemo(() => estimateShippingTotal(weightNum, method), [weightNum, method]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setWeight("");
      setMethod("air");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close shipping calculator"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[601] flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/90 px-5 py-4">
          <h2 id={titleId} className="text-lg font-black text-mex-dark sm:text-xl">
            Shipping cost calculator
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-200 hover:text-mex-dark"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-6">
          <p className="text-sm font-medium text-gray-600">
            Estimate is based on weight only. Final pricing may include fees, customs, or adjustments at drop-off.
          </p>

          <div>
            <label htmlFor="calc-weight" className="mb-2 block text-sm font-bold text-gray-800">
              Weight (LBS)
            </label>
            <input
              id="calc-weight"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="e.g. 3"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-semibold text-mex-dark outline-none ring-mex-orange focus:ring-2"
            />
          </div>

          <fieldset>
            <legend className="mb-3 block text-sm font-bold text-gray-800">Shipping method</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {METHODS.map(({ id, label, sub, rate, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 text-left transition ${
                    method === id
                      ? "border-mex-orange bg-orange-50/80 shadow-md"
                      : "border-gray-100 bg-gray-50/60 hover:border-mex-blue/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="calc-method"
                    value={id}
                    checked={method === id}
                    onChange={() => setMethod(id)}
                    className="sr-only"
                  />
                  <Icon className={`h-6 w-6 ${method === id ? "text-mex-orange" : "text-mex-blue"}`} aria-hidden />
                  <span className="font-black text-mex-dark">
                    {label}{" "}
                    <span className="text-xs font-bold text-gray-500">({sub})</span>
                  </span>
                  <span className="text-xs font-bold text-gray-600">${rate.toFixed(2)}/lb</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-2xl border border-mex-blue/20 bg-mex-blue/5 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-mex-blue">Estimated total</p>
            <p className="mt-1 text-3xl font-black tabular-nums text-mex-dark">{formatUsd(total)}</p>
            {weightNum <= 0 && (
              <p className="mt-1 text-xs font-medium text-gray-500">Enter a weight above zero to see an estimate.</p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-mex-blue py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
