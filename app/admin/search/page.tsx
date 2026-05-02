import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  MapPin,
  ArrowLeft,
  Search,
  User as UserIcon,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  FileSearch,
} from "lucide-react";

import ShipmentActionMenu from "@/components/ShipmentActionMenu";

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() || "";

  let pkg = null;
  let clients: any[] = [];

  if (query) {
    pkg = await prisma.package.findFirst({
      where: { trackingId: { equals: query, mode: "insensitive" } },
      include: { request: { include: { client: true, invoice: true } } },
    });

    if (!pkg) {
      clients = await prisma.user.findMany({
        where: {
          role: "CLIENT",
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      });
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-mex-blue transition-colors w-fit shrink-0"
        >
          <ArrowLeft size={20} className="text-mex-dark" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-mex-dark tracking-tight">Global CRM search</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 break-all">
            Query:{" "}
            <span className="font-bold text-mex-blue uppercase tracking-wider">
              {query || "—"}
            </span>
          </p>
        </div>
      </div>

      {!query && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <FileSearch size={48} className="text-gray-300 mb-4 shrink-0" />
          <h3 className="text-xl font-black text-mex-dark">Ready to search</h3>
          <p className="text-gray-500 font-medium mt-2 max-w-md">
            Use the bar at the top to type a tracking ID or scan a barcode. Results open here instantly.
          </p>
        </div>
      )}

      {pkg && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 h-fit min-w-0">
            <h3 className="font-black text-lg text-mex-dark mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <UserIcon className="text-mex-blue shrink-0" />
              Client file
            </h3>

            {pkg.request.client ? (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full name</p>
                  <p className="font-black text-xl text-mex-dark break-words">
                    {pkg.request.client.firstName} {pkg.request.client.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                  <div className="space-y-2">
                    <p className="font-bold text-gray-700 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <Phone size={16} className="text-mex-orange shrink-0" />{" "}
                      {pkg.request.client.phone || pkg.request.phone}
                    </p>
                    <p className="font-bold text-gray-700 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 min-w-0">
                      <Mail size={16} className="text-mex-blue shrink-0" />
                      <span className="truncate">{pkg.request.client.email}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Home address</p>
                  <div className="font-bold text-gray-700 flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="break-words">{pkg.request.client.address || "No address on file"}</div>
                      {(pkg.request.client.city || pkg.request.client.state) && (
                        <div className="text-sm text-gray-500 font-medium">
                          {pkg.request.client.city}, {pkg.request.client.state} {pkg.request.client.zipCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {pkg.request.client.isVerified && (
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200 uppercase tracking-wider">
                    <ShieldCheck size={14} /> Verified account
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <UserIcon size={32} className="mx-auto mb-3 text-gray-300" />
                Guest client
                <br />
                (no registered account)
              </div>
            )}
          </div>

          <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 pb-6 border-b border-gray-100 gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Package</p>
                  <h2 className="text-2xl sm:text-4xl font-black text-mex-blue tracking-widest uppercase break-all">
                    {pkg.trackingId}
                  </h2>
                </div>
                <div className="md:text-right shrink-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs uppercase font-black tracking-wider border border-gray-200 inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-mex-orange animate-pulse" />
                    {String(pkg.status).split("_").join(" ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cargo</p>
                  <p className="font-bold text-mex-dark text-lg">{pkg.request.category}</p>
                  <p className="text-gray-500 font-medium mt-1 break-words">{pkg.request.description}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Route</p>
                  <p className="font-bold text-mex-dark text-lg flex items-center gap-2 flex-wrap">
                    USA <ArrowRight size={16} className="text-gray-300 shrink-0" /> Haiti
                  </p>
                  <p className="text-mex-blue font-bold mt-1 text-sm uppercase tracking-wider">
                    {pkg.request.shippingMethod}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
                  <p className="font-black text-mex-dark text-2xl">
                    {pkg.request.invoice?.actualWeightLbs ?? "N/A"}{" "}
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">lbs</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice</p>
                  <p
                    className={`font-black text-2xl break-words ${
                      pkg.request.invoice?.status === "PAID" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {pkg.request.invoice?.status || "NONE"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200 mt-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
              <div className="min-w-0">
                <h3 className="font-black text-mex-dark text-lg">Next logistics step</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Scan to next hub or use manual override.</p>
              </div>
              <div className="w-full lg:w-auto shrink-0">
                <ShipmentActionMenu pkg={pkg} />
              </div>
            </div>
          </div>
        </div>
      )}

      {query && !pkg && clients.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-mex-dark">
              Found {clients.length} client{clients.length > 1 ? "s" : ""}
            </h3>
          </div>
          <div className="lg:hidden divide-y divide-gray-100">
            {clients.map((c) => (
              <div key={c.id} className="p-4 sm:p-5 space-y-2">
                <p className="font-black text-mex-dark">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-sm text-gray-600 break-all">{c.email}</p>
                <p className="text-sm text-gray-600">{c.phone || "N/A"}</p>
              </div>
            ))}
          </div>
          <div className="hidden lg:block overflow-x-auto overscroll-x-contain">
            <table className="w-full text-left min-w-[520px]">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Phone</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-4 font-black text-mex-dark whitespace-nowrap">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="p-4 text-gray-600 break-all max-w-[200px]">{c.email}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{c.phone || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {query && !pkg && clients.length === 0 && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <Search size={48} className="text-gray-300 mb-4 shrink-0" />
          <h3 className="text-xl font-black text-mex-dark">No results</h3>
          <p className="text-gray-500 font-medium mt-2 max-w-md break-words">
            No packages or clients matched &quot;{query}&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
