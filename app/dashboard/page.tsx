import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ClientTrackingIdLink from "@/components/ClientTrackingIdLink";
import BrandLogo from "@/components/BrandLogo";
import {
  Package,
  Receipt,
  MapPin,
  LogOut,
  LayoutDashboard,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Plane,
  Ship,
  Smartphone,
  Laptop,
  Tablet,
  Router,
  TriangleAlert,
  Scale,
  ArrowRight,
  Search,
  ShoppingCart,
  Warehouse,
  MapPinned,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  CreditCard,
} from "lucide-react";

import DashboardNewBox from "@/components/DashboardNewBox";
import ClientProfileForm from "@/components/ClientProfileForm";
import PendingDropoffHelp from "@/components/PendingDropoffHelp";
import MobileClientNav from "@/components/MobileClientNav";
import ClientSignOutButton from "@/components/ClientSignOutButton";
import DashboardShippingCalcTrigger from "@/components/DashboardShippingCalcTrigger";
import { getClientSessionUser } from "@/lib/serverSession";
import ClientDashboardTracking from "@/components/ClientDashboardTracking";
import ClientExternalTrackingPanel from "@/components/ClientExternalTrackingPanel";
import PortalNotificationBell from "@/components/PortalNotificationBell";
import LanguageSelector from "@/components/LanguageSelector";
import { CguLegalSections, CguPageHeader } from "@/components/CguDocument";
import MarketingBrandGallery from "@/components/MarketingBrandGallery";
import { packageStatusShortLabel } from "@/lib/packageStatusDisplay";
import { shipmentRouteLabel } from "@/lib/shipmentRouteLabel";
import { LOGISTICS_SERVICES, type LogisticsServiceId } from "@/lib/logistics-services";
import { getTranslations } from "next-intl/server";
import DashboardPricingVisualStrip from "@/components/dashboard/DashboardPricingVisualStrip";
import DashboardReferralShareCard from "@/components/dashboard/DashboardReferralShareCard";
import ClientPickupRequestPanel from "@/components/dashboard/ClientPickupRequestPanel";

