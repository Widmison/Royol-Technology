"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  Menu,
  Search,
  X,
  LayoutDashboard,
  Plus,
  Package,
  Receipt,
  DollarSign,
  Settings,
  Scale,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import DashboardShippingCalcTrigger from "@/components/DashboardShippingCalcTrigger";
import ClientSignOutButton from "@/components/ClientSignOutButton";

type Props = {
  user: { firstName?: string | null; lastName?: string | null; email: string };
  currentTab: string;
  unpaidCount: number;
};

export default function MobileClientNav({ user, currentTab, unpaidCount }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const link = (tab: string, label: string, icon: React.ReactNode, badge?: number) => (
    <Link
      href={`/dashboard?tab=${tab}`}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
        currentTab === tab
          ? "bg-mex-orange text-white font-bold shadow-lg shadow-orange-900/40"
          : "text-gray-200 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </Link>
  );

  const drawer = open && mounted && (
    <div
      className="fixed inset-0 z-[500] md:hidden pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Account menu"
    >
      <button
        type="button"
        className="absolute inset-0 z-[500] bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-label="Close menu"
      />
      <div
        className="absolute left-0 top-0 z-[501] flex h-dvh max-h-dvh w-[min(20rem,92vw)] flex-col bg-mex-dark text-white shadow-2xl animate-in slide-in-from-left duration-200"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-800 p-3">
          <BrandLogo
            href="/"
            onClick={() => setOpen(false)}
            width={200}
            height={64}
            alt="MEX509"
            className="h-7 w-auto max-w-[160px] object-left"
            prefetch={false}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-xl p-2 text-gray-300 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>
        <div className="shrink-0 border-b border-gray-800 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Signed in</p>
          <p className="truncate font-black text-white">
            {user.firstName || "Valued"} {user.lastName || "Customer"}
          </p>
          <p className="truncate text-xs text-gray-400">{user.email}</p>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3">
          {link("tracking", "Live tracking", <Search size={20} />)}
          {link("overview", "My overview", <LayoutDashboard size={20} />)}
          {link("new-box", "Pre-register box", <Plus size={20} />)}
          {link("shipments", "All shipments", <Package size={20} />)}
          {link("invoices", "Billing & invoices", <Receipt size={20} />, unpaidCount)}
          {link("external", "Add tracking", <ShoppingBag size={20} />)}
          <div className="mt-4 space-y-1 border-t border-gray-800 pt-4">
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Info</p>
            {link("pricing", "Pricing & services", <DollarSign size={20} />)}
            {link("profile", "Profile settings", <Settings size={20} />)}
            {link("terms", "CGU / legal", <Scale size={20} />)}
          </div>
        </nav>
        <div className="shrink-0 space-y-2 border-t border-gray-800 bg-mex-dark p-4">
          <DashboardShippingCalcTrigger variant="drawer" />
          <ClientSignOutButton
            onBeforeNavigate={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-bold text-white transition-colors hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} /> Sign out
          </ClientSignOutButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-mex-dark hover:bg-gray-100"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}
