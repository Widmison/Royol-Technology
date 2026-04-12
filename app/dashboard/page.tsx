import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { 
  Package, Receipt, MapPin, LogOut, LayoutDashboard, Plus, Settings, 
  CheckCircle, AlertCircle, DollarSign, Plane, Ship, 
  Smartphone, Laptop, Tablet, Router, TriangleAlert, Scale,
  ArrowRight, ShoppingCart, Warehouse, MapPinned
} from "lucide-react";

import DashboardNewBox from "@/components/DashboardNewBox";
import ClientProfileForm from "@/components/ClientProfileForm";
import PendingDropoffHelp from "@/components/PendingDropoffHelp";
import MobileClientNav from "@/components/MobileClientNav";
import { CguLegalSections, CguPageHeader } from "@/components/CguDocument";
import { LOGISTICS_SERVICES, type LogisticsServiceId } from "@/lib/logistics-services";

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

export default async function ClientDashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "overview";

  const cookieStore = await cookies();
  const clientId = cookieStore.get("clientId")?.value;

  if (!clientId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      requests: {
        include: { invoice: true, package: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) redirect("/login");

  const unpaidInvoices = user.requests.filter((req: any) => req.invoice?.status === 'UNPAID');

  return (
    <div className="min-h-dvh z-[100] flex w-full max-w-[100vw] overflow-x-hidden bg-gray-50 font-sans">
      
      {/* ============================== */}
      {/* CLIENT SIDEBAR */}
      {/* ============================== */}
      <aside className="hidden md:flex fixed left-0 top-0 z-30 h-dvh w-64 flex-col bg-mex-dark text-white shadow-xl overflow-hidden">
        <div className="h-20 shrink-0 flex items-center px-6 border-b border-gray-800 bg-white">
          <BrandLogo href="/" width={200} height={64} alt="MEX509" className="h-8 w-auto object-left" prefetch={false} />
        </div>
        
        <div className="p-5 border-b border-gray-800 shrink-0">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Client Portal</p>
          <h3 className="font-black text-lg truncate">{user.firstName || "Valued"} {user.lastName || "Customer"}</h3>
          <p className="text-sm text-gray-400 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-1.5">
          <Link href="/dashboard?tab=overview" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'overview' ? 'bg-mex-blue text-white font-bold shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20} /> My Overview
          </Link>
          <Link href="/dashboard?tab=new-box" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'new-box' ? 'bg-mex-orange text-white font-bold shadow-lg shadow-orange-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Plus size={20} /> Pre-Register Box
          </Link>
          <Link href="/dashboard?tab=shipments" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'shipments' ? 'bg-mex-blue text-white font-bold shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Package size={20} /> All Shipments
          </Link>
          <Link href="/dashboard?tab=invoices" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'invoices' ? 'bg-mex-blue text-white font-bold shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Receipt size={20} /> Billing & Invoices
            {unpaidInvoices.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unpaidInvoices.length}
              </span>
            )}
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Information</p>
            <Link href="/dashboard?tab=pricing" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'pricing' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <DollarSign size={20} /> Pricing & Services
            </Link>
            <Link href="/dashboard?tab=profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'profile' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Settings size={20} /> Profile Settings
            </Link>
            <Link href="/dashboard?tab=terms" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentTab === 'terms' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Scale size={20} /> CGU / Legal Terms
            </Link>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-800 shrink-0 bg-mex-dark">
          <Link href="/login" className="flex justify-center items-center gap-2 w-full bg-white/10 text-white hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors">
            <LogOut size={18} /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Reserves horizontal space for fixed sidebar (desktop) */}
      <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />

      {/* ============================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================== */}
      <main className="flex-1 flex flex-col min-w-0 min-h-dvh relative">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between gap-3 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <MobileClientNav
              user={{ firstName: user.firstName, lastName: user.lastName, email: user.email }}
              currentTab={currentTab}
              unpaidCount={unpaidInvoices.length}
            />
            <BrandLogo href="/" width={200} height={64} alt="MEX509" className="h-7 w-auto object-left" prefetch={false} />
          </div>
          <Link href="/login" className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 shrink-0" aria-label="Sign out">
            <LogOut size={22} />
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 bg-gray-50">

          {/* TAB: OVERVIEW */}
          {currentTab === "overview" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                  <h1 className="text-3xl font-black text-mex-dark mb-2">Welcome Back, {user.firstName || "Customer"}!</h1>
                  <p className="text-gray-500 font-medium">Track your packages, pay invoices, and register new drops.</p>
                </div>
                <Link href="/dashboard?tab=new-box" className="bg-mex-orange text-white font-black px-6 py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 w-full md:w-auto whitespace-nowrap">
                  <Plus size={20} /> Pre-Register New Box
                </Link>
              </div>

              {unpaidInvoices.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-black text-mex-dark mb-4 flex items-center gap-2"><AlertCircle className="text-red-500" /> Action Required: Unpaid Invoices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unpaidInvoices.map((req: any) => (
                      <div key={req.id} className="bg-white border-l-4 border-l-red-500 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
                        <div>
                          <h3 className="font-bold text-mex-dark">{req.departure} &rarr; Haiti</h3>
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

              <h2 className="text-lg font-black text-mex-dark mb-4 flex items-center gap-2"><Package className="text-mex-blue" /> Recent Shipments</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left hidden md:table">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-5 font-bold">Route</th>
                      <th className="p-5 font-bold">Status</th>
                      <th className="p-5 font-bold min-w-[200px]">Drop-off</th>
                      <th className="p-5 font-bold text-right">Tracking ID</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {user.requests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                          No shipments yet. Pre-register a box to get started.
                        </td>
                      </tr>
                    ) : (
                      user.requests.slice(0, 5).map((req: any) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors align-top">
                          <td className="p-5 font-bold text-mex-dark">{req.departure} &rarr; Haiti</td>
                          <td className="p-5">
                            <span className="inline-flex bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                              {String(req.status).split("_").join(" ")}
                            </span>
                          </td>
                          <td className="p-5">
                            {req.status === "PENDING_DROPOFF" ? (
                              <PendingDropoffHelp variant="compact" />
                            ) : (
                              <span className="text-gray-300 text-sm font-medium">—</span>
                            )}
                          </td>
                          <td className="p-5 text-right font-black text-mex-blue tracking-wider whitespace-nowrap">
                            {req.package?.trackingId || "Pending"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="md:hidden p-4 space-y-4">
                  {user.requests.length === 0 ? (
                    <p className="text-center text-gray-500 font-medium py-6">No shipments yet.</p>
                  ) : (
                    user.requests.slice(0, 5).map((req: any) => (
                      <div
                        key={req.id}
                        className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-black text-mex-dark">{req.departure} &rarr; Haiti</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="shrink-0 bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                            {String(req.status).split("_").join(" ")}
                          </span>
                        </div>
                        {req.status === "PENDING_DROPOFF" && <PendingDropoffHelp />}
                        <p className="text-sm">
                          <span className="text-gray-500 font-bold">Tracking: </span>
                          <span className="font-black text-mex-blue tracking-wide">
                            {req.package?.trackingId || "Pending"}
                          </span>
                        </p>
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
                    {user.requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No shipments found.
                        </td>
                      </tr>
                    ) : (
                      user.requests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors align-top">
                          <td className="p-5">
                            <div className="font-bold text-mex-dark">{req.departure} &rarr; Haiti</div>
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
                          <td className="p-5 text-right font-black text-mex-blue tracking-wider whitespace-nowrap">
                            {req.package?.trackingId || "Pending"}
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr><th className="p-5 font-bold">Invoice Date</th><th className="p-5 font-bold">Amount</th><th className="p-5 font-bold text-right">Status / Action</th></tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {user.requests.filter((req: any) => req.invoice).length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-gray-500">No invoices generated yet.</td></tr> : user.requests.filter((req: any) => req.invoice).map((req: any) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 font-medium text-gray-600">{new Date(req.invoice!.createdAt).toLocaleDateString()}</td>
                        <td className="p-5 font-black text-mex-dark text-lg">${req.invoice!.totalAmount.toFixed(2)}</td>
                        <td className="p-5 text-right">
                          {req.invoice!.status === 'PAID' ? (
                            <span className="text-green-600 font-bold flex items-center justify-end gap-1"><CheckCircle size={16}/> Paid</span>
                          ) : (
                            <Link href={`/pay/${req.invoice!.id}`} className="bg-mex-orange text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-orange-700 transition-colors shadow-sm">Pay Now</Link>
                          )}
                        </td>
                      </tr>
                    ))}
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

              <section className="mb-12 sm:mb-16">
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 px-2">
                  <h2 className="text-2xl sm:text-4xl font-black italic text-mex-blue uppercase tracking-tight">
                    Our services
                  </h2>
                  <p className="text-gray-600 font-medium mt-3 text-base sm:text-lg leading-relaxed">
                    Comprehensive logistics solutions tailored for speed, security, and peace of mind.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {LOGISTICS_SERVICES.map((service) => (
                    <div
                      key={service.id}
                      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-mex-blue/25 hover:shadow-lg"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-mex-blue/10 transition-transform group-hover:scale-105">
                        <PricingServiceIcon id={service.id} />
                      </div>
                      <h3 className="text-lg font-black text-mex-dark leading-snug">{service.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-gray-600 font-medium leading-relaxed">
                        {service.description}
                      </p>
                      <div className="mt-5 pt-4 border-t border-gray-50">
                        {service.external ? (
                          <a
                            href={service.actionHref}
                            className="inline-flex items-center gap-2 font-black text-mex-orange text-sm uppercase tracking-wide hover:gap-3 transition-all"
                          >
                            Start Now <ArrowRight size={18} strokeWidth={2.5} />
                          </a>
                        ) : (
                          <Link
                            href={service.actionHref}
                            className="inline-flex items-center gap-2 font-black text-mex-orange text-sm uppercase tracking-wide hover:gap-3 transition-all"
                          >
                            Start Now <ArrowRight size={18} strokeWidth={2.5} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

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