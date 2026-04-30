import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MARKETING_PROMOS } from "@/lib/marketingBrandAssets";

type Props = {
  /** Client dashboard: slightly smaller frames & radii */
  compact?: boolean;
  className?: string;
};

/**
 * Three flyer images in one row — horizontal scroll on small screens,
 * equal columns + object-contain from md up (matches `/services` promo strip).
 */
export default async function ServicesPromoImagesRow({ compact = false, className = "" }: Props) {
  const t = await getTranslations("Services");
  const rounded = compact ? "rounded-2xl" : "rounded-3xl";
  const hMobile = compact ? "h-[min(85vw,360px)]" : "h-[min(92vw,440px)]";
  const hMd = compact ? "md:h-[340px]" : "md:h-[440px]";
  const hLg = compact ? "lg:h-[380px]" : "lg:h-[480px]";
  const gap = compact ? "gap-3 md:gap-3 lg:gap-4" : "gap-4 md:gap-4 lg:gap-6";
  const cardPad = compact ? "p-1.5 sm:p-2" : "p-2 sm:p-3";

  return (
    <div className={className}>
      <div
        className={`-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 ${gap}`}
      >
        {MARKETING_PROMOS.map((img) => (
          <figure
            key={img.src}
            className="group relative w-[min(88vw,400px)] shrink-0 snap-center md:w-auto md:min-w-0 md:snap-none"
          >
            <div
              className={`relative w-full overflow-hidden border border-gray-200/80 bg-gray-50 shadow-lg ring-1 ring-black/[0.04] transition duration-500 group-hover:shadow-xl ${rounded} ${hMobile} ${hMd} ${hLg}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 90vw, 33vw"
                className={`object-contain object-center transition duration-700 group-hover:scale-[1.01] ${cardPad}`}
              />
            </div>
          </figure>
        ))}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-gray-400 md:hidden">{t("swipeAllThree")}</p>
    </div>
  );
}
