"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Plane, Ship } from "lucide-react";
import { useTranslations } from "next-intl";

type ServiceCard = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
};

export default function HomeServicesCards() {
  const t = useTranslations("Home");
  const [activeIdx, setActiveIdx] = useState(0);

  const cards = useMemo<ServiceCard[]>(
    () => [
      {
        id: "air",
        title: t("cards.air.title"),
        body: t("cards.air.body"),
        href: "/services#air",
        cta: t("cards.learnMore"),
        icon: Plane,
      },
      {
        id: "quote",
        title: t("cards.quote.title"),
        body: t("cards.quote.body"),
        href: "/quote",
        cta: t("cards.quote.cta"),
        icon: Package,
        featured: true,
      },
      {
        id: "ocean",
        title: t("cards.ocean.title"),
        body: t("cards.ocean.body"),
        href: "/services#ocean",
        cta: t("cards.learnMore"),
        icon: Ship,
      },
    ],
    [t]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % cards.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [cards.length]);

  return (
    <>
      <div className="md:hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIdx * 100}%)` }}
          >
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.id}
                  className={`w-full shrink-0 rounded-3xl p-8 text-center transition-all duration-300 ${
                    card.featured
                      ? "relative overflow-hidden border-2 border-mex-orange/20 bg-white shadow-xl"
                      : "border border-gray-100 bg-white shadow-md"
                  }`}
                >
                  {card.featured ? (
                    <>
                      <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-mex-orange to-orange-400" />
                      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-mex-orange/5" />
                    </>
                  ) : null}
                  <div
                    className={`mx-auto mb-5 inline-flex rounded-2xl p-4 transition-colors duration-300 ${
                      card.featured ? "bg-orange-50 text-mex-orange" : "bg-blue-50 text-mex-blue"
                    }`}
                  >
                    <Icon className={card.featured ? "h-9 w-9" : "h-8 w-8"} />
                  </div>
                  <h3 className={`mb-3 text-mex-dark ${card.featured ? "text-2xl font-black tracking-tight" : "text-xl font-bold"}`}>
                    {card.title}
                  </h3>
                  <p className={`mb-6 leading-relaxed ${card.featured ? "text-sm text-gray-600" : "text-sm text-gray-500"}`}>{card.body}</p>
                  <Link
                    href={card.href}
                    className={`mt-auto inline-flex items-center justify-center font-bold transition-all duration-300 ${
                      card.featured
                        ? "w-full rounded-xl bg-mex-orange/10 px-6 py-3 text-mex-orange hover:bg-mex-orange hover:text-white"
                        : "text-sm text-gray-400 hover:text-mex-blue"
                    }`}
                  >
                    {card.cta} {!card.featured ? "→" : null}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`h-2.5 rounded-full transition-all ${idx === activeIdx ? "w-8 bg-mex-blue" : "w-2.5 bg-gray-300"}`}
              aria-label={`Go to ${card.title}`}
            />
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-3 md:gap-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              className={`group flex flex-col items-center rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 ${
                card.featured
                  ? "relative overflow-hidden border-2 border-mex-orange/20 bg-white shadow-xl md:-mt-4 md:mb-4"
                  : "border border-gray-100 bg-white shadow-md hover:shadow-xl"
              }`}
            >
              {card.featured ? (
                <>
                  <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-mex-orange to-orange-400" />
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-mex-orange/5" />
                </>
              ) : null}
              <div
                className={`mb-5 rounded-2xl p-4 transition-colors duration-300 ${
                  card.featured
                    ? "bg-orange-50 text-mex-orange group-hover:bg-mex-orange group-hover:text-white"
                    : "bg-blue-50 text-mex-blue group-hover:bg-mex-blue group-hover:text-white"
                }`}
              >
                <Icon className={card.featured ? "h-9 w-9" : "h-8 w-8"} />
              </div>
              <h3 className={`mb-3 text-mex-dark ${card.featured ? "text-2xl font-black tracking-tight" : "text-xl font-bold"}`}>
                {card.title}
              </h3>
              <p className={`mb-6 text-sm leading-relaxed ${card.featured ? "text-gray-600" : "text-gray-500"}`}>{card.body}</p>
              <Link
                href={card.href}
                className={`mt-auto font-bold transition-all duration-300 ${
                  card.featured
                    ? "w-full rounded-xl bg-mex-orange/10 px-6 py-3 text-mex-orange group-hover:bg-mex-orange group-hover:text-white"
                    : "text-sm text-gray-400 group-hover:text-mex-blue"
                }`}
              >
                {card.cta} {!card.featured ? " →" : null}
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
