"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Truck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import BrandLogo from "@/components/BrandLogo";
import { useShippingCalculator } from "@/components/ShippingCalculatorProvider";

const linkFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mex-orange rounded-sm";

const footLink =
  `${linkFocus} text-sm font-medium text-gray-300 transition-colors hover:text-white`;

const sectionLabel =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-mex-orange/90";

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const { open: openShippingCalc } = useShippingCalculator();

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-gradient-to-b from-[#10182c] via-[#0c1018] to-black text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mex-orange/55 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left lg:col-span-4">
            <div className="mb-5">
              <BrandLogo
                href="/"
                width={200}
                height={64}
                className="h-11 w-auto max-w-[188px] object-left drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                prefetch={false}
              />
            </div>
            <p className="text-base font-semibold tracking-tight text-gray-100">{t("slogan")}</p>
            <p className="mt-1.5 max-w-sm text-sm italic leading-snug text-gray-500">{t("slogan_ht")}</p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSevT3DsMg7B3fXAX9sqz4xOZYds_Xhk2QzmWOn2yCsgPSs7kA/viewform?pli=1"
              target="_blank"
              rel="noopener noreferrer"
              className={`group mt-6 flex w-full max-w-md flex-col rounded-2xl border border-white/[0.12] bg-white/[0.035] px-4 py-3.5 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.8)] transition hover:border-mex-orange/35 hover:bg-white/[0.06] md:max-w-sm ${linkFocus}`}
            >
              <span className="flex items-center gap-2 text-[13px] font-bold leading-snug text-white">
                {t("partner")}
                <ArrowUpRight
                  size={14}
                  className="opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </span>
              <span className="mt-1 text-xs font-normal leading-snug text-gray-500 group-hover:text-gray-400">
                {t("partnerSub")}
              </span>
            </a>
          </div>

          {/* Quick links */}
          <nav
            aria-label={t("quickLinksAria")}
            className="flex flex-col items-center md:items-start lg:col-span-2"
          >
            <div className="mb-5 flex items-center gap-2">
              <Truck className="h-4 w-4 text-mex-orange/90" aria-hidden />
              <h2 className={sectionLabel}>{t("quickLinks")}</h2>
            </div>
            <ul className="flex w-full max-w-[220px] flex-col gap-3 md:max-w-none">
              <li>
                <Link href="/" prefetch={false} className={`${footLink} block`}>
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link href="/track" prefetch={false} className={`${footLink} block`}>
                  {tNav("track")}
                </Link>
              </li>
              <li>
                <Link href="/services" prefetch={false} className={`${footLink} block`}>
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openShippingCalc()}
                  className={`${footLink} w-full rounded-sm text-left`}
                >
                  {tNav("calc")}
                </button>
              </li>
              <li>
                <Link href="/quote" prefetch={false} className={`${footLink} block font-semibold text-mex-orange hover:text-orange-300`}>
                  {tNav("quote")}
                </Link>
              </li>
              <li>
                <Link href="/login" prefetch={false} className={`${footLink} block`}>
                  {tNav("login")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Headquarters */}
          <div className="flex flex-col items-center md:items-start lg:col-span-3">
            <div className="mb-5 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-mex-orange/90" aria-hidden />
              <h2 className={sectionLabel}>{t("contact")}</h2>
            </div>
            <div className="w-full max-w-sm space-y-1 md:max-w-none">
              <address className="not-italic">
                <p className="flex gap-3 rounded-xl px-3 py-2.5 text-sm leading-relaxed text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-gray-100">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                  <span>
                    {t("addressLine1")}
                    <br />
                    {t("addressLine2")}
                  </span>
                </p>
              </address>
              <a
                href="mailto:info@mex509.com"
                className={`flex gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-mex-orange ${linkFocus}`}
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                info@mex509.com
              </a>
              <a
                href="tel:+50934494494"
                className={`flex gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-mex-orange ${linkFocus}`}
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                +509 34 49 44 94
              </a>
              <a
                href="https://wa.me/50934536985"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-mex-orange ${linkFocus}`}
              >
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                WhatsApp +509 34 53 69 85
              </a>
            </div>
          </div>

          {/* Service points */}
          <div className="flex flex-col items-center md:items-start lg:col-span-3">
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mex-orange/90" aria-hidden />
              <h2 className={sectionLabel}>{t("servicePointsTitle")}</h2>
            </div>
            <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-4 backdrop-blur-sm md:max-w-none">
              <div className="space-y-4 text-sm">
                <div className="border-b border-white/[0.08] pb-4">
                  <p className="font-bold text-gray-100">{t("stMarcName")}</p>
                  <p className="mt-1 text-gray-400">{t("stMarcAddress")}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-100">{t("santiagoName")}</p>
                  <p className="mt-1 text-gray-400">{t("santiagoAddress")}</p>
                  <p className="mt-2 text-sm font-bold text-mex-orange">{t("santiagoPhone")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal strip */}
        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-10 lg:mt-16 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="text-center lg:text-left">
            <p className="max-w-xl text-sm font-medium text-gray-400 text-pretty">
              &copy; {new Date().getFullYear()} {t("company")}. {t("rights")}
            </p>
            <p className="mt-1.5 text-xs text-gray-500">{t("lastUpdated")}</p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-end lg:gap-6">
            <Link
              href="/conditions-generales"
              prefetch={false}
              className={`text-sm font-semibold text-gray-300 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-mex-orange ${linkFocus}`}
            >
              {t("cgu")}
            </Link>
            <span className="hidden h-4 w-px bg-white/15 sm:inline" aria-hidden />
            <p className="text-center text-xs text-gray-500 sm:text-left lg:max-w-xs">
              {t("designedBy")}{" "}
              <a
                href="https://royoltechnology.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold text-mex-orange underline decoration-mex-orange/40 underline-offset-2 transition-colors hover:text-orange-300 ${linkFocus}`}
              >
                Royol Technology
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
