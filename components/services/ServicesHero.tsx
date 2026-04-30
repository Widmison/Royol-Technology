import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Plane, Shield, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MARKETING_CONTAINER } from "@/lib/marketingBrandAssets";

export default async function ServicesHero() {
  const t = await getTranslations("Services.hero");
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] md:rounded-[2.25rem] bg-[#0c1d4d] px-6 py-14 shadow-2xl shadow-mex-blue/25 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      {/* Ambient mesh */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(230,72,21,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 90%, rgba(29,59,142,0.55), transparent 50%), radial-gradient(ellipse 50% 40% at 60% 40%, rgba(255,255,255,0.08), transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_24px] opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-mex-orange" aria-hidden />
              {t("badge")}
            </span>
          </div>

          <div className="space-y-5">
            <h1 className="font-black uppercase italic leading-[1.05] tracking-tight text-white drop-shadow-sm">
              <span className="block text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
                {t("title1")}
              </span>
              <span className="mt-2 block bg-gradient-to-r from-white via-white to-white/85 bg-clip-text text-3xl text-transparent sm:text-4xl lg:text-[2.75rem] xl:text-[3rem]">
                {t("title2")}
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base font-medium leading-relaxed text-blue-100/95 lg:mx-0 lg:max-w-lg">
              {t("subtitle")}
            </p>
          </div>

          <ul className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:mx-0 lg:justify-start">
            <li className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/95 backdrop-blur-md sm:justify-start">
              <Plane className="h-5 w-5 shrink-0 text-mex-orange" aria-hidden />
              {t("chip1")}
            </li>
            <li className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/95 backdrop-blur-md sm:justify-start">
              <Shield className="h-5 w-5 shrink-0 text-mex-orange" aria-hidden />
              {t("chip2")}
            </li>
            <li className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/95 backdrop-blur-md sm:justify-start">
              <MapPin className="h-5 w-5 shrink-0 text-mex-orange" aria-hidden />
              <span className="text-left">{t("chip3")}</span>
            </li>
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mex-orange px-8 py-4 text-base font-black text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-600 hover:shadow-orange-900/50"
            >
              {t("ctaQuote")}
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </Link>
            <Link
              href="/dashboard?tab=new-box"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-white/25 bg-white/5 px-8 py-4 text-base font-black text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
            >
              {t("ctaBox")}
            </Link>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200/70">
            {t("tagline")}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div className="pointer-events-none absolute -left-10 top-1/3 h-48 w-48 rounded-full bg-mex-orange/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-white/12 to-white/[0.04] p-6 shadow-2xl backdrop-blur-md ring-1 ring-white/10 sm:p-8">
            <div className="relative mx-auto aspect-[4/3] max-h-[280px] w-full sm:max-h-[320px] lg:max-h-[340px]">
              <Image
                src={MARKETING_CONTAINER.src}
                alt={MARKETING_CONTAINER.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain object-center drop-shadow-2xl"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/80">{t("intakeLabel")}</p>
                <p className="mt-1 text-sm font-bold text-white">{t("intakeBody")}</p>
              </div>
              <Link
                href="/track"
                className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-mex-blue transition hover:bg-blue-50"
              >
                {t("track")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
