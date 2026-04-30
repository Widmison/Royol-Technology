import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { sharePreviewOgImage } from "@/lib/share-image";
import { ArrowRight, Plane, Ship, ShoppingCart, MapPinned, Warehouse } from "lucide-react";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesPromoStrip from "@/components/services/ServicesPromoStrip";
import { LOGISTICS_SERVICES, type LogisticsServiceId } from "@/lib/logistics-services";

export const metadata: Metadata = {
  title: "Logistics Services",
  description:
    "MEX509 services: USA–Haiti air freight, DR–Haiti ocean freight, shopping & consolidation, local delivery, and warehouse solutions from Doral, FL.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Our logistics services | MEX509",
    description: "Air, ocean, shopping, warehouse, and local delivery tailored for Haiti-bound cargo.",
    url: "/services",
    images: [sharePreviewOgImage],
  },
  twitter: {
    card: "summary",
    images: [sharePreviewOgImage.url],
  },
};

function ServiceIcon({ id }: { id: LogisticsServiceId }) {
  const common = "h-8 w-8 text-mex-blue";
  switch (id) {
    case "us-ht":
      return <Plane className={common} />;
    case "dr-ht":
      return <Ship className={common} />;
    case "shopping":
      return <ShoppingCart className={common} />;
    case "local":
      return <MapPinned className={common} />;
    case "warehouse":
      return <Warehouse className={common} />;
    default:
      return null;
  }
}

export default async function ServicesPage() {
  const t = await getTranslations("Services");
  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-24 lg:pt-14">
          <ServicesHero />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <ServicesPromoStrip />

        <div id="catalog" className="mt-20 scroll-mt-24 sm:mt-24">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-mex-blue sm:text-4xl">{t("capabilitiesTitle")}</h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-gray-600 sm:text-lg">
              {t("capabilitiesSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {LOGISTICS_SERVICES.map((service, index) => {
              const sectionId =
                service.id === "us-ht" ? "air" : service.id === "dr-ht" ? "ocean" : undefined;
              return (
              <article
                key={service.id}
                id={sectionId}
                className="group relative flex flex-col overflow-hidden scroll-mt-28 rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_2px_24px_-4px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-mex-blue/15 hover:shadow-[0_24px_48px_-12px_rgba(29,59,142,0.15)]"
              >
                <span
                  className="absolute right-6 top-6 font-black tabular-nums text-5xl leading-none text-gray-100 transition group-hover:text-blue-50"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-white shadow-inner ring-1 ring-mex-blue/10 transition group-hover:scale-105 group-hover:shadow-md">
                  <ServiceIcon id={service.id} />
                </div>
                <h3 className="relative text-xl font-black leading-snug text-mex-dark sm:text-2xl">
                  {t(`catalog.${service.id}.title`)}
                </h3>
                <p className="relative mt-4 flex-grow text-sm font-medium leading-relaxed text-gray-600 sm:text-[15px]">
                  {t(`catalog.${service.id}.description`)}
                </p>
                <div className="relative mt-8 border-t border-gray-50 pt-6">
                  {service.external ? (
                    <a
                      href={service.actionHref}
                      className="inline-flex items-center gap-2 font-black text-mex-orange transition hover:gap-3"
                    >
                      {t("startNow")}
                      <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={service.actionHref}
                      className="inline-flex items-center gap-2 font-black text-mex-orange transition hover:gap-3"
                    >
                      {t("startNow")}
                      <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                    </Link>
                  )}
                </div>
              </article>
            );
            })}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border border-mex-blue/10 bg-gradient-to-br from-mex-blue/[0.06] to-transparent px-8 py-12 text-center sm:mt-24 sm:px-12">
          <p className="text-lg font-black text-mex-dark sm:text-xl">{t("notSureTitle")}</p>
          <p className="mt-2 text-sm font-medium text-gray-600 sm:text-base">
            {t("notSureSub")}
          </p>
          <Link
            href="/quote"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-mex-blue px-10 py-4 text-base font-black text-white shadow-lg shadow-blue-900/25 transition hover:bg-blue-950"
          >
            {t("startQuote")}
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
