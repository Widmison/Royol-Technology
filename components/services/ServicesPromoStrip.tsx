import ServicesPromoImagesRow from "@/components/services/ServicesPromoImagesRow";
import { getTranslations } from "next-intl/server";

/** Marketing `/services` — headline + three flyers in one row (shared layout with client dashboard). */
export default async function ServicesPromoStrip() {
  const t = await getTranslations("Services.promo");
  return (
    <section aria-label={t("aria")} className="relative">
      <div className="mb-8 flex flex-col gap-2 text-center sm:mb-10">
        <h2 className="text-xs font-black uppercase tracking-[0.35em] text-mex-blue/70">{t("eyebrow")}</h2>
        <p className="mx-auto max-w-2xl text-lg font-black text-mex-dark sm:text-xl">
          {t("title")}
        </p>
      </div>

      <ServicesPromoImagesRow />
    </section>
  );
}
