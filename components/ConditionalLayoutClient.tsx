"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PortalIdleGuard from "@/components/PortalIdleGuard";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

/**
 * Marketing site only: header + footer.
 * Portals (client login, client dashboard, admin, pay) render full-screen without site chrome
 * so they can live on their own subdomains later without visual coupling to the public site.
 *
 * On the admin portal host, `/` is rewritten to `/admin/login` but the browser pathname stays `/`,
 * so we treat `/` as a portal path when `isAdminPortalHost` is true.
 */
function isPortalPath(pathname: string, isAdminPortalHost: boolean) {
  if (isAdminPortalHost && pathname === "/") {
    return true;
  }
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname.startsWith("/pay/")
  );
}

export default function ConditionalLayoutClient({
  children,
  isAdminPortalHost,
}: {
  children: React.ReactNode;
  isAdminPortalHost: boolean;
}) {
  const pathname = usePathname() ?? "";

  if (isPortalPath(pathname, isAdminPortalHost)) {
    const showWhatsApp = !pathname.startsWith("/admin");
    return (
      <>
        {children}
        {showWhatsApp ? <WhatsAppFloatingButton /> : null}
        {pathname.startsWith("/dashboard") ? <PortalIdleGuard variant="client" /> : null}
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
