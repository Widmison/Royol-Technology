import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  LayoutDashboard, Package as PackageIcon, FileText, Users, 
  MapPin, Receipt 
} from "lucide-react";

import AdminUserManager from "@/components/AdminUserManager";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  
  // FETCH ONLY CLIENTS! This entirely blocks Admins from showing up in the list.
  const allClients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="fixed inset-0 z-[100] flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
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
          <Link href="/admin/shipments" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <PackageIcon size={20} /> Manage Shipments
          </Link>
          <Link href="/admin/shipments" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
            <MapPin size={20} /> Tracking Updates
          </Link>

          {/* ACTIVE CLIENTS TAB */}
          <Link href="/admin/clients" className="flex items-center gap-3 bg-mex-blue text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50 mt-2">
            <Users size={20} /> Client Database
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-2">
             <h2 className="font-black text-xl text-mex-dark tracking-tight hidden md:block">User Administration</h2>
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
          <div className="mb-8 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-mex-dark flex items-center gap-3 mb-2">
                <Users className="text-mex-blue" size={32} /> Client Database
              </h1>
              <p className="text-gray-500 font-medium text-sm">
                Total registered clients: <strong className="text-mex-orange text-lg">{allClients.length}</strong>
              </p>
            </div>
          </div>

          {/* RENDERING THE INTERACTIVE PRO MANAGER */}
          <AdminUserManager initialUsers={allClients} />

        </div>
      </main>
    </div>
  );
}