export const metadata: Metadata = {
  title: "Client dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function PricingServiceIcon({ id }: { id: LogisticsServiceId }) {
  const box = "h-8 w-8 sm:h-9 sm:w-9 text-mex-blue";
  switch (id) {
    case "us-ht":
      return <Plane className={box} />;
    case "dr-ht":
      return <Ship className={box} />;
    case "shopping":
      return <ShoppingCart className={box} />;
    case "local":
      return <MapPinned className={box} />;
    case "warehouse":
      return <Warehouse className={box} />;
    default:
      return null;
  }
}

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; filter?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "tracking";
  const listFilter = resolvedParams.filter?.trim().toLowerCase() ?? "";

  const sessionUser = await getClientSessionUser();
  if (!sessionUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      requests: {
        include: { invoice: true, package: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) redirect("/login");

  const tSidebar = await getTranslations("Dashboard.sidebar");

  const unpaidInvoices = user.requests.filter((req: any) => req.invoice?.status === "UNPAID");

  const requests = user.requests as Array<
    Record<string, unknown> & {
      id: string;
      createdAt: Date;
      departure: string;
      destinationCountry?: string | null;
      category: string;
      status: string;
      invoice?: { id: string; status: string; totalAmount: number } | null;
      package?: { trackingId: string; status: string } | null;
    }
  >;

  const overviewStats = {
    totalRequests: requests.length,
    pendingDropoff: requests.filter((r) => r.status === "PENDING_DROPOFF").length,
    awaitingPayment: requests.filter((r) => r.invoice?.status === "UNPAID").length,
    activeInNetwork: requests.filter((r) => r.package && r.package.status !== "DELIVERED").length,
    delivered: requests.filter((r) => r.package?.status === "DELIVERED").length,
    unpaidTotal: unpaidInvoices.reduce((s, r: any) => s + Number(r.invoice?.totalAmount ?? 0), 0),
    paidLifetime: requests
      .filter((r) => r.invoice?.status === "PAID")
      .reduce((s, r) => s + Number(r.invoice!.totalAmount), 0),
  };

  function filterShipmentRequests(rows: typeof requests, f: string) {
    if (!f) return rows;
    if (f === "pending_dropoff") return rows.filter((r) => r.status === "PENDING_DROPOFF");
    if (f === "active") return rows.filter((r) => r.package && r.package.status !== "DELIVERED");
    if (f === "delivered") return rows.filter((r) => r.package?.status === "DELIVERED");
    return rows;
  }

  function filterInvoiceRequests(rows: typeof requests, f: string) {
    const inv = rows.filter((r) => r.invoice);
    if (!f) return inv;
    if (f === "paid") return inv.filter((r) => r.invoice!.status === "PAID");
    if (f === "unpaid") return inv.filter((r) => r.invoice!.status === "UNPAID");
    return inv;
  }

  const shipmentFilter =
    ["pending_dropoff", "active", "delivered"].includes(listFilter) ? listFilter : "";
  const invoiceFilter = ["paid", "unpaid"].includes(listFilter) ? listFilter : "";

  const shipmentsToShow =
    currentTab === "shipments" ? filterShipmentRequests(requests, shipmentFilter) : [];
  const invoicesToShow =
    currentTab === "invoices" ? filterInvoiceRequests(requests, invoiceFilter) : [];

  const shipmentsFilterBannerLabel =
    shipmentFilter === "pending_dropoff"
      ? "Awaiting warehouse drop-off"
      : shipmentFilter === "active"
        ? "Packages in transit (not delivered yet)"
        : shipmentFilter === "delivered"
          ? "Delivered packages"
          : null;

  const invoicesFilterBannerLabel =
    invoiceFilter === "paid"
      ? "Paid invoices"
      : invoiceFilter === "unpaid"
        ? "Unpaid invoices"
        : null;

  function requestStatusBadge(status: string) {
    const label = status.split("_").join(" ");
    const tone =
      status === "PENDING_DROPOFF"
        ? "bg-amber-50 text-amber-900 border-amber-100"
        : status === "PAID"
          ? "bg-green-50 text-green-800 border-green-100"
          : "bg-gray-100 text-gray-700 border-gray-100";
    return (
      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${tone}`}>
        {label}
      </span>
    );
  }

  return (
    <div className="min-h-dvh z-[100] flex w-full max-w-[100vw] overflow-x-hidden bg-gray-50 font-sans">
      
      {/* ============================== */}
      {/* CLIENT SIDEBAR */}
      {/* ============================== */}
      <aside className="hidden md:flex fixed left-0 top-0 z-30 h-dvh w-64 flex-col bg-mex-dark text-white shadow-xl overflow-hidden">
        <div className="flex h-20 shrink-0 items-center border-b border-gray-800 bg-white px-6">
          <BrandLogo href="/" width={200} height={64} alt="MEX509" className="h-8 w-auto object-left" prefetch={false} />
        </div>
        
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-800 p-5">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">{tSidebar("clientPortal")}</p>
            <h3 className="truncate font-black text-lg">
              {user.firstName || "Valued"} {user.lastName || "Customer"}
            </h3>
            <p className="truncate text-sm text-gray-400">{user.email}</p>
          </div>
          <div className="shrink-0 pt-1">
            <PortalNotificationBell variant="client" />
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-1.5">
          <Link href="/dashboard?tab=tracking" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'tracking' ? 'bg-mex-orange text-white font-bold shadow-lg shadow-orange-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Search size={20} /> {tSidebar("tracking")}
          </Link>
          <Link href="/dashboard?tab=overview" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'overview' ? 'bg-mex-blue text-white font-bold shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20} /> {tSidebar("overview")}
          </Link>
          <Link href="/dashboard?tab=new-box" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'new-box' ? 'bg-mex-orange text-white font-bold shadow-lg shadow-orange-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Plus size={20} /> {tSidebar("newBox")}
          </Link>
          <Link href="/dashboard?tab=shipments" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'shipments' ? 'bg-mex-blue text-white font-bold shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Package size={20} /> {tSidebar("shipments")}
          </Link>
          <Link href="/dashboard?tab=invoices" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'invoices' ? 'bg-mex-blue text-white font-bold shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Receipt size={20} /> {tSidebar("invoices")}
            {unpaidInvoices.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unpaidInvoices.length}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard?tab=external"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
              currentTab === "external"
                ? "bg-mex-orange font-bold text-white shadow-lg shadow-orange-900/50"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ShoppingBag size={20} /> {tSidebar("external")}
          </Link>
          <Link
            href="/dashboard?tab=pickup"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
              currentTab === "pickup"
                ? "bg-mex-orange font-bold text-white shadow-lg shadow-orange-900/50"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Package size={20} /> Pickup request
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tSidebar("info")}</p>
            <Link href="/dashboard?tab=pricing" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'pricing' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <DollarSign size={20} /> {tSidebar("pricing")}
            </Link>
            <Link href="/dashboard?tab=profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'profile' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Settings size={20} /> {tSidebar("profile")}
            </Link>
            <Link href="/dashboard?tab=terms" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'terms' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Scale size={20} /> {tSidebar("terms")}
            </Link>
          </div>
        </nav>

        <div className="shrink-0 space-y-2 border-t border-gray-800 bg-mex-dark p-4">
          <DashboardShippingCalcTrigger variant="sidebar" />
          <ClientSignOutButton className="flex justify-center items-center gap-2 w-full bg-white/10 text-white hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors">
            <LogOut size={18} /> Sign Out
          </ClientSignOutButton>
        </div>
      </aside>

      {/* Reserves horizontal space for fixed sidebar (desktop) */}
      <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />

      {/* ============================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================== */}
      <main className="relative flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-2 border-b border-gray-100 bg-white/95 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md supports-[backdrop-filter]:bg-white/90 md:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <BrandLogo
              href="/"
              width={200}
              height={64}
              alt="MEX509"
              className="h-7 min-w-0 shrink object-left"
              prefetch={false}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSelector compact />
            <PortalNotificationBell variant="client" />
            <MobileClientNav
              user={{ firstName: user.firstName, lastName: user.lastName, email: user.email }}
              currentTab={currentTab}
              unpaidCount={unpaidInvoices.length}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 pb-8 pt-[calc(3.75rem+env(safe-area-inset-top))] md:px-6 md:pb-10 md:pt-6 lg:px-10 lg:pt-10">

          {currentTab === "tracking" && (
            <Suspense
              fallback={
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm font-medium text-gray-500">
                  Loading tracking…
                </div>
              }
            >
              <ClientDashboardTracking />
            </Suspense>
          )}

          {currentTab === "external" && <ClientExternalTrackingPanel />}
          {currentTab === "pickup" && <ClientPickupRequestPanel />}

          {/* TAB: OVERVIEW */}
          {currentTab === "overview" && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-mex-orange">Overview</p>
                  <h1 className="mt-1 text-3xl font-black text-mex-dark">
                    Welcome back{user.firstName ? `, ${user.firstName}` : ""}
                  </h1>
                  <p className="mt-2 font-medium text-gray-500">
                    Snapshot of every registration, invoice, and package tied to your account.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:shrink-0">
                  <Link
                    href="/dashboard?tab=new-box"
                    className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-mex-orange px-6 py-4 font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-700"
                  >
                    <Plus size={20} /> Pre-register a box
                  </Link>
                  <Link
                    href="/dashboard?tab=tracking"
                    className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 font-bold text-mex-dark hover:bg-gray-100"
                  >
                    <Search size={18} /> Live tracking
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <Link
                  href="/dashboard?tab=shipments"
                  prefetch={false}
                  aria-label="View all registrations in shipment history"
                  className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-mex-blue/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Registrations</p>
                  <p className="mt-2 text-2xl font-black text-mex-dark group-hover:text-mex-blue">
                    {overviewStats.totalRequests}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-500">All-time requests</p>
                  <p className="mt-2 text-[10px] font-bold text-mex-blue opacity-0 transition group-hover:opacity-100">
                    Open history →
                  </p>
                </Link>
                <Link
                  href="/dashboard?tab=shipments&filter=pending_dropoff"
                  prefetch={false}
                  aria-label="View shipments awaiting warehouse drop-off"
                  className="group rounded-2xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-800/80">Awaiting drop-off</p>
                  <p className="mt-2 text-2xl font-black text-amber-950">{overviewStats.pendingDropoff}</p>
                  <p className="mt-1 text-xs font-medium text-amber-900/70">Bring cargo to warehouse</p>
                  <p className="mt-2 text-[10px] font-bold text-amber-900 opacity-0 transition group-hover:opacity-100">
                    Filter list →
                  </p>
                </Link>
                <Link
                  href="/dashboard?tab=invoices&filter=unpaid"
                  prefetch={false}
                  aria-label="View unpaid invoices"
                  className="group rounded-2xl border border-orange-100 bg-orange-50/50 p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-orange-900/70">Unpaid invoices</p>
                  <p className="mt-2 text-2xl font-black text-mex-dark">{overviewStats.awaitingPayment}</p>
                  <p className="mt-1 text-xs font-medium text-gray-600">
                    {overviewStats.unpaidTotal > 0 ? (
                      <span className="font-bold text-red-600">${overviewStats.unpaidTotal.toFixed(2)} due</span>
                    ) : (
                      "All clear"
                    )}
                  </p>
                  <p className="mt-2 text-[10px] font-bold text-mex-orange opacity-0 transition group-hover:opacity-100">
                    Billing →
                  </p>
                </Link>
                <Link
                  href="/dashboard?tab=shipments&filter=active"
                  prefetch={false}
                  aria-label="View packages still moving through the network"
                  className="group rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm transition hover:border-mex-blue/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-mex-blue">In our network</p>
                  <p className="mt-2 text-2xl font-black text-mex-dark">{overviewStats.activeInNetwork}</p>
                  <p className="mt-1 text-xs font-medium text-gray-600">Packages not delivered yet</p>
                  <p className="mt-2 text-[10px] font-bold text-mex-blue opacity-0 transition group-hover:opacity-100">
                    Filter list →
                  </p>
                </Link>
                <Link
                  href="/dashboard?tab=shipments&filter=delivered"
                  prefetch={false}
                  aria-label="View delivered shipments"
                  className="group rounded-2xl border border-green-100 bg-green-50/50 p-4 shadow-sm transition hover:border-green-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-green-800/80">Delivered</p>
                  <p className="mt-2 text-2xl font-black text-green-900">{overviewStats.delivered}</p>
                  <p className="mt-1 text-xs font-medium text-green-800/80">Completed journeys</p>
                  <p className="mt-2 text-[10px] font-bold text-green-800 opacity-0 transition group-hover:opacity-100">
                    Filter list →
                  </p>
                </Link>
                <Link
                  href="/dashboard?tab=invoices&filter=paid"
                  prefetch={false}
                  aria-label="View paid invoices and payment history"
                  className="group col-span-2 flex flex-col rounded-2xl border border-gray-700 bg-gradient-to-br from-mex-dark to-gray-900 p-4 text-white shadow-sm transition hover:ring-2 hover:ring-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2 lg:col-span-1 xl:col-span-1"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60">Paid via MEX509</p>
                  <p className="mt-2 text-2xl font-black">${overviewStats.paidLifetime.toFixed(2)}</p>
                  <p className="mt-1 text-xs font-medium text-white/70">Lifetime invoice total (paid)</p>
                  <p className="mt-auto pt-2 text-[10px] font-bold text-white/90 opacity-0 transition group-hover:opacity-100">
                    Paid invoices →
                  </p>
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Quick links</h2>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/dashboard?tab=tracking"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-bold text-mex-dark ring-1 ring-gray-100 hover:bg-gray-100"
                    >
                      <Search size={16} className="text-mex-orange" />
                      Tracking
                      <ArrowRight size={14} className="text-gray-400" />
                    </Link>
                    <Link
                      href="/dashboard?tab=shipments"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-bold text-mex-dark ring-1 ring-gray-100 hover:bg-gray-100"
                    >
                      <Package size={16} className="text-mex-blue" />
                      Full shipment history
                      <ArrowRight size={14} className="text-gray-400" />
                    </Link>
                    <Link
                      href="/dashboard?tab=invoices"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-bold text-mex-dark ring-1 ring-gray-100 hover:bg-gray-100"
                    >
                      <Receipt size={16} className="text-mex-orange" />
                      Billing & invoices
                      <ArrowRight size={14} className="text-gray-400" />
                    </Link>
                    <Link
                      href="/dashboard?tab=profile"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-bold text-mex-dark ring-1 ring-gray-100 hover:bg-gray-100"
                    >
                      <Settings size={16} className="text-gray-500" />
                      Profile & address
                      <ArrowRight size={14} className="text-gray-400" />
                    </Link>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-400">Account</h2>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <Mail size={18} className="mt-0.5 shrink-0 text-gray-400" />
                      <span className="min-w-0 break-all font-medium text-gray-700">{user.email}</span>
                    </li>
                    {user.phone && (
                      <li className="flex items-start gap-3">
                        <Phone size={18} className="mt-0.5 shrink-0 text-mex-orange" />
                        <span className="font-medium text-gray-700">{user.phone}</span>
                      </li>
                    )}
                    {(user.city || user.state) && (
                      <li className="flex items-start gap-3">
                        <MapPin size={18} className="mt-0.5 shrink-0 text-mex-blue" />
                        <span className="font-medium text-gray-700">
                          {[user.city, user.state].filter(Boolean).join(", ")}
                          {user.zipCode ? ` ${user.zipCode}` : ""}
                        </span>
                      </li>
                    )}
                  </ul>
                  <Link
                    href="/dashboard?tab=profile"
                    className="mt-4 inline-flex text-sm font-bold text-mex-blue hover:underline"
                  >
                    Edit profile
                  </Link>
                </div>
              </div>

              {user.referralCode ? <DashboardReferralShareCard referralCode={user.referralCode} /> : null}

              {unpaidInvoices.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-black text-mex-dark mb-4 flex items-center gap-2"><AlertCircle className="text-red-500" /> Action Required: Unpaid Invoices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unpaidInvoices.map((req: any) => (
                      <div key={req.id} className="bg-white border-l-4 border-l-red-500 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
                        <div>
                          <h3 className="font-bold text-mex-dark">{shipmentRouteLabel(req.departure, req.destinationCountry)}</h3>
                          {req.package?.trackingId && (
                            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                              Tracking{" "}
                              <ClientTrackingIdLink trackingId={req.package.trackingId} className="text-xs font-black" />
                            </p>
                          )}
                          <div className="text-2xl font-black text-red-600 mt-1">${req.invoice?.totalAmount.toFixed(2)}</div>
                        </div>
                        <Link href={`/pay/${req.invoice?.id}`} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-md text-center">
                          Pay Invoice
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-mex-dark flex items-center gap-2">
                    <Package className="text-mex-blue" /> All registrations & shipments
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Full list — same data as Shipment History, including dates, categories, invoices, and live package
                    status.
                  </p>
                </div>
                <Link
                  href="/dashboard?tab=shipments"
                  className="shrink-0 text-sm font-bold text-mex-blue hover:underline"
                >
                  Open dedicated history view →
                </Link>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[980px] text-left">
                    <thead className="border-b border-gray-100 bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="whitespace-nowrap p-4 pl-5">Registered</th>
                        <th className="min-w-[140px] p-4">Route</th>
                        <th className="min-w-[120px] p-4">Contents</th>
                        <th className="min-w-[130px] p-4">Office status</th>
                        <th className="min-w-[160px] p-4">Package / tracking</th>
                        <th className="min-w-[120px] p-4">Invoice</th>
                        <th className="min-w-[160px] p-4">Drop-off</th>
                        <th className="whitespace-nowrap p-4 pr-5 text-right">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-10 text-center font-medium text-gray-500">
                            No shipments yet. Pre-register a box to get started.
                          </td>
                        </tr>
                      ) : (
                        requests.map((req: any) => (
                          <tr key={req.id} className="align-top transition-colors hover:bg-gray-50/80">
                            <td className="whitespace-nowrap p-4 pl-5 text-gray-600">
                              <span className="flex items-center gap-1.5 font-semibold">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(req.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-mex-dark">
                              {shipmentRouteLabel(req.departure, req.destinationCountry)}
                              <span className="mt-1 block text-xs font-semibold text-gray-400">{req.shippingMethod}</span>
                            </td>
                            <td className="p-4 text-gray-700">
                              <span className="font-semibold">{req.category}</span>
                              {req.description ? (
                                <span className="mt-1 line-clamp-2 block text-xs text-gray-500">{req.description}</span>
                              ) : null}
                            </td>
                            <td className="p-4">{requestStatusBadge(req.status)}</td>
                            <td className="p-4">
                              {req.package ? (
                                <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold leading-snug text-mex-blue">
                                  {packageStatusShortLabel(req.package.status)}
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-gray-400">Awaiting warehouse intake</span>
                              )}
                            </td>
                            <td className="p-4">
                              {!req.invoice ? (
                                <span className="text-xs font-medium text-gray-400">Not invoiced yet</span>
                              ) : req.invoice.status === "UNPAID" ? (
                                <div className="flex flex-col gap-1">
                                  <span className="font-black text-red-600">${Number(req.invoice.totalAmount).toFixed(2)}</span>
                                  <Link
                                    href={`/pay/${req.invoice.id}`}
                                    className="inline-flex w-fit items-center gap-1 text-xs font-bold text-mex-orange hover:underline"
                                  >
                                    <CreditCard size={12} /> Pay now
                                  </Link>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-green-600">
                                  <CheckCircle size={14} /> ${Number(req.invoice.totalAmount).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {req.status === "PENDING_DROPOFF" ? (
                                <PendingDropoffHelp variant="compact" />
                              ) : (
                                <span className="text-sm font-medium text-gray-300">—</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap p-4 pr-5 text-right">
                              <ClientTrackingIdLink trackingId={req.package?.trackingId} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 p-4 md:hidden">
                  {requests.length === 0 ? (
                    <p className="py-8 text-center font-medium text-gray-500">No shipments yet.</p>
                  ) : (
                    requests.map((req: any) => (
                      <div
                        key={req.id}
                        className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 shadow-sm"
                      >
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-black text-mex-dark">{shipmentRouteLabel(req.departure, req.destinationCountry)}</p>
                            <p className="mt-1 text-xs font-semibold text-gray-500">{req.category}</p>
                          </div>
                          {requestStatusBadge(req.status)}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                          <span>{req.shippingMethod}</span>
                        </div>
                        {req.description ? (
                          <p className="text-xs leading-relaxed text-gray-600 line-clamp-3">{req.description}</p>
                        ) : null}
                        <div className="grid gap-2 border-t border-gray-100 pt-3 text-sm">
                          <div className="flex justify-between gap-2">
                            <span className="font-bold text-gray-400">Invoice</span>
                            {!req.invoice ? (
                              <span className="text-gray-400">Not invoiced</span>
                            ) : req.invoice.status === "UNPAID" ? (
                              <span className="font-black text-red-600">${Number(req.invoice.totalAmount).toFixed(2)}</span>
                            ) : (
                              <span className="font-bold text-green-600">Paid ${Number(req.invoice.totalAmount).toFixed(2)}</span>
                            )}
                          </div>
                          {req.invoice?.status === "UNPAID" && (
                            <Link
                              href={`/pay/${req.invoice.id}`}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mex-orange py-2.5 text-xs font-black text-white"
                            >
                              Pay invoice
                            </Link>
                          )}
                          <div className="flex justify-between gap-2">
                            <span className="font-bold text-gray-400">Package</span>
                            <span className="max-w-[55%] text-right font-semibold text-mex-dark">
                              {req.package ? packageStatusShortLabel(req.package.status) : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="font-bold text-gray-400">Tracking</span>
                            <ClientTrackingIdLink trackingId={req.package?.trackingId} className="text-sm" />
                          </div>
                        </div>
                        {req.status === "PENDING_DROPOFF" && <PendingDropoffHelp />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRE-REGISTER BOX */}
          {currentTab === "new-box" && <DashboardNewBox user={user} />}

          {/* TAB: SHIPMENTS */}
          {currentTab === "shipments" && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-mex-dark mb-2">Shipment History</h1>
                <p className="text-gray-500 font-medium">Every package you have ever shipped with MEX509.</p>
              </div>
              {currentTab === "shipments" && shipmentsFilterBannerLabel && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mex-blue/20 bg-blue-50/80 px-4 py-3 text-sm">
                  <p className="font-bold text-mex-dark">
                    Showing: <span className="text-mex-blue">{shipmentsFilterBannerLabel}</span>
                  </p>
                  <Link
                    href="/dashboard?tab=shipments"
                    className="font-bold text-mex-blue hover:underline"
                    prefetch={false}
                  >
                    Clear filter — show all
                  </Link>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-5 font-bold">Date & Route</th>
                      <th className="p-5 font-bold hidden md:table-cell">Items</th>
                      <th className="p-5 font-bold">Status</th>
                      <th className="p-5 font-bold min-w-[200px] hidden lg:table-cell">Drop-off</th>
                      <th className="p-5 font-bold text-right">Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No shipments found.
                        </td>
                      </tr>
                    ) : shipmentsToShow.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No shipments match this filter.{" "}
                          <Link href="/dashboard?tab=shipments" className="font-bold text-mex-blue hover:underline" prefetch={false}>
                            Show all shipments
                          </Link>
                          .
                        </td>
                      </tr>
                    ) : (
                      shipmentsToShow.map((req: any) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors align-top">
                          <td className="p-5">
                            <div className="font-bold text-mex-dark">{shipmentRouteLabel(req.departure, req.destinationCountry)}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</div>
                            {req.status === "PENDING_DROPOFF" && (
                              <div className="mt-3 lg:hidden">
                                <PendingDropoffHelp variant="compact" />
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-gray-600 font-medium hidden md:table-cell">{req.category}</td>
                          <td className="p-5">
                            <span className="inline-flex bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                              {String(req.status).split("_").join(" ")}
                            </span>
                          </td>
                          <td className="p-5 hidden lg:table-cell">
                            {req.status === "PENDING_DROPOFF" ? (
                              <PendingDropoffHelp variant="compact" />
                            ) : (
                              <span className="text-gray-300 text-sm font-medium">—</span>
                            )}
                          </td>
                          <td className="p-5 text-right whitespace-nowrap">
                            <ClientTrackingIdLink trackingId={req.package?.trackingId} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INVOICES */}
          {currentTab === "invoices" && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-mex-dark mb-2">Billing & Invoices</h1>
                <p className="text-gray-500 font-medium">Review your payment history and outstanding balances.</p>
              </div>
              {currentTab === "invoices" && invoicesFilterBannerLabel && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mex-orange/25 bg-orange-50/80 px-4 py-3 text-sm">
                  <p className="font-bold text-mex-dark">
                    Showing: <span className="text-mex-orange">{invoicesFilterBannerLabel}</span>
                  </p>
                  <Link
                    href="/dashboard?tab=invoices"
                    className="font-bold text-mex-blue hover:underline"
                    prefetch={false}
                  >
                    Clear filter — show all
                  </Link>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-5 font-bold">Invoice Date</th>
                      <th className="p-5 font-bold hidden sm:table-cell">Tracking</th>
                      <th className="p-5 font-bold">Amount</th>
                      <th className="p-5 font-bold text-right">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {requests.filter((req: any) => req.invoice).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No invoices generated yet.
                        </td>
                      </tr>
                    ) : invoicesToShow.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No invoices match this filter.{" "}
                          <Link href="/dashboard?tab=invoices" className="font-bold text-mex-blue hover:underline" prefetch={false}>
                            Show all invoices
                          </Link>
                          .
                        </td>
                      </tr>
                    ) : (
                      invoicesToShow.map((req: any) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 font-medium text-gray-600">
                          <span className="block">{new Date(req.invoice!.createdAt).toLocaleDateString()}</span>
                          <span className="mt-2 block sm:hidden">
                            <ClientTrackingIdLink trackingId={req.package?.trackingId} className="text-xs font-black" />
                          </span>
                        </td>
                        <td className="p-5 hidden sm:table-cell">
                          <ClientTrackingIdLink trackingId={req.package?.trackingId} className="text-sm font-black" />
                        </td>
                        <td className="p-5 font-black text-mex-dark text-lg">${req.invoice!.totalAmount.toFixed(2)}</td>
                        <td className="p-5 text-right">
                          {req.invoice!.status === 'PAID' ? (
                            <span className="text-green-600 font-bold flex items-center justify-end gap-1"><CheckCircle size={16}/> Paid</span>
                          ) : (
                            <Link href={`/pay/${req.invoice!.id}`} className="bg-mex-orange text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-orange-700 transition-colors shadow-sm">Pay Now</Link>
                          )}
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================== */}
          {/* TAB: PRICING & SERVICES (PRO) */}
          {/* ============================== */}
          {currentTab === "pricing" && (
            <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-10 px-1 sm:px-0">
              <DashboardPricingVisualStrip />

              <section className="mb-14 sm:mb-16">
                <div className="mx-auto mb-8 max-w-3xl px-2 text-center sm:mb-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight text-mex-blue sm:text-4xl">
                    Our services
                  </h2>
                  <p className="mt-3 text-base font-medium leading-relaxed text-gray-600 sm:text-lg">
                    Comprehensive logistics solutions tailored for speed, security, and peace of mind. More detail on{" "}
                    <Link
                      href="/services"
                      className="font-black text-mex-blue underline decoration-mex-orange/40 underline-offset-4 hover:text-mex-orange"
                    >
                      mex509.com/services
                    </Link>
                    .
                  </p>
                </div>

                <MarketingBrandGallery compact className="mb-10 sm:mb-12 px-2 sm:px-0" />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 md:gap-6">
                  {LOGISTICS_SERVICES.map((service) => (
                    <div
                      key={service.id}
                      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-mex-blue/25 hover:shadow-lg"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-mex-blue/10 transition-transform group-hover:scale-105">
                        <PricingServiceIcon id={service.id} />
                      </div>
                      <h3 className="text-lg font-black leading-snug text-mex-dark">{service.title}</h3>
                      <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-gray-600">{service.description}</p>
                      <div className="mt-5 border-t border-gray-50 pt-4">
                        {service.external ? (
                          <a
                            href={service.actionHref}
                            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-mex-orange transition-all hover:gap-3"
                          >
                            Start Now <ArrowRight size={18} strokeWidth={2.5} />
                          </a>
                        ) : (
                          <Link
                            href={service.actionHref}
                            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-mex-orange transition-all hover:gap-3"
                          >
                            Start Now <ArrowRight size={18} strokeWidth={2.5} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mx-auto mb-10 max-w-2xl px-2 text-center sm:mb-12">
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-mex-blue sm:text-4xl">
                  Rates &amp; pricing
                </h2>
                <p className="mt-3 text-base font-medium leading-relaxed text-gray-600 sm:text-lg">
                  Lane pricing for shipments you pre-register in the portal.
                </p>
              </div>

              {/* SAAS TIER CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 px-2 sm:px-4 md:px-10">
                {/* AIR FREIGHT (MOST POPULAR) */}
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border-2 border-mex-blue relative overflow-hidden transform transition duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 inset-x-0 bg-mex-blue text-white text-center py-1.5 text-xs font-black uppercase tracking-widest">Pi Popilè (Vit)</div>
                  <div className="p-8 pt-10">
                    <Plane className="h-10 w-10 text-mex-blue mb-4" />
                    <h3 className="text-2xl font-black text-mex-dark mb-2">Avyon</h3>
                    <p className="text-gray-500 font-medium text-sm mb-6 h-10">Livrezon eksprès pou dokiman, rad, ak machandiz lejè.</p>
                    <div className="flex items-baseline gap-2 mb-6 border-b border-gray-100 pb-6">
                      <span className="text-5xl font-black text-mex-dark">$4.90</span>
                      <span className="text-gray-400 font-bold uppercase tracking-wider">/ liv</span>
                    </div>
                    <ul className="space-y-4 font-bold text-gray-600 mb-8">
                      <li className="flex items-center gap-3"><CheckCircle size={20} className="text-mex-blue" /> Delè: 5 - 7 jou ouvrab</li>
                      <li className="flex items-center gap-3"><CheckCircle size={20} className="text-mex-blue" /> Frè Sèvis (Fix): $10</li>
                      <li className="flex items-center gap-3"><CheckCircle size={20} className="text-mex-blue" /> Tracking an tan reyèl</li>
                    </ul>
                    <Link href="/dashboard?tab=new-box" className="block w-full text-center bg-mex-blue text-white font-black py-4 rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-500/30">Anrejistre Yon Bwat Avyon</Link>
                  </div>
                </div>

                {/* SEA FREIGHT */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden transform transition duration-300 hover:scale-[1.02]">
                  <div className="p-8">
                    <Ship className="h-10 w-10 text-gray-400 mb-4" />
                    <h3 className="text-2xl font-black text-mex-dark mb-2">Bato</h3>
                    <p className="text-gray-500 font-medium text-sm mb-6 h-10">Opsyon ekonomik pou gwo bwat, palèt, ak machandiz lou.</p>
                    <div className="flex items-baseline gap-2 mb-6 border-b border-gray-100 pb-6">
                      <span className="text-5xl font-black text-mex-dark">$2.90</span>
                      <span className="text-gray-400 font-bold uppercase tracking-wider">/ liv</span>
                    </div>
                    <ul className="space-y-4 font-bold text-gray-600 mb-8">
                      <li className="flex items-center gap-3"><CheckCircle size={20} className="text-gray-400" /> Delè: 15 - 22 jou ouvrab</li>
                      <li className="flex items-center gap-3"><CheckCircle size={20} className="text-gray-400" /> Frè Sèvis (Fix): $5</li>
                      <li className="flex items-center gap-3"><CheckCircle size={20} className="text-gray-400" /> Ideyal pou komèsan</li>
                    </ul>
                    <Link href="/dashboard?tab=new-box" className="block w-full text-center bg-gray-50 text-gray-700 border border-gray-200 font-black py-4 rounded-xl hover:bg-gray-100 transition-colors">Anrejistre Yon Bwat Bato</Link>
                  </div>
                </div>
              </div>

              {/* ELECTRONICS GRID */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-mex-dark mb-2 flex items-center gap-3"><Laptop className="text-mex-orange"/> Elektronik & Atik Espesyal</h2>
                  <p className="text-gray-500 font-medium">Pri fiks (Flat Rate) pou aparèy elektwonik (Pa peye pa liv pou sa yo).</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:border-mex-orange transition-colors"><Smartphone className="mx-auto text-mex-orange mb-3 h-8 w-8" /><div className="text-sm font-bold text-gray-500 mb-1">Telefòn</div><div className="text-2xl font-black text-mex-dark">$35</div></div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:border-red-400 transition-colors"><TriangleAlert className="mx-auto text-red-400 mb-3 h-8 w-8" /><div className="text-sm font-bold text-gray-500 mb-1">Telefòn Brize</div><div className="text-2xl font-black text-mex-dark">$15</div></div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:border-mex-orange transition-colors"><Tablet className="mx-auto text-mex-orange mb-3 h-8 w-8" /><div className="text-sm font-bold text-gray-500 mb-1">Tablèt</div><div className="text-2xl font-black text-mex-dark">$45</div></div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:border-mex-orange transition-colors"><Laptop className="mx-auto text-mex-orange mb-3 h-8 w-8" /><div className="text-sm font-bold text-gray-500 mb-1">Laptop</div><div className="text-2xl font-black text-mex-dark">$60</div></div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:border-mex-orange transition-colors"><Router className="mx-auto text-mex-orange mb-3 h-8 w-8" /><div className="text-sm font-bold text-gray-500 mb-1">Backup/Routeur</div><div className="text-2xl font-black text-mex-dark">$5</div></div>
                </div>
              </div>

            </div>
          )}

          {/* ============================== */}
          {/* TAB: PROFILE SETTINGS (PRO) */}
          {/* ============================== */}
          {currentTab === "profile" && (
            <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-mex-dark mb-2">Profile & Settings</h1>
                <p className="text-gray-500 font-medium">Update your personal information and delivery address.</p>
              </div>
              <ClientProfileForm user={user} />
            </div>
          )}

          {/* ============================== */}
          {/* TAB: TERMS & CONDITIONS (OFFICIAL CGU) */}
          {/* ============================== */}
          {currentTab === "terms" && (
            <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
              <CguPageHeader />
              <CguLegalSections />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}