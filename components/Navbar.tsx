"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Package, Menu, X, User } from 'lucide-react';
import BrandLogo from "@/components/BrandLogo";
import { useShippingCalculator } from "@/components/ShippingCalculatorProvider";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const { open: openShippingCalc } = useShippingCalculator();
  const t = useTranslations("Nav");

  return (
    <nav className="w-full border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid h-20 w-full grid-cols-[1fr_auto] items-center gap-3 xl:grid-cols-[14rem_minmax(0,1fr)_14rem] xl:gap-0">
          <BrandLogo
            href="/"
            onClick={closeMenu}
            width={220}
            height={72}
            className="h-10 w-auto max-w-[200px] justify-self-start object-left"
            priority
            prefetch={false}
          />

          {/* Desktop: symmetric rails keep nav visually centered */}
          <nav className="hidden items-center justify-center gap-x-8 xl:col-start-2 xl:flex" aria-label="Main">
              <Link href="/" className="shrink-0 text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors">
                {t("home")}
              </Link>
              <Link href="/track" className="shrink-0 text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors">
                {t("track")}
              </Link>
              <Link href="/services" className="shrink-0 text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors">
                {t("services")}
              </Link>
              <button
                type="button"
                onClick={() => openShippingCalc()}
                className="shrink-0 border-0 bg-transparent p-0 text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors cursor-pointer"
              >
                {t("calc")}
              </button>
              <Link
                href="/login"
                className="flex shrink-0 items-center gap-1 text-sm font-bold text-mex-dark hover:text-mex-orange transition-colors"
              >
                <User size={16} /> {t("login")}
              </Link>
              <div className="shrink-0">
                <LanguageSelector compact />
              </div>
          </nav>

          <div className="col-start-2 flex items-center justify-self-end xl:col-start-3 xl:justify-self-end">
            <div className="mr-2 xl:hidden">
              <LanguageSelector compact />
            </div>
            <Link
              href="/quote"
              className="hidden xl:inline-flex shrink-0 items-center gap-2 rounded-full bg-mex-orange px-6 py-2.5 font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-700"
            >
              <Package size={18} />
              {t("quote")}
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-mex-dark hover:text-mex-orange p-2 xl:hidden"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0">
          <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col">
            <Link href="/" onClick={closeMenu} className="block px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors">{t("home")}</Link>
            <Link href="/track" onClick={closeMenu} className="block px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors">{t("track")}</Link>
            <Link href="/services" onClick={closeMenu} className="block px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors">{t("services")}</Link>
            <button
              type="button"
              onClick={() => {
                closeMenu();
                openShippingCalc();
              }}
              className="block w-full px-4 py-3 text-left text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors"
            >
              {t("calc")}
            </button>
            <Link href="/login" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-base font-bold text-mex-dark hover:text-mex-orange hover:bg-gray-50 rounded-xl transition-colors border-t border-gray-100 mt-2 pt-4"><User size={20} /> {t("login")}</Link>
            <Link href="/quote" onClick={closeMenu} className="mt-3 flex items-center justify-center gap-2 bg-mex-orange text-white px-6 py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 w-full"><Package size={20} /> {t("quote")}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}