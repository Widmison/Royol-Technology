"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Marketing site only: header + footer.
 * Portals (client login, client dashboard, admin, pay) render full-screen without site chrome
 * so they can live on their own subdomains later without visual coupling to the public site.
 */
function isPortalPath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname.startsWith("/pay/")
  );
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isPortalPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
