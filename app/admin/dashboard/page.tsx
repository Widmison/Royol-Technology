import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  LayoutDashboard, Package as PackageIcon, FileText, Users, 
  Plus, MapPin, CheckCircle, Clock, Receipt, ScanLine, ScanBarcode 
} from "lucide-react";

import QuoteTable from "@/components/QuoteTable";
import AdminSearchBar from "@/components/AdminSearchBar"; // <--- THE CAMERA SEARCH BAR

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // ==========================================
  // FETCH REAL DATA FROM DATABASE
  // ==========================================
  const pendingQuotesCount = await prisma.shipmentRequest.count({
    where: { status: 'PENDING_DROPOFF' }
  });

  const activeShipmentsCount = await prisma.package.count({
    where: { status: { not: 'DELIVERED' } }
  });

  const unpaidInvoicesCount = await prisma.invoice.count({
    where: { status: 'UNPAID' }
  });

  const recentQuotes = await prisma.shipmentRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className="fixed inset-0 z-[100] flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* ============================== */}
      {/* SIDEBAR NAVIGATION */}
      {/* ============================== */}
      <aside className="w-64 bg-mex-dark text-white hidden md:flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-white">
          <Image src="/logo.jpg" alt="Mex509 Logo" width={120} height={40} className="h-8 w-auto object-contain" />
          <span className="ml-2 text-xs font-bold bg-mex-orange/20 text-mex-orange px-2 py-0.5 rounded">ADMIN</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-3 bg-mex-blue text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          
          <Link href="#" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <FileText size={20} /> Quote Requests 
            {pendingQuotesCount > 0 && (
              <span className="ml-auto bg-mex-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingQuotesCount}
              </span>
            )}
          </Link>

          <Link href="/admin/invoices" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <Receipt size={20} /> Invoices & Billing
            {unpaidInvoicesCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unpaidInvoicesCount}
              </span>
            )}
          </Link>

          <Link href="/admin/shipments" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <PackageIcon size={20} /> Manage Shipments
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <Users size={20} /> Client Database
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scanner Operations</p>
            <Link href="/admin/scan?mode=us" className="flex items-center gap-3 text-gray-400 hover:text-mex-blue hover:bg-white/5 px-4 py-3 rounded-xl font-bold transition-colors">
              <ScanLine size={20} /> US: Scan Out (Dispatch)
            </Link>
            <Link href="/admin/scan?mode=haiti" className="flex items-center gap-3 text-gray-400 hover:text-mex-orange hover:bg-white/5 px-4 py-3 rounded-xl font-bold transition-colors">
              <ScanBarcode size={20} /> HT: Scan In (Receive)
            </Link>
          </div>
        </nav>
      </aside>

      {/* ============================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================== */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10">
          
          {/* THE NEW INTERACTIVE SEARCH BAR COMPONENT */}
          <AdminSearchBar />
          
          <div className="flex items-center gap-6 hidden md:flex">
            <div className="flex items-center gap-3 border-l border-gray-100 pl-6 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-mex-blue flex items-center justify-center text-white font-bold shadow-md">AD</div>
              <div>
                <div className="text-sm font-bold text-mex-dark">Admin User</div>
                <div className="text-xs text-gray-500 font-medium">Operations Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-black text-mex-dark">Operations Overview</h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Manage quotes, tracking, and logistics in real-time.</p>
            </div>
            <Link href="/quote" target="_blank" className="bg-mex-orange text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-colors flex items-center gap-2">
              <Plus size={20} /> Create New Shipment
            </Link>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-mex-blue"><PackageIcon size={28} /></div>
              <div><div className="text-3xl font-black text-mex-dark">{activeShipmentsCount}</div><div className="text-sm text-gray-500 font-medium">Active Shipments</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-orange-50 p-4 rounded-xl text-mex-orange"><FileText size={28} /></div>
              <div><div className="text-3xl font-black text-mex-dark">{pendingQuotesCount}</div><div className="text-sm text-gray-500 font-medium">Pending Drop-offs</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-green-50 p-4 rounded-xl text-green-600"><CheckCircle size={28} /></div>
              <div><div className="text-3xl font-black text-mex-dark">0</div><div className="text-sm text-gray-500 font-medium">Delivered this Week</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-purple-50 p-4 rounded-xl text-purple-600"><MapPin size={28} /></div>
              <div><div className="text-3xl font-black text-mex-dark">0</div><div className="text-sm text-gray-500 font-medium">Containers at Port</div></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-mex-dark flex items-center gap-2"><Clock className="text-mex-orange h-5 w-5"/> Recent Pre-Registrations</h3>
                <Link href="/admin/shipments" className="text-mex-blue font-bold text-sm hover:underline">View All</Link>
              </div>
              <QuoteTable quotes={recentQuotes} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-mex-dark flex items-center gap-2"><MapPin className="text-mex-blue h-5 w-5"/> Active Shipments</h3>
                <Link href="/admin/shipments" className="text-mex-blue font-bold text-sm hover:underline">Manage Tracking</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr><th className="p-4 font-bold">Tracking ID</th><th className="p-4 font-bold">Status</th><th className="p-4 font-bold">Action</th></tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                     <tr><td colSpan={3} className="p-6 text-center text-gray-500 font-medium">No active packages found.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}