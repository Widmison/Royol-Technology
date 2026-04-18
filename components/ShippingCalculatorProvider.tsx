"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import ShippingCalculatorModal from "@/components/ShippingCalculatorModal";

type Ctx = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const ShippingCalculatorContext = createContext<Ctx | null>(null);

export function useShippingCalculator(): Ctx {
  const v = useContext(ShippingCalculatorContext);
  if (!v) {
    throw new Error("useShippingCalculator must be used within ShippingCalculatorProvider");
  }
  return v;
}

export function ShippingCalculatorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <ShippingCalculatorContext.Provider value={value}>
      {children}
      <ShippingCalculatorModal isOpen={isOpen} onClose={close} />
    </ShippingCalculatorContext.Provider>
  );
}
