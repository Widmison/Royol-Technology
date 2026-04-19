"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminWordmark from "@/components/AdminWordmark";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package as PackageIcon,
  FileText,
  Users,
  Receipt,
  ScanLine,
  ScanBarcode,
  Settings,
  Menu,
  X,
  ExternalLink,
  Search,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import AdminSearchBar from "@/components/AdminSearchBar";
import DashboardShippingCalcTrigger from "@/components/DashboardShippingCalcTrigger";
import AdminSignOutButton from "@/components/AdminSignOutButton";
import PortalNotificationBell from "@/components/PortalNotificationBell";

export type AdminShellStats = {
  pendingQuotes: number;
  unpaidInvoices: number;
  activeShipments: number;
  clientCount: number;
  pendingExternalTracking: number;
};

function NavLink({
  href,
  active,
  children,
  badge,
  badgeTone = "orange",
  onNavigate,
  compact,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  badge?: number;
  badgeTone?: "orange" | "red";
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const showBadge = badge != null && badge > 0;
  const pad = compact ? "px-3 py-2" : "px-4 py-3";
  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={`flex items-center gap-2.5 rounded-xl font-medium transition-colors ${pad} ${
        active
          ? "bg-mex-blue text-white font-bold shadow-lg shadow-blue-900/50"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
      {showBadge && (
        <span
          className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white ${
            badgeTone === "red" ? "bg-red-500 animate-pulse" : "bg-mex-orange"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function SidebarNav({
  pathname,
  stats,
  onNavigate,
  compactSidebar = false,
}: {
  pathname: string;
  stats: AdminShellStats;
  onNavigate?: () => void;
  /** Desktop: fit in viewport without inner scroll */
  compactSidebar?: boolean;
}) {
  const isDash = pathname === "/admin/dashboard";
  const isQuotes = pathname.startsWith("/admin/quotes");
  const isInvoices = pathname.startsWith("/admin/invoices");
  const isShipments = pathname.startsWith("/admin/shipments");
  const isClients = pathname.startsWith("/admin/clients");
  const isSearch = pathname.startsWith("/admin/search");
  const isScan = pathname.startsWith("/admin/scan");
  const isSettings = pathname.startsWith("/admin/settings");
  const isExternalTracking = pathname.startsWith("/admin/external-tracking");
  const scanUs = isScan && pathname.includes("mode=us");
  const scanHt = isScan && pathname.includes("mode=haiti");

  const navIcon = compactSidebar ? 18 : 20;
  const extIcon = compactSidebar ? 16 : 18;
  /** Scroll only the nav stack so the shell stays viewport-locked; avoids clipping when the list grows. */
  const navScroll = "min-h-0 flex-1 overflow-y-auto overscroll-contain";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-[4.25rem] shrink-0 items-center border-b border-gray-800 bg-white px-3">
        <div className="flex min-w-0 items-center gap-2">
          <AdminWordmark href="/admin/dashboard" onClick={onNavigate} />
          <span className="shrink-0 rounded bg-mex-orange/20 px-1.5 py-0.5 text-[9px] font-bold text-mex-orange">
            ADMIN
          </span>
        </div>
      </div>

      <div className="shrink-0 border-b border-gray-800/80 px-3 py-2.5">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">Live pulse</p>
        <div className="grid grid-cols-2 gap-1.5 text-center">
          <Link
            href="/admin/shipments"
            onClick={onNavigate}
            className="block rounded-lg bg-white/5 px-1.5 py-1.5 transition hover:bg-white/10 hover:ring-1 hover:ring-white/15"
          >
            <div className="text-base font-black leading-none text-white">{stats.activeShipments}</div>
            <div className="mt-0.5 text-[8px] font-bold uppercase text-gray-500">Active</div>
          </Link>
          <Link
            href="/admin/quotes"
            onClick={onNavigate}
            className="block rounded-lg bg-white/5 px-1.5 py-1.5 transition hover:bg-white/10 hover:ring-1 hover:ring-mex-orange/40"
          >
            <div className="text-base font-black leading-none text-mex-orange">{stats.pendingQuotes}</div>
            <div className="mt-0.5 text-[8px] font-bold uppercase text-gray-500">Pending</div>
          </Link>
          <Link
            href="/admin/invoices"
            onClick={onNavigate}
            className="block rounded-lg bg-white/5 px-1.5 py-1.5 transition hover:bg-white/10 hover:ring-1 hover:ring-red-400/30"
          >
            <div className="text-base font-black leading-none text-red-400">{stats.unpaidInvoices}</div>
            <div className="mt-0.5 text-[8px] font-bold uppercase text-gray-500">Unpaid</div>
          </Link>
          <Link
            href="/admin/clients"
            onClick={onNavigate}
            className="block rounded-lg bg-white/5 px-1.5 py-1.5 transition hover:bg-white/10 hover:ring-1 hover:ring-white/15"
          >
            <div className="text-base font-black leading-none text-white">{stats.clientCount}</div>
            <div className="mt-0.5 text-[8px] font-bold uppercase text-gray-500">Clients</div>
          </Link>
        </div>
      </div>

      <nav
        className={`space-y-0.5 px-2 py-2 ${navScroll} ${
          compactSidebar ? "text-[13px] leading-snug" : "text-sm"
        }`}
      >
        <NavLink href="/admin/dashboard" active={isDash && !isQuotes} onNavigate={onNavigate} compact={compactSidebar}>
          <LayoutDashboard size={navIcon} /> Dashboard
        </NavLink>
        <NavLink href="/admin/quotes" active={isQuotes} badge={stats.pendingQuotes} onNavigate={onNavigate} compact={compactSidebar}>
          <FileText size={navIcon} /> Quote queue
        </NavLink>
        <NavLink
          href="/admin/invoices"
          active={isInvoices}
          badge={stats.unpaidInvoices}
          badgeTone="red"
          onNavigate={onNavigate}
          compact={compactSidebar}
        >
          <Receipt size={navIcon} /> Invoices &amp; billing
        </NavLink>
        <NavLink href="/admin/shipments" active={isShipments} onNavigate={onNavigate} compact={compactSidebar}>
          <PackageIcon size={navIcon} /> Shipments
        </NavLink>
        <NavLink href="/admin/clients" active={isClients} onNavigate={onNavigate} compact={compactSidebar}>
          <Users size={navIcon} /> Clients
        </NavLink>
        <NavLink
          href="/admin/external-tracking"
          active={isExternalTracking}
          badge={stats.pendingExternalTracking}
          onNavigate={onNavigate}
          compact={compactSidebar}
        >
          <ShoppingBag size={navIcon} /> External tracking
        </NavLink>
        <NavLink href="/admin/search" active={isSearch} onNavigate={onNavigate} compact={compactSidebar}>
          <Search size={navIcon} /> CRM search
        </NavLink>

        <div className={`border-t border-gray-800 ${compactSidebar ? "mt-2 pt-2" : "mt-4 pt-4"}`}>
          <p className={`mb-1.5 px-3 text-[9px] font-bold uppercase tracking-wider text-gray-500`}>Scanner hubs</p>
          <Link
            href="/admin/scan?mode=us"
            onClick={onNavigate}
            className={`flex items-center rounded-xl font-bold transition-colors ${
              compactSidebar ? "gap-2 px-3 py-2 text-[13px]" : "gap-3 px-4 py-3"
            } ${scanUs ? "bg-mex-blue text-white shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-mex-blue"}`}
          >
            <ScanLine size={navIcon} /> US — scan out
          </Link>
          <Link
            href="/admin/scan?mode=haiti"
            onClick={onNavigate}
            className={`flex items-center rounded-xl font-bold transition-colors ${
              compactSidebar ? "gap-2 px-3 py-2 text-[13px]" : "gap-3 px-4 py-3"
            } ${
              scanHt
                ? "bg-mex-orange text-white shadow-lg shadow-orange-900/30"
                : "text-gray-400 hover:bg-white/5 hover:text-mex-orange"
            }`}
          >
            <ScanBarcode size={navIcon} /> HT — scan in
          </Link>
        </div>

        <div className={`space-y-0.5 border-t border-gray-800 ${compactSidebar ? "mt-2 pt-2" : "mt-4 space-y-1 pt-4"}`}>
          <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-wider text-gray-500">Workspace</p>
          <DashboardShippingCalcTrigger variant={compactSidebar ? "admin" : "drawer"} />
          <NavLink href="/admin/settings" active={isSettings} onNavigate={onNavigate} compact={compactSidebar}>
            <Settings size={navIcon} /> Settings &amp; info
          </NavLink>
          <Link
            href="/quote"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={`flex items-center rounded-xl font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white ${
              compactSidebar ? "gap-2 px-3 py-2 text-[13px]" : "gap-3 px-4 py-3"
            }`}
          >
            <ExternalLink size={extIcon} /> Public quote form
          </Link>
          <Link
            href="/"
            onClick={onNavigate}
            className={`flex items-center rounded-xl font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white ${
              compactSidebar ? "gap-2 px-3 py-2 text-[13px]" : "gap-3 px-4 py-3"
            }`}
          >
            <ExternalLink size={extIcon} /> Marketing site
          </Link>
          <AdminSignOutButton
            onBeforeNavigate={onNavigate}
            className={`flex w-full items-center rounded-xl font-bold text-gray-400 transition-colors hover:bg-red-500/15 hover:text-red-300 ${
              compactSidebar ? "gap-2 px-3 py-2 text-[13px]" : "gap-3 px-4 py-3"
            }`}
          >
            <LogOut size={navIcon} /> Sign out
          </AdminSignOutButton>
        </div>
      </nav>
    </div>
  );
}

export default function AdminShell({
  children,
  stats,
}: {
  children: React.ReactNode;
  stats: AdminShellStats;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  /** Printable invoice / label — no chrome so browser print → Save as PDF works cleanly */
  if (pathname?.startsWith("/admin/print")) {
    return <div className="min-h-screen bg-white text-mex-dark">{children}</div>;
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex h-dvh min-h-0 w-full max-w-[100vw] max-h-dvh overflow-hidden bg-gray-50 font-sans">
      <aside className="z-30 hidden h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-mex-dark text-white shadow-xl md:flex">
        <SidebarNav pathname={pathname} stats={stats} compactSidebar />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMenu}
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[min(20rem,88vw)] bg-mex-dark text-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex justify-end p-2 border-b border-gray-800 shrink-0">
              <button
                type="button"
                onClick={closeMenu}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <SidebarNav pathname={pathname} stats={stats} onNavigate={closeMenu} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 lg:px-8 py-3 sm:py-3.5">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                className="md:hidden p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-mex-dark hover:bg-gray-100 shrink-0"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={22} />
              </button>
              <div className="hidden sm:flex items-center gap-3 border-l border-gray-100 pl-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-mex-blue flex items-center justify-center text-white text-xs font-black shrink-0">
                  AD
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-mex-dark truncate">Operations</div>
                  <div className="text-xs text-gray-500 truncate">MEX509 admin</div>
                </div>
              </div>
            </div>
            <div className="w-full sm:flex-1 sm:max-w-xl md:max-w-md lg:max-w-lg min-w-0">
              <AdminSearchBar />
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <PortalNotificationBell variant="admin" />
              <Link
                href="/admin/settings"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                <Settings size={18} /> Settings
              </Link>
              <AdminSignOutButton className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                <LogOut size={18} /> Sign out
              </AdminSignOutButton>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 sm:py-6 lg:px-10 lg:py-8">
          <div className="max-w-[1600px] mx-auto w-full min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
