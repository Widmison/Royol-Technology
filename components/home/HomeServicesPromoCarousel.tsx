"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MARKETING_PROMOS } from "@/lib/marketingBrandAssets";

/**
 * Same three promo flyers as `/services` (ServicesPromoStrip), with a true
 * carousel + dots on small screens and a 3-column grid from md up.
 */
export default function HomeServicesPromoCarousel() {
  const t = useTranslations("Services.promo");
  const [activeIdx, setActiveIdx] = useState(0);
  const promos = useMemo(() => [...MARKETING_PROMOS], []);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % promos.length);
    }, 5200);
    return () => clearInterval(id);
  }, [promos.length]);

  const rounded = "rounded-3xl";
  const hMobile = "h-[min(92vw,440px)]";
  const hMd = "md:h-[440px]";
  const hLg = "lg:h-[480px]";

  return (
    <section aria-label={t("aria")} className="mt-12 md:mt-14">
      <div className="mb-6 flex flex-col gap-2 text-center sm:mb-8">
        <h2 className="text-xs font-black uppercase tracking-[0.35em] text-mex-blue/70">{t("eyebrow")}</h2>
        <p className="mx-auto max-w-2xl text-lg font-black text-mex-dark sm:text-xl">{t("title")}</p>
      </div>

      <div className="md:hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIdx * 100}%)` }}
          >
            {promos.map((img) => (
              <figure key={img.src} className="w-full shrink-0 px-1">
                <div
                  className={`relative w-full overflow-hidden border border-gray-200/80 bg-gray-50 shadow-lg ring-1 ring-black/[0.04] ${rounded} ${hMobile}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="100vw"
                    className="object-contain object-center p-2 sm:p-3"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {promos.map((img, idx) => (
            <button
              key={img.src}
              type="button"
              aria-label={`Promo slide ${idx + 1}`}
              onClick={() => setActiveIdx(idx)}
              className={`h-2.5 rounded-full transition-all ${idx === activeIdx ? "w-8 bg-mex-blue shadow-sm" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      </div>

      <div className={`hidden md:grid md:grid-cols-3 md:gap-4 lg:gap-6`}>
        {promos.map((img) => (
          <figure key={img.src} className="group relative md:min-w-0">
            <div
              className={`relative w-full overflow-hidden border border-gray-200/80 bg-gray-50 shadow-lg ring-1 ring-black/[0.04] transition duration-500 group-hover:shadow-xl ${rounded} ${hMd} ${hLg}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1280px) 33vw, 400px"
                className="object-contain object-center p-3 transition duration-700 group-hover:scale-[1.01]"
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
