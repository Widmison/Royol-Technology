import { MapPin } from "lucide-react";
import ServicesPromoImagesRow from "@/components/services/ServicesPromoImagesRow";

type Props = {
  /** Tighter spacing and typography for client dashboard pricing tab */
  compact?: boolean;
  className?: string;
};

export default function MarketingBrandGallery({ compact = false, className = "" }: Props) {
  const shell = compact ? "rounded-2xl" : "rounded-3xl";
  const mb = compact ? "mb-8 sm:mb-10" : "mb-12 sm:mb-16";

  return (
    <section aria-label="MEX509 brand and services" className={className}>
      <div className={`${mb}`}>
        <div
          className={`relative overflow-hidden border border-mex-blue/10 bg-gradient-to-br from-white via-blue-50/40 to-white shadow-[0_8px_40px_-12px_rgba(29,59,142,0.12)] ${shell} ${
            compact ? "px-5 py-6 sm:px-7 sm:py-8" : "px-6 py-8 sm:px-10 sm:py-10"
          }`}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mex-orange/10 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-3xl">
            <p
              className={`font-black uppercase tracking-[0.25em] text-mex-orange ${compact ? "text-[10px]" : "text-xs"}`}
            >
              Network &amp; intake
            </p>
            <h3
              className={`mt-2 font-black tracking-tight text-mex-dark ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}
            >
              Transport &amp; logistics you can trust
            </h3>
            <p
              className={`mt-4 font-medium leading-relaxed text-gray-600 ${compact ? "text-sm sm:text-[15px]" : "text-base sm:text-[17px]"}`}
            >
              Same-day and international lanes across our network — air, ocean, trucking, and warehouse handling,
              coordinated for Haiti and neighboring corridors.
            </p>

            <div
              className={`mt-6 flex gap-4 border-t border-mex-blue/10 pt-6 ${compact ? "flex-col sm:flex-row sm:items-center" : "flex-col sm:flex-row sm:items-center"}`}
            >
              <div className="flex shrink-0 items-center justify-center rounded-xl bg-mex-blue p-2.5 text-white shadow-sm">
                <MapPin className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Drop-off &amp; intake</p>
                <p className={`font-bold text-mex-dark ${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}>
                  1962 NW 82nd Ave, Doral, FL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ServicesPromoImagesRow compact={compact} />
    </section>
  );
}
