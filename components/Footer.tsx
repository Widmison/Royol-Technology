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
  `${linkFocus} inline-flex min-h-11 w-full max-w-full items-center text-sm font-medium text-gray-300 transition-colors hover:text-white md:min-h-0`;

const sectionLabel =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-mex-orange/90";

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const { open: openShippingCalc } = useShippingCalculator();

  return (
    <footer className="relative mt-auto overflow-x-clip border-t border-white/10 bg-gradient-to-b from-[#10182c] via-[#0c1018] to-black pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mex-orange/55 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="flex min-w-0 flex-col items-stretch border-b border-white/[0.08] pb-10 text-center max-md:pt-0 md:items-start md:border-0 md:pb-0 md:text-left lg:col-span-4">
            <div className="mb-4 flex justify-center md:mb-5 md:justify-start">
              <BrandLogo
                href="/"
                width={200}
                height={64}
                className="h-10 w-auto max-w-[min(100%,200px)] object-contain object-center drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)] sm:h-11 md:object-left"
                prefetch={false}
              />
            </div>
            <p className="text-pretty text-base font-semibold tracking-tight text-gray-100">{t("slogan")}</p>
            <p className="mt-1.5 text-pretty text-sm italic leading-snug text-gray-500">{t("slogan_ht")}</p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSevT3DsMg7B3fXAX9sqz4xOZYds_Xhk2QzmWOn2yCsgPSs7kA/viewform?pli=1"
              target="_blank"
              rel="noopener noreferrer"
              className={`group mx-auto mt-6 flex min-w-0 w-full max-w-full flex-col rounded-2xl border border-white/[0.12] bg-white/[0.035] px-4 py-4 text-left shadow-[0_12px_40px_-24px_rgba(0,0,0,0.8)] transition active:scale-[0.99] hover:border-mex-orange/35 hover:bg-white/[0.06] sm:mx-0 md:max-w-sm ${linkFocus}`}
            >
              <span className="flex items-start gap-2 text-[13px] font-bold leading-snug text-white">
                <span className="min-w-0 flex-1 break-words">{t("partner")}</span>
                <ArrowUpRight
                  size={14}
                  className="mt-0.5 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </span>
              <span className="mt-1.5 break-words text-xs font-normal leading-snug text-gray-500 group-hover:text-gray-400">
                {t("partnerSub")}
              </span>
            </a>
          </div>

          {/* Quick links */}
          <nav
            aria-label={t("quickLinksAria")}
            className="flex min-w-0 flex-col items-stretch border-b border-white/[0.08] px-0 py-10 max-md:gap-0 md:items-start md:border-0 md:py-0 lg:col-span-2"
          >
            <div className="mb-4 flex items-center justify-center gap-2 md:mb-5 md:justify-start">
              <Truck className="h-4 w-4 shrink-0 text-mex-orange/90" aria-hidden />
              <h2 className={`${sectionLabel} max-sm:text-[10px] max-sm:tracking-[0.16em]`}>{t("quickLinks")}</h2>
            </div>
            <ul className="grid w-full min-w-0 grid-cols-1 gap-x-5 gap-y-0 sm:grid-cols-2 sm:gap-x-8 md:flex md:max-w-none md:flex-col md:gap-2">
              <li className="min-w-0">
                <Link href="/" prefetch={false} className={footLink}>
                  {tNav("home")}
                </Link>
              </li>
              <li className="min-w-0">
                <Link href="/track" prefetch={false} className={footLink}>
                  {tNav("track")}
                </Link>
              </li>
              <li className="min-w-0">
                <Link href="/services" prefetch={false} className={footLink}>
                  {tNav("services")}
                </Link>
              </li>
              <li className="min-w-0">
                <button
                  type="button"
                  onClick={() => openShippingCalc()}
                  className={`${footLink} justify-start text-left`}
                >
                  {tNav("calc")}
                </button>
              </li>
              <li className="min-w-0 sm:col-span-2">
                <Link
                  href="/quote"
                  prefetch={false}
                  className={`${footLink} justify-center rounded-xl border border-mex-orange/30 bg-mex-orange/10 py-3 font-semibold text-mex-orange hover:border-mex-orange/50 hover:bg-mex-orange/15 hover:text-orange-200 md:justify-start md:border-0 md:bg-transparent md:py-0 md:font-semibold`}
                >
                  {tNav("quote")}
                </Link>
              </li>
              <li className="min-w-0 sm:col-span-2">
                <Link href="/login" prefetch={false} className={footLink}>
                  {tNav("login")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Headquarters */}
          <div className="flex min-w-0 flex-col items-stretch border-b border-white/[0.08] py-10 max-md:px-0 md:border-0 md:py-0 lg:col-span-3">
            <div className="mb-4 flex items-center justify-center gap-2 md:mb-5 md:justify-start">
              <Building2 className="h-4 w-4 shrink-0 text-mex-orange/90" aria-hidden />
              <h2 className={`${sectionLabel} max-sm:text-[10px] max-sm:tracking-[0.16em]`}>{t("contact")}</h2>
            </div>
            <div className="w-full min-w-0 max-w-full space-y-1 md:max-w-none">
              <address className="not-italic">
                <p className="flex gap-3 rounded-xl px-3 py-3 text-sm leading-relaxed text-gray-300 transition-colors active:bg-white/[0.06] hover:bg-white/[0.04] hover:text-gray-100 md:py-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                  <span className="min-w-0 text-pretty break-words">
                    {t("addressLine1")}
                    <br />
                    {t("addressLine2")}
                  </span>
                </p>
              </address>
              <a
                href="mailto:info@mex509.com"
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition-colors active:bg-white/[0.06] hover:bg-white/[0.04] hover:text-mex-orange md:min-h-0 md:py-2.5 ${linkFocus}`}
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                <span className="min-w-0 break-all">info@mex509.com</span>
              </a>
              <a
                href="tel:+50934494494"
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition-colors active:bg-white/[0.06] hover:bg-white/[0.04] hover:text-mex-orange md:min-h-0 md:py-2.5 ${linkFocus}`}
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                <span className="min-w-0 whitespace-normal">+509 34 49 44 94</span>
              </a>
              <a
                href="https://wa.me/50934536985"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex min-h-11 items-start gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition-colors active:bg-white/[0.06] hover:bg-white/[0.04] hover:text-mex-orange md:min-h-0 md:items-center md:py-2.5 ${linkFocus}`}
              >
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
                <span className="min-w-0 flex-1 text-pretty break-words leading-snug">WhatsApp +509 34 53 69 85</span>
              </a>
            </div>
          </div>

          {/* Service points */}
          <div className="flex min-w-0 flex-col items-stretch pt-10 md:items-start md:pt-0 lg:col-span-3">
            <div className="mb-4 flex items-center justify-center gap-2 md:mb-5 md:justify-start">
              <MapPin className="h-4 w-4 shrink-0 text-mex-orange/90" aria-hidden />
              <h2 className={`${sectionLabel} max-sm:text-[10px] max-sm:tracking-[0.16em]`}>{t("servicePointsTitle")}</h2>
            </div>
            <div className="w-full min-w-0 max-w-full rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-4 backdrop-blur-sm md:max-w-none">
              <div className="space-y-4 text-sm">
                <div className="border-b border-white/[0.08] pb-4">
                  <p className="font-bold text-gray-100">{t("stMarcName")}</p>
                  <p className="mt-1 text-pretty break-words text-gray-400">{t("stMarcAddress")}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-100">{t("santiagoName")}</p>
                  <p className="mt-1 text-pretty break-words text-gray-400">{t("santiagoAddress")}</p>
                  <p className="mt-2 text-sm font-bold text-mex-orange">{t("santiagoPhone")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal strip */}
        <div className="mx-auto mt-10 flex max-w-lg flex-col gap-6 border-t border-white/10 pt-8 sm:mt-12 sm:max-w-none lg:mt-14 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pt-10">
          <div className="min-w-0 text-center lg:max-w-md lg:text-left">
            <p className="text-pretty text-sm font-medium leading-relaxed text-gray-400">
              &copy; {new Date().getFullYear()} {t("company")}. {t("rights")}
            </p>
            <p className="mt-2 text-xs text-gray-500">{t("lastUpdated")}</p>
          </div>
          <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-end lg:gap-6">
            <Link
              href="/conditions-generales"
              prefetch={false}
              className={`inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-sm font-semibold text-gray-300 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-mex-orange md:min-h-0 ${linkFocus}`}
            >
              {t("cgu")}
            </Link>
            <span className="hidden h-4 w-px shrink-0 bg-white/15 sm:inline" aria-hidden />
            <p className="text-center text-pretty text-xs leading-relaxed text-gray-500 sm:text-left lg:max-w-xs">
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
