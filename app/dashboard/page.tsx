import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, Receipt, MapPin, LogOut, LayoutDashboard, Plus, Settings, 
  CheckCircle, AlertCircle, DollarSign, ShieldCheck, Plane, Ship, 
  Smartphone, Laptop, Tablet, Router, TriangleAlert, Info, Scale, Box, AlertTriangle, Scale3d, Mail, Phone
} from "lucide-react";

import DashboardNewBox from "@/components/DashboardNewBox";
import ClientProfileForm from "@/components/ClientProfileForm";

export const dynamic = "force-dynamic";

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
    <div className="fixed inset-0 z-[100] flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* ============================== */}
      {/* CLIENT SIDEBAR */}
      {/* ============================== */}
      <aside className="w-64 bg-mex-dark text-white hidden md:flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-white">
          <Link href="/">
            <Image src="/logo.jpg" alt="Mex509 Logo" width={120} height={40} className="h-8 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="p-6 border-b border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Client Portal</p>
          <h3 className="font-black text-lg truncate">{user.firstName || "Valued"} {user.lastName || "Customer"}</h3>
          <p className="text-sm text-gray-400 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
        
        <div className="p-4 border-t border-gray-800">
          <Link href="/login" className="flex justify-center items-center gap-2 w-full bg-white/10 text-white hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors">
            <LogOut size={18} /> Sign Out
          </Link>
        </div>
      </aside>

      {/* ============================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================== */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10 md:hidden">
           <Image src="/logo.jpg" alt="Mex509 Logo" width={100} height={30} className="h-6 w-auto object-contain" />
           <Link href="/login" className="text-gray-500"><LogOut size={24} /></Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gray-50">

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
                    <tr><th className="p-5 font-bold">Route</th><th className="p-5 font-bold">Status</th><th className="p-5 font-bold text-right">Tracking ID</th></tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {user.requests.slice(0, 5).map((req: any) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 font-bold text-mex-dark">{req.departure} &rarr; Haiti</td>
                        <td className="p-5"><span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">{String(req.status).replace('_', ' ')}</span></td>
                        <td className="p-5 text-right font-black text-mex-blue tracking-wider">{req.package?.trackingId || "Pending"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <tr><th className="p-5 font-bold">Date & Route</th><th className="p-5 font-bold hidden md:table-cell">Items</th><th className="p-5 font-bold">Status</th><th className="p-5 font-bold text-right">Tracking</th></tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {user.requests.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">No shipments found.</td></tr> : user.requests.map((req: any) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5">
                          <div className="font-bold text-mex-dark">{req.departure} &rarr; Haiti</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-5 text-gray-600 font-medium hidden md:table-cell">{req.category}</td>
                        <td className="p-5"><span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">{String(req.status).replace('_', ' ')}</span></td>
                        <td className="p-5 text-right font-black text-mex-blue tracking-wider">{req.package?.trackingId || "Pending"}</td>
                      </tr>
                    ))}
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
            <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">

              {/* SAAS TIER CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 px-4 md:px-10">
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
              <div className="mb-8 border-b border-gray-200 pb-8 text-center">
                <Scale className="h-16 w-16 text-mex-blue mx-auto mb-4" />
                <h1 className="text-3xl font-black text-mex-dark mb-2">CONDITIONS GÉNÉRALES D'UTILISATION</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">MEX509 SHIPPING SERVICES</p>
                <p className="text-gray-400 font-medium mt-2 text-sm">Dernière mise à jour: 01/04/2026</p>
              </div>
              
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-gray-700 space-y-10 leading-relaxed font-medium">
                
                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><CheckCircle className="text-mex-blue" size={20}/> 1. ACCEPTATION DES CONDITIONS</h3>
                  <p>En s'inscrivant sur le site MEX509.com, en utilisant nos services ou en nous confiant un colis, le client reconnaît avoir lu, compris et accepté sans réserve l'ensemble des présentes Conditions Générales.</p>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><Package className="text-mex-blue" size={20}/> 2. DESCRIPTION DES SERVICES</h3>
                  <p className="mb-3">MEX509 fournit des services de transport et de logistique incluant :</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Réception de colis (USA / République Dominicaine)</li>
                    <li>Transport vers Haïti</li>
                    <li>Suivi des colis (tracking)</li>
                    <li>Notification des clients</li>
                    <li>Assistance logistique</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><Info className="text-mex-orange" size={20}/> 3. OBLIGATION DE DÉCLARATION DU CLIENT</h3>
                  <p className="mb-3 font-bold text-gray-800">Le client est tenu de :</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 mb-4">
                    <li>Déclarer avec exactitude le contenu de chaque colis</li>
                    <li>Fournir la valeur réelle des produits</li>
                    <li>Fournir, si possible, une facture ou un reçu</li>
                    <li>Indiquer correctement ses informations personnelles (nom, téléphone, adresse)</li>
                  </ul>
                  <p className="mb-2 font-bold text-red-600">Toute fausse déclaration peut entraîner :</p>
                  <ul className="list-disc pl-6 space-y-1 text-red-500/90 font-bold">
                    <li>La saisie du colis</li>
                    <li>La perte du colis sans remboursement</li>
                    <li>Des poursuites selon la loi en vigueur</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><AlertTriangle className="text-red-500" size={20}/> 4. PRODUITS INTERDITS OU RESTREINTS</h3>
                  <p className="font-black text-red-600 mb-2 uppercase">Produits strictement interdits :</p>
                  <ul className="list-none space-y-1 text-gray-600 mb-6">
                    <li>❌ Armes, munitions, explosifs</li>
                    <li>❌ Drogues et substances illicites</li>
                    <li>❌ Produits contrefaits</li>
                    <li>❌ Produits illégaux selon les lois d'Haïti ou de la R.D.</li>
                    <li>❌ Matériel dangereux ou prohibé</li>
                  </ul>
                  <p className="font-black text-orange-500 mb-2 uppercase">Produits réglementés (nécessitant autorisation) :</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 mb-4">
                    <li>Médicaments</li>
                    <li>Produits alimentaires</li>
                    <li>Produits chimiques</li>
                    <li>Batteries lithium (selon conditions)</li>
                  </ul>
                  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-gray-800 font-bold">
                    MEX509 se réserve le droit de refuser tout colis jugé non conforme.
                  </div>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><ShieldCheck className="text-mex-dark" size={20}/> 5. RESPONSABILITÉ EN CAS DE NON-DÉCLARATION</h3>
                  <p className="mb-2">Tout colis :</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 mb-3">
                    <li>Non déclaré</li>
                    <li>Mal déclaré</li>
                    <li>Ou contenant des articles interdits</li>
                  </ul>
                  <p className="font-bold">Peut être confisqué, détruit ou retenu par les autorités. MEX509 décline toute responsabilité en cas de perte dans ces situations.</p>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><Scale3d className="text-mex-dark" size={20}/> 6 & 7. DOUANE ET AUTORISATION LÉGALE</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                    <li>Les frais de douane sont à la charge du client.</li>
                    <li>MEX509 n'est pas responsable des décisions des autorités douanières.</li>
                    <li>En cas de saisie ou de blocage, le client doit gérer directement la situation avec les autorités. Aucun remboursement ne sera effectué.</li>
                  </ul>
                  <p className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 font-bold">En cas d'envoi de produits illégaux, le client autorise expressément MEX509 à transmettre ses informations aux autorités compétentes et coopérer avec les autorités pour toute enquête. MEX509 ne prendra aucune responsabilité légale dans ce cas.</p>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><DollarSign className="text-green-600" size={20}/> 8. CONDITIONS DE PAIEMENT</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Tous les paiements doivent être effectués avant la livraison.</li>
                    <li>Paiement possible en ligne (Stripe, PayPal, MONCASH ou autres).</li>
                    <li>Les frais de service ne sont pas remboursables.</li>
                    <li><strong>En cas de non-paiement :</strong> Le colis peut être retenu et des frais supplémentaires peuvent être appliqués.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><MapPin className="text-mex-blue" size={20}/> 9, 10, & 11. LIVRAISON ET EMBALLAGE</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Le client doit fournir une adresse correcte et complète. MEX509 n'est pas responsable des erreurs d'adresse fournies par le client.</li>
                    <li>Tout colis livré à une mauvaise adresse due à une erreur client ne sera pas récupéré.</li>
                    <li>Le fournisseur ou le client est responsable de l'emballage initial. MEX509 n'est pas responsable des dommages causés par un mauvais emballage ou la fragilité du produit non déclarée.</li>
                    <li>Les colis doivent être récupérés dans un délai raisonnable. Passé ce délai, des frais de stockage peuvent être appliqués.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3 flex items-center gap-2"><AlertCircle className="text-mex-orange" size={20}/> 12 & 13. SUIVI ET LIMITATION DE RESPONSABILITÉ</h3>
                  <p className="mb-4">Le client recevra des notifications (Email / WhatsApp). Le suivi dépend des informations fournies.</p>
                  <p className="font-bold text-gray-800 mb-2">MEX509 ne pourra être tenu responsable pour :</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Retards indépendants de sa volonté</li>
                    <li>Actions douanières</li>
                    <li>Perte liée à fausse déclaration</li>
                    <li>Produits interdits</li>
                    <li>Mauvaise information fournie par le client</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-black text-mex-dark text-xl mb-3">14 & 15. MODIFICATION ET ACCEPTATION</h3>
                  <p className="mb-4">MEX509 se réserve le droit de modifier ces conditions à tout moment. Les nouvelles conditions seront applicables dès leur publication.</p>
                  <p className="font-bold text-gray-800 mb-2">En utilisant nos services, le client confirme :</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Avoir lu et compris les conditions</li>
                    <li>Accepter toutes les règles</li>
                    <li>S'engager à les respecter</li>
                  </ul>
                </section>

                <section className="bg-gray-900 text-white p-8 rounded-2xl text-center">
                  <h3 className="font-black text-xl mb-2 text-white">16. CONTACTEZ-NOUS</h3>
                  <p className="text-gray-400 mb-4">Pour toute question concernant ces conditions :</p>
                  <div className="flex flex-col md:flex-row justify-center items-center gap-6 font-bold text-lg">
                    <a href="mailto:info@mex509.com" className="flex items-center gap-2 hover:text-mex-orange transition-colors"><Mail size={24}/> info@mex509.com</a>
                    <a href="tel:+50934494494" className="flex items-center gap-2 hover:text-mex-orange transition-colors"><Phone size={24}/> +509 3449-4494</a>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-700 text-sm font-medium text-gray-500 uppercase tracking-widest">
                    MEX509 SHIPPING - Reliable. Fast. Secure.
                  </div>
                </section>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}