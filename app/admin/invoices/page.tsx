import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  LayoutDashboard, Package as PackageIcon, FileText, Users, 
  Search, MapPin, Receipt, CreditCard, CheckCircle, Copy, AlertCircle, ScanLine, ScanBarcode
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { request: true },
    orderBy: { createdAt: 'desc' }
  });

  const unpaidInvoices = invoices.filter((inv: any) => inv.status === "UNPAID");
  const paidInvoices = invoices.filter((inv: any) => inv.status === "PAID");

  return (
    // THE PRO TRICK ADDED HERE
    <div className="fixed inset-0 z-[100] flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-mex-dark text-white hidden md:flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-white">
          <Image src="/logo.jpg" alt="Mex509 Logo" width={120} height={40} className="h-8 w-auto object-contain" />
          <span className="ml-2 text-xs font-bold bg-mex-orange/20 text-mex-orange px-2 py-0.5 rounded">ADMIN</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <FileText size={20} /> Quote Requests
          </Link>
          
          <Link href="/admin/invoices" className="flex items-center gap-3 bg-mex-blue text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50">
            <Receipt size={20} /> Invoices & Billing
            {unpaidInvoices.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unpaidInvoices.length}
              </span>
            )}
          </Link>

          <Link href="/admin/shipments" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <PackageIcon size={20} /> Manage Shipments
          </Link>
          <Link href="/admin/shipments" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <MapPin size={20} /> Tracking Updates
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <Users size={20} /> Client Database
          </Link>

          {/* ======================================= */}
          {/* NEW: SCANNER OPERATIONS SECTION */}
          {/* ======================================= */}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 w-96 border border-gray-100">
            <Search className="text-gray-400 h-5 w-5 mr-3" />
            <input type="text" placeholder="Search invoices..." className="bg-transparent border-none focus:outline-none w-full text-sm font-medium text-gray-700" />
          </div>
          <div className="flex items-center gap-3 border-l border-gray-100 pl-6 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-mex-blue flex items-center justify-center text-white font-bold">AD</div>
            <div>
              <div className="text-sm font-bold text-mex-dark">Admin User</div>
              <div className="text-xs text-gray-500">Operations Manager</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-mex-dark flex items-center gap-3">
              <Receipt className="text-mex-blue" /> Financial Overview
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Manage pending payments and generated invoices.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* UNPAID INVOICES */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col border-t-4 border-t-red-500">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-mex-dark flex items-center gap-2"><AlertCircle className="text-red-500 h-5 w-5"/> Awaiting Payment</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr><th className="p-4 font-bold">Client</th><th className="p-4 font-bold">LBS</th><th className="p-4 font-bold">Amount</th><th className="p-4 font-bold text-right">Link</th></tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {unpaidInvoices.length === 0 ? (
                       <tr><td colSpan={4} className="p-6 text-center text-gray-500 font-medium">All invoices are paid!</td></tr>
                    ) : (
                      unpaidInvoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-mex-dark">{inv.request.firstName} {inv.request.lastName}</div>
                            <div className="text-gray-500 text-xs">{inv.request.phone}</div>
                          </td>
                          <td className="p-4 font-bold text-gray-600">{inv.actualWeightLbs} lbs</td>
                          <td className="p-4 font-black text-red-600">${inv.totalAmount.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <Link href={`/pay/${inv.id}`} target="_blank" className="text-mex-blue bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-end gap-1 ml-auto transition-colors w-fit">
                              <Copy size={14} /> Open Pay Link
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAID INVOICES */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col border-t-4 border-t-green-500">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-mex-dark flex items-center gap-2"><CheckCircle className="text-green-500 h-5 w-5"/> Recently Paid</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr><th className="p-4 font-bold">Client</th><th className="p-4 font-bold">Amount</th><th className="p-4 font-bold text-right">Status</th></tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {paidInvoices.length === 0 ? (
                       <tr><td colSpan={3} className="p-6 text-center text-gray-500 font-medium">No paid invoices yet.</td></tr>
                    ) : (
                      paidInvoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-mex-dark">{inv.request.firstName} {inv.request.lastName}</td>
                          <td className="p-4 font-black text-green-600">${inv.totalAmount.toFixed(2)}</td>
                          <td className="p-4 text-right"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Paid</span></td>
                        </tr>
                      ))
                    )}
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