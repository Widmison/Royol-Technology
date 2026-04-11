import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  LayoutDashboard, Package as PackageIcon, FileText, Users, 
  Search, MapPin, Receipt, ScanLine, ScanBarcode, ArrowRight, Plane, Ship
} from "lucide-react";

import ShipmentActionMenu from "@/components/ShipmentActionMenu";

export const dynamic = "force-dynamic";

export default async function AdminShipmentsPage() {
  const packages = await prisma.package.findMany({
    include: { request: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="fixed inset-0 z-[100] flex h-screen bg-gray-50 overflow-hidden font-sans">
      
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
          <Link href="/admin/invoices" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <Receipt size={20} /> Invoices & Billing
          </Link>
          <Link href="/admin/shipments" className="flex items-center gap-3 bg-mex-blue text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50">
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 w-96 border border-gray-100">
            <Search className="text-gray-400 h-5 w-5 mr-3" />
            <input type="text" placeholder="Search tracking ID..." className="bg-transparent border-none focus:outline-none w-full text-sm font-medium text-gray-700" />
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
              <PackageIcon className="text-mex-blue" /> Active Shipments Masterlist
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">View all active packages and process their next steps.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-5 font-bold">Tracking ID</th>
                    <th className="p-5 font-bold">Client Info</th>
                    <th className="p-5 font-bold">Route & ETA</th>
                    <th className="p-5 font-bold">Current Status</th>
                    <th className="p-5 font-bold text-right">Next Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {packages.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No packages yet. Use Weigh &amp; Invoice on the admin dashboard when a box arrives.</td></tr>
                  ) : (
                    packages.map((pkg: any) => {
                      
                      const method = pkg.request.shippingMethod?.toLowerCase() || "";
                      const isAir = method.includes('air') || method.includes('avyon');
                      const MethodIcon = isAir ? Plane : Ship;
                      const etaText = isAir ? "5-7 Days (Air)" : "15-22 Days (Sea)";

                      return (
                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-5 font-black text-mex-dark text-base tracking-wider uppercase">
                            {pkg.trackingId}
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-mex-dark">{pkg.request.firstName} {pkg.request.lastName}</div>
                            <div className="text-gray-500 text-xs font-medium mt-0.5">{pkg.request.phone}</div>
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-gray-700 flex items-center gap-2">
                              USA <ArrowRight size={14} className="text-gray-400"/> Haiti
                            </div>
                            <div className={`text-[10px] font-black mt-1.5 flex items-center gap-1.5 uppercase tracking-wider ${isAir ? 'text-mex-blue' : 'text-gray-500'}`}>
                              <MethodIcon size={14} /> ETA: {etaText}
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider border border-gray-200">
                              {String(pkg.status).replace('_', ' ')}
                            </span>
                          </td>
                          
                          <td className="p-5 text-right">
                            {/* HERE IS THE CREATIVE NEW MENU */}
                            <ShipmentActionMenu pkg={pkg} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}