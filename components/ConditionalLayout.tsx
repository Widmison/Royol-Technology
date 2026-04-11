"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminNavbar from "./AdminNavbar";
import AdminFooter from "./AdminFooter";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {/* If Admin Route, show Admin Header. Otherwise, show Public Header */}
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      
      {/* Ensure Admin Dashboard spans the full height nicely */}
      <main className={!isAdminRoute ? "flex-grow" : "flex-grow flex flex-col bg-gray-50"}>
        {children}
      </main>
      
      {/* If Admin Route, show Admin Footer. Otherwise, show Public Footer */}
      {isAdminRoute ? <AdminFooter /> : <Footer />}
    </div>
  );
}