import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Truck,
  Shield,
  Clock,
  Keyboard,
  MessageCircle,
} from "lucide-react";
import AdminTwoFactorPanel from "@/components/admin/AdminTwoFactorPanel";
import AdminStaffAllowlistPanel from "@/components/admin/AdminStaffAllowlistPanel";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isWebDevPortalAdmin } from "@/lib/webDevAccess";
import { getSiteUrlString } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await getAdminSessionUser();
  const showStaffAllowlist = isWebDevPortalAdmin(admin);
  const publicSite = getSiteUrlString();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-mex-dark">Admin workspace</h1>
        <p className="text-gray-500 font-medium text-sm mt-1 max-w-2xl">
          Quick reference for docks, tools, and shortcuts. Bookmark this page on warehouse tablets.
        </p>
      </div>

      {showStaffAllowlist ? <AdminStaffAllowlistPanel /> : null}

      <AdminTwoFactorPanel />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-black text-mex-dark flex items-center gap-2 mb-4">
            <MapPin className="text-mex-blue" size={22} /> US receiving (Doral)
          </h2>
          <p className="font-bold text-mex-dark">1962 NW 82nd Ave</p>
          <p className="font-bold text-mex-dark mb-3">Doral, FL 33191</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=1962%20NW%2082nd%20Ave%2C%20Doral%2C%20FL%2033191"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-mex-blue hover:underline"
          >
            Open in Google Maps <ExternalLink size={14} />
          </a>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-black text-mex-dark flex items-center gap-2 mb-4">
            <Truck className="text-mex-orange" size={22} /> Haiti hub (St Marc)
          </h2>
          <p className="font-bold text-mex-dark">Rue Louverture #336</p>
          <p className="font-bold text-mex-dark mb-3">Bon Jean Market — St Marc</p>
          <p className="text-sm text-gray-500 font-medium">
            Confirm dock hours with local ops before dispatching final-mile drivers.
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-black text-mex-dark flex items-center gap-2 mb-3">
            <Keyboard size={20} className="text-gray-500" /> Scanner tips
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 font-medium list-disc pl-5">
            <li>USB scanners: click the scan field first — keystrokes go to the focused input.</li>
            <li>Camera mode needs HTTPS and camera permission in the browser.</li>
            <li>CRM search accepts partial names, emails, phones, or full MEX tracking IDs.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-black text-mex-dark flex items-center gap-2 mb-3">
            <Shield size={20} className="text-mex-blue" /> Support &amp; public links
          </h2>
          <div className="flex flex-col gap-2 text-sm font-bold">
            <a
              href={`${publicSite}/track`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mex-blue hover:underline inline-flex items-center gap-2"
            >
              Public tracking <ExternalLink size={14} aria-hidden />
            </a>
            <a
              href={`${publicSite}/quote`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mex-blue hover:underline inline-flex items-center gap-2"
            >
              Public quote form <ExternalLink size={14} aria-hidden />
            </a>
            <a
              href="mailto:info@mex509.com"
              className="mt-2 inline-flex items-center gap-2 font-medium text-gray-700 hover:text-mex-blue hover:underline"
            >
              <Mail size={16} className="shrink-0 text-mex-blue" aria-hidden /> info@mex509.com
            </a>
            <a
              href="tel:+50934494494"
              className="inline-flex items-center gap-2 font-medium text-gray-700 hover:text-mex-blue hover:underline"
            >
              <Phone size={16} className="shrink-0 text-mex-blue" aria-hidden /> +509 34 49 44 94
            </a>
            <a
              href="https://wa.me/50934536985"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-2 font-medium text-gray-700 hover:text-mex-blue hover:underline"
            >
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>WhatsApp +509 34 53 69 85</span>
            </a>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-5 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-2">
          <Clock size={16} /> Environment
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl">
          Notifications (email/SMS) and payment capture are configured via environment variables in
          production. This page is safe to share with warehouse staff — it contains no secrets.
        </p>
      </section>
    </div>
  );
}
