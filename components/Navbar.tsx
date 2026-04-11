"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* OFFICIAL LOGO */}
          <Link href="/" onClick={closeMenu} className="flex items-center">
            <Image 
              src="/Logo.jpg" 
              alt="Mex509 Logo" 
              width={160} 
              height={50} 
              className="h-10 w-auto object-contain" 
              priority 
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors">Home</Link>
            <Link href="/track" className="text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors">Track Package</Link>
            <Link href="/services" className="text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors">Services</Link>
            <Link href="/login" className="text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors flex items-center gap-1">
              <User size={16} /> Client Login
            </Link>
          </div>

          {/* Desktop Call to Action */}
          <div className="hidden md:flex">
            <Link href="/quote" className="bg-mex-orange text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-2">
              <Package size={18} />
              Request a Quote
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-mex-dark hover:text-mex-orange p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0">
          <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col">
            <Link href="/" onClick={closeMenu} className="block px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors">Home</Link>
            <Link href="/track" onClick={closeMenu} className="block px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors">Track Package</Link>
            <Link href="/services" onClick={closeMenu} className="block px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors">Services</Link>
            <Link href="/login" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors border-t border-gray-100 mt-2 pt-4"><User size={20} /> Client Login</Link>
            <Link href="/quote" onClick={closeMenu} className="mt-4 flex items-center justify-center gap-2 bg-mex-orange text-white px-6 py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 w-full"><Package size={20} /> Request a Quote</Link>
          </div>
        </div>
      )}
    </nav>
  );
}