import Image from "next/image";
import Link from "next/link";
// Added Star and Quote to the lucide-react import
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Package,
  Star,
  Quote,
  Phone,
  Mail,
  ExternalLink,
  Truck,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeJsonLd from "@/components/seo/HomeJsonLd";
import { sharePreviewOgImage } from "@/lib/share-image";
import HomeServicesCards from "@/components/home/HomeServicesCards";

export const metadata: Metadata = {
  title: "Shipping USA, DR & China to Haiti",
  description:
    "Track packages, request a quote, and ship with MEX509 from Doral, FL. Air, ocean, and ground freight to Haiti — fast, secure, guaranteed service.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MEX509 | Voye Li Vit, Resevwa Li Vit!",
    description:
      "Sèvis rapid e sekirize. Livrezon garanti! USA, DR, and China to Haiti — track, quote, and ship.",
    url: "/",
    images: [sharePreviewOgImage],
  },
  twitter: {
    card: "summary",
    images: [sharePreviewOgImage.url],
  },
};

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <div className="flex flex-col min-h-screen">
      <HomeJsonLd />
      
      {/* HERO SECTION (Your Custom Design) */}
      <section className="bg-mex-gray pt-6 pb-24 lg:pt-10 lg:pb-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          
          <div className="w-full flex justify-center relative mb-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-tr from-mex-blue/10 to-mex-orange/10 rounded-full blur-2xl -z-10"></div>
            
            <Image 
              src="/hero-v2.jpg" 
              alt={t("heroImageAlt")}
              width={220} 
              height={275} 
              className="w-full max-w-[140px] md:max-w-[180px] lg:max-w-[220px] object-contain drop-shadow-xl z-10"
              priority
            />
          </div>

          <div className="text-center w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-mex-blue tracking-tight mb-3 italic uppercase">
              {t("heroTitleLine1")} <br className="block sm:hidden" />
              <span className="text-mex-orange">{t("heroTitleLine2")}</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-6 font-medium max-w-2xl mx-auto">
              {t("heroSubtitle")}
            </p>

            <form
              action="/track"
              method="get"
              className="bg-white p-3 md:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center border border-gray-100 relative z-20 max-w-3xl mx-auto"
            >
              <div className="relative w-full flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="id"
                  type="search"
                  autoComplete="off"
                  placeholder={t("trackPlaceholder")}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mex-orange focus:border-transparent text-gray-800 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-mex-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
              >
                {t("trackButton")}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* QUICK ACTIONS / SERVICES OVERVIEW (Your Custom Design) */}
      <section className="py-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-20">
            <HomeServicesCards />
          </div>
          <p className="mt-10 max-w-2xl mx-auto text-center text-sm text-gray-600">
            <span className="font-bold text-mex-dark">{t("groundIntroBold")}</span> {t("groundIntro1")}{" "}
            <Link href="/services" className="font-bold text-mex-blue underline-offset-2 hover:underline">
              {t("browseServices")}
            </Link>{" "}
            {t("or")}{" "}
            <Link href="/quote" className="font-bold text-mex-orange underline-offset-2 hover:underline">
              {t("startQuote")}
            </Link>
            .
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — reduces uncertainty for first-time shippers */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="how-it-works-heading" className="text-3xl font-black italic uppercase text-mex-blue sm:text-4xl">
              {t("how.title")}
            </h2>
            <p className="mt-3 text-sm font-medium text-gray-600 sm:text-base">
              {t("how.subtitle")}
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: t("how.steps.1.title"),
                body: t("how.steps.1.body"),
                icon: ClipboardList,
              },
              {
                step: "2",
                title: t("how.steps.2.title"),
                body: t("how.steps.2.body"),
                icon: MapPin,
              },
              {
                step: "3",
                title: t("how.steps.3.title"),
                body: t("how.steps.3.body"),
                icon: CreditCard,
              },
              {
                step: "4",
                title: t("how.steps.4.title"),
                body: t("how.steps.4.body"),
                icon: Package,
              },
            ].map(({ step, title, body, icon: Icon }) => (
              <li
                key={step}
                className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-mex-orange text-sm font-black text-white">
                  {step}
                </span>
                <Icon className="mb-3 h-8 w-8 text-mex-blue" aria-hidden />
                <h3 className="text-lg font-black text-mex-dark">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-mex-orange px-8 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-700"
            >
              {t("how.ctaQuote")}
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold text-mex-blue underline-offset-4 hover:underline"
            >
              {t("how.ctaLogin")}
            </Link>
          </div>
        </div>
      </section>

      {/* VISIT + CONTACT — trust & convenience */}
      <section className="bg-white py-14 sm:py-16" aria-labelledby="visit-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 id="visit-heading" className="text-2xl font-black italic uppercase text-mex-dark sm:text-3xl">
                {t("visit.title")}
              </h2>
              <p className="mt-3 text-sm font-medium text-gray-600 sm:text-base">
                {t("visit.subtitle")}
              </p>
              <address className="mt-6 not-italic text-base font-bold text-mex-dark">
                1962 NW 82nd Ave
                <br />
                Doral, FL 33191
              </address>
              <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-gray-700 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <a
                  href="tel:+50934494494"
                  className="inline-flex items-center gap-2 text-mex-blue transition hover:text-mex-orange"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  +509 34 49 44 94
                </a>
                <a
                  href="mailto:info@mex509.com"
                  className="inline-flex items-center gap-2 text-mex-blue transition hover:text-mex-orange"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  info@mex509.com
                </a>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=1962+NW+82nd+Ave+Doral+FL+33191"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-mex-blue px-5 py-3 text-sm font-bold text-mex-blue transition hover:bg-mex-blue hover:text-white"
              >
                {t("visit.maps")}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <div className="flex flex-1 flex-col items-start rounded-2xl border border-gray-100 bg-mex-gray/50 p-6 sm:p-8 lg:max-w-md">
              <Truck className="mb-3 h-10 w-10 text-mex-orange" aria-hidden />
              <h3 className="text-lg font-black text-mex-dark">{t("visit.cardTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t("visit.cardBody")}
              </p>
              <Link href="/services" className="mt-4 text-sm font-bold text-mex-orange hover:underline">
                {t("visit.cardLink")} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: CLIENT TESTIMONIALS */}
      <section className="py-20 bg-mex-blue relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase mb-4">{t("testimonials.title")}</h2>
            <p className="text-blue-200 font-medium max-w-2xl mx-auto">{t("testimonials.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl relative">
              <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-100" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-gray-600 mb-6 relative z-10 italic">
                {t("testimonials.items.1.quote")}
              </p>
              <div className="font-bold text-mex-dark">- {t("testimonials.items.1.name")}</div>
              <div className="text-xs text-gray-400">{t("testimonials.items.1.city")}</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl relative transform md:-translate-y-4">
              <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-100" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-gray-600 mb-6 relative z-10 italic">
                {t("testimonials.items.2.quote")}
              </p>
              <div className="font-bold text-mex-dark">- {t("testimonials.items.2.name")}</div>
              <div className="text-xs text-gray-400">{t("testimonials.items.2.city")}</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl relative">
              <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-100" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-gray-600 mb-6 relative z-10 italic">
                {t("testimonials.items.3.quote")}
              </p>
              <div className="font-bold text-mex-dark">- {t("testimonials.items.3.name")}</div>
              <div className="text-xs text-gray-400">{t("testimonials.items.3.city")}</div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ — answers objections before they bounce */}
      <section className="border-t border-gray-100 bg-white py-16 sm:py-20" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="text-center text-3xl font-black italic uppercase text-mex-blue sm:text-4xl">
            {t("faq.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-600">
            {t("faq.subtitle")}
          </p>
          <div className="mt-10 space-y-3">
            {[
              {
                q: t("faq.items.1.q"),
                a: t("faq.items.1.a"),
              },
              {
                q: t("faq.items.2.q"),
                a: t("faq.items.2.a"),
              },
              {
                q: t("faq.items.3.q"),
                a: t("faq.items.3.a"),
              },
              {
                q: t("faq.items.4.q"),
                a: t("faq.items.4.a"),
              },
              {
                q: t("faq.items.5.q"),
                a: t("faq.items.5.a"),
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-4 open:bg-white open:shadow-md"
              >
                <summary className="cursor-pointer font-bold text-mex-dark text-sm sm:text-base">
                  {item.q}
                </summary>
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / TRUST BADGES */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black italic text-mex-dark mb-12 uppercase">{t("trust.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-mex-orange mb-4" />
              <h4 className="font-bold text-lg mb-2 text-mex-dark">{t("trust.fastTitle")}</h4>
              <p className="text-gray-500 text-sm">{t("trust.fastBody")}</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-12 w-12 text-mex-orange mb-4" />
              <h4 className="font-bold text-lg mb-2 text-mex-dark">{t("trust.secureTitle")}</h4>
              <p className="text-gray-500 text-sm">{t("trust.secureBody")}</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-mex-orange mb-4" />
              <h4 className="font-bold text-lg mb-2 text-mex-dark">{t("trust.localTitle")}</h4>
              <p className="text-gray-500 text-sm">{t("trust.localBody")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}