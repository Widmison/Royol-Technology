import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  LayoutDashboard, Package as PackageIcon, FileText, Users, 
  MapPin, Receipt, ScanLine, ScanBarcode, ArrowLeft, Search,
  User as UserIcon, Phone, Mail, ArrowRight, ShieldCheck, FileSearch
} from "lucide-react";

import ShipmentActionMenu from "@/components/ShipmentActionMenu";
import AdminSearchBar from "@/components/AdminSearchBar"; // NEW IMPORT!

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() || "";

  let pkg = null;
  let clients: any[] = [];

  if (query) {
    pkg = await prisma.package.findFirst({
      where: { trackingId: { equals: query, mode: 'insensitive' } },
      include: { request: { include: { client: true, invoice: true } } }
    });

    if (!pkg) {
      clients = await prisma.user.findMany({
        where: {
          role: 'CLIENT',
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ]
        },
        take: 10
      });
    }
  }

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

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10">
          
          {/* THE NEW INTERACTIVE SEARCH BAR COMPONENT */}
          <AdminSearchBar initialQuery={query} />
          
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

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-mex-blue transition-colors">
              <ArrowLeft size={20} className="text-mex-dark"/>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-mex-dark tracking-tight">Global Scan Results</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Search query: <span className="font-bold text-mex-blue uppercase tracking-wider">{query}</span></p>
            </div>
          </div>

          {!query && (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <FileSearch size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-black text-mex-dark">Ready to Scan</h3>
              <p className="text-gray-500 font-medium mt-2 max-w-md">Use the search bar above to type a tracking ID, or scan a barcode to instantly pull up package and client records.</p>
            </div>
          )}

          {pkg && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
                <h3 className="font-black text-lg text-mex-dark mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <UserIcon className="text-mex-blue"/> Client File
                </h3>
                
                {pkg.request.client ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                      <p className="font-black text-xl text-mex-dark">{pkg.request.client.firstName} {pkg.request.client.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Details</p>
                      <div className="space-y-2">
                        <p className="font-bold text-gray-700 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <Phone size={16} className="text-mex-orange shrink-0"/> {pkg.request.client.phone || pkg.request.phone}
                        </p>
                        <p className="font-bold text-gray-700 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 overflow-hidden">
                          <Mail size={16} className="text-mex-blue shrink-0"/> <span className="truncate">{pkg.request.client.email}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Home Address</p>
                      <div className="font-bold text-gray-700 flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0"/> 
                        <div>
                          <div>{pkg.request.client.address || "No address on file"}</div>
                          {(pkg.request.client.city || pkg.request.client.state) && (
                            <div className="text-sm text-gray-500 font-medium">{pkg.request.client.city}, {pkg.request.client.state} {pkg.request.client.zipCode}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    {pkg.request.client.isVerified && (
                      <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200 uppercase tracking-wider">
                        <ShieldCheck size={14} /> Verified Account
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                    <UserIcon size={32} className="mx-auto mb-3 text-gray-300" />
                    Guest Client<br/>(No registered account)
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 pb-6 border-b border-gray-100 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Scanned Package</p>
                      <h2 className="text-4xl font-black text-mex-blue tracking-widest uppercase">{pkg.trackingId}</h2>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">System Status</p>
                      <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs uppercase font-black tracking-wider border border-gray-200 inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-mex-orange animate-pulse"></span> {String(pkg.status).replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cargo Details</p>
                      <p className="font-bold text-mex-dark text-lg">{pkg.request.category}</p>
                      <p className="text-gray-500 font-medium mt-1">{pkg.request.description}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Logistics Route</p>
                      <p className="font-bold text-mex-dark text-lg flex items-center gap-2">
                        USA <ArrowRight size={16} className="text-gray-300"/> Haiti
                      </p>
                      <p className="text-mex-blue font-bold mt-1 text-sm uppercase tracking-wider">{pkg.request.shippingMethod}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Measured Weight</p>
                      <p className="font-black text-mex-dark text-2xl">{pkg.request.invoice?.actualWeightLbs || "N/A"} <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">lbs</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Financial Status</p>
                      <p className={`font-black text-2xl ${pkg.request.invoice?.status === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>
                        {pkg.request.invoice?.status || "NO INVOICE GENERATED"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-black text-mex-dark text-lg">Update Logistics</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Scan to next hub or override manually.</p>
                  </div>
                  <div className="w-full md:w-auto">
                    <ShipmentActionMenu pkg={pkg} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {query && !pkg && clients.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-lg text-mex-dark">Found {clients.length} Client{clients.length > 1 ? 's' : ''}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr><th className="p-4 font-bold">Client Name</th><th className="p-4 font-bold">Email</th><th className="p-4 font-bold">Phone</th></tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-4 font-black text-mex-dark">{c.firstName} {c.lastName}</td>
                        <td className="p-4 text-gray-600">{c.email}</td>
                        <td className="p-4 text-gray-600">{c.phone || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {query && !pkg && clients.length === 0 && (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <Search size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-black text-mex-dark">No Results Found</h3>
              <p className="text-gray-500 font-medium mt-2">We couldn't find any packages or clients matching "{query}".</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}