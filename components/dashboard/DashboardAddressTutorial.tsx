"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";

export default function DashboardAddressTutorial() {
  const t = useTranslations("Dashboard.addressTutorial");

  return (
    <section className="rounded-2xl border border-mex-blue/15 bg-gradient-to-br from-white via-blue-50/40 to-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <BookOpen className="h-6 w-6 shrink-0 text-mex-blue" />
          {t("title")}
        </h2>
        <p className="text-sm font-medium text-gray-600 sm:max-w-xl sm:text-right">{t("intro")}</p>
      </div>

      <div className="mb-6 rounded-xl border border-dashed border-mex-orange/30 bg-amber-50/60 px-4 py-3 text-sm font-bold text-mex-dark">
        {t("cardTitle")}
        <p className="mt-2 font-mono text-xs font-semibold leading-relaxed text-gray-800 sm:text-sm">
          FULL NAME
          <br />
          +509 XX XX XXXX
          <br />
          1962 NW 82nd Ave
          <br />
          Doral, FL 33191
          <br />
          USA
        </p>
      </div>

      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t("stepLabel")}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <figure className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <Image
            src="/marketing/promo-delivery-services.png"
            alt={t("altMain")}
            width={480}
            height={280}
            className="h-40 w-full object-cover"
          />
        </figure>
        <figure className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <Image
            src="/marketing/branding-container.png"
            alt={t("altBox")}
            width={480}
            height={280}
            className="h-40 w-full object-cover"
          />
        </figure>
        <figure className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <Image
            src="/marketing/promo-trusted-cargo.png"
            alt={t("altTrusted")}
            width={480}
            height={280}
            className="h-40 w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
