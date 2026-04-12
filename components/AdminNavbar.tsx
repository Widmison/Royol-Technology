import Link from "next/link";
import { Bell, LogOut, ShieldCheck } from "lucide-react";
import AdminWordmark from "@/components/AdminWordmark";

export default function AdminNavbar() {
  return (
    <header className="bg-mex-dark text-white border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center gap-3">
            <div className="rounded bg-white px-2 py-1">
              <AdminWordmark href="/admin/dashboard" />
            </div>
            <span className="bg-mex-orange text-white text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase flex items-center gap-1">
              <ShieldCheck size={12} /> Admin Portal
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-white relative transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-mex-orange rounded-full border border-mex-dark"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer border-l border-gray-800 pl-6">
              <div className="w-8 h-8 rounded-full bg-mex-blue flex items-center justify-center text-sm font-bold shadow-inner">AD</div>
              <span className="text-sm font-medium hidden sm:block text-gray-300">Operations</span>
            </div>
            <Link href="/" className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-bold ml-4">
              <LogOut size={16} /> Exit
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}