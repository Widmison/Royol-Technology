"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export default function DashboardPricingVisualStrip() {
  const t = useTranslations("Dashboard.pricing");

  return (
    <div className="mb-10 rounded-2xl border border-gray-100 bg-gradient-to-b from-slate-50/80 to-white p-4 shadow-inner sm:p-6">
      <div className="mb-4 flex items-start gap-2 sm:items-center">
        <Sparkles className="mt-0.5 h-5 w-5 text-mex-orange" />
        <div>
          <h3 className="text-base font-black text-mex-dark sm:text-lg">{t("visualsTitle")}</h3>
          <p className="text-sm font-medium text-gray-600">{t("visualsSub")}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-white shadow">
          <Image
            src="/marketing/promo-delivery-services.png"
            alt=""
            width={640}
            height={360}
            className="h-40 w-full object-cover sm:h-44"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-white shadow">
          <Image
            src="/marketing/promo-transport-logistics.png"
            alt=""
            width={640}
            height={360}
            className="h-40 w-full object-cover sm:h-44"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-white shadow">
          <Image
            src="/marketing/promo-trusted-cargo.png"
            alt=""
            width={640}
            height={360}
            className="h-40 w-full object-cover sm:h-44"
          />
        </div>
      </div>
    </div>
  );
}
