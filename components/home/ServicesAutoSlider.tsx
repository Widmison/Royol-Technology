"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plane, Ship, Truck, Smartphone, Tablet, Laptop, Router, TriangleAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { CALC_AIR_PER_LB, CALC_SEA_PER_LB, CALC_GROUND_PER_LB, formatUsd } from "@/lib/shippingCalculatorRates";

type ServiceCard = {
  id: string;
  title: string;
  sub: string;
  price: string;
  tone: string;
  featured?: boolean;
  blurb: string;
  ctaHref: string;
  ctaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SERVICE_CARDS: ServiceCard[] = [
  {
    id: "air",
    title: "Air Freight",
    sub: "Per pound",
    price: `${formatUsd(CALC_AIR_PER_LB)} / lb`,
    tone: "bg-blue-50 text-mex-blue",
    featured: true,
    blurb: "Fastest lane for urgent deliveries.",
    ctaHref: "/services#air",
    ctaLabel: "View air details",
    icon: Plane,
  },
  {
    id: "sea",
    title: "Sea Freight",
    sub: "Per pound",
    price: `${formatUsd(CALC_SEA_PER_LB)} / lb`,
    tone: "bg-gray-100 text-gray-700",
    blurb: "Best value for heavier cargo.",
    ctaHref: "/services#ocean",
    ctaLabel: "View sea details",
    icon: Ship,
  },
  {
    id: "ground",
    title: "Ground Shipping",
    sub: "Per pound",
    price: `${formatUsd(CALC_GROUND_PER_LB)} / lb`,
    tone: "bg-orange-50 text-mex-orange",
    blurb: "Regional transport with visibility.",
    ctaHref: "/services#catalog",
    ctaLabel: "View ground details",
    icon: Truck,
  },
];

type ElectronicsCard = {
  id: string;
  name: string;
  price: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
};

const ELECTRONICS_CARDS: ElectronicsCard[] = [
  { id: "phone", name: "Phone", price: "$35", icon: Smartphone, tone: "text-mex-orange" },
  { id: "broken-phone", name: "Broken phone", price: "$15", icon: TriangleAlert, tone: "text-red-400" },
  { id: "tablet", name: "Tablet", price: "$45", icon: Tablet, tone: "text-mex-orange" },
  { id: "laptop", name: "Laptop", price: "$60", icon: Laptop, tone: "text-mex-orange" },
  { id: "router", name: "Router", price: "$5", icon: Router, tone: "text-mex-orange" },
];

type CarouselItem = {
  key: string;
  title: string;
  subtitle: string;
  tag: string;
  body: React.ReactNode;
};

export default function ServicesAutoSlider() {
  const slides: CarouselItem[] = [
    {
      key: "per-pound",
      title: "Per-pound rates",
      subtitle: "Live service lanes",
      tag: "Most requested",
      body: (
        <div className="grid gap-3 md:grid-cols-3">
          {SERVICE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.id}
                className={`group relative rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  card.featured
                    ? "border-mex-blue/30 bg-gradient-to-br from-blue-50 to-white shadow-sm"
                    : "border-gray-100 bg-gray-50/70 hover:border-gray-200"
                }`}
              >
                {card.featured ? (
                  <span className="absolute -top-2 left-4 rounded-full bg-mex-blue px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    Featured
                  </span>
                ) : null}
                <div className={`inline-flex rounded-xl p-2.5 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-3 text-lg font-black text-mex-dark">{card.title}</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{card.sub}</p>
                <p className="mt-1 text-3xl font-black leading-none text-mex-dark">{card.price}</p>
                <p className="mt-1 text-xs font-medium text-gray-500">{card.blurb}</p>
                <Link href={card.ctaHref} className="mt-3 inline-flex text-sm font-bold text-mex-blue hover:underline">
                  {card.ctaLabel}
                </Link>
              </article>
            );
          })}
        </div>
      ),
    },
    {
      key: "electronics",
      title: "Electronics flat rates",
      subtitle: "Per item pricing",
      tag: "Transparent fees",
      body: (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {ELECTRONICS_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <Icon className={`mx-auto h-6 w-6 ${card.tone}`} />
                <p className="mt-2 text-xs font-bold text-gray-500">{card.name}</p>
                <p className="text-2xl font-black text-mex-dark">{card.price}</p>
              </article>
            );
          })}
        </div>
      ),
    },
    {
      key: "how-to-start",
      title: "How to start",
      subtitle: "3 quick steps",
      tag: "New customers",
      body: (
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { n: "1", t: "Request quote", d: "Send basic shipment details online." },
            { n: "2", t: "Drop-off or pickup", d: "Bring cargo to Doral or request pickup." },
            { n: "3", t: "Track updates", d: "Follow status in your dashboard until delivery." },
          ].map((s) => (
            <article
              key={s.n}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mex-orange/40"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-mex-orange text-sm font-black text-white">
                {s.n}
              </span>
              <h4 className="mt-3 text-lg font-black text-mex-dark">{s.t}</h4>
              <p className="mt-1 text-sm text-gray-600">{s.d}</p>
            </article>
          ))}
        </div>
      ),
    },
  ];

  const [idx, setIdx] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % total);
    }, 4200);
    return () => clearInterval(timer);
  }, [total]);

  const goPrev = () => setIdx((prev) => (prev - 1 + total) % total);
  const goNext = () => setIdx((prev) => (prev + 1) % total);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-mex-blue/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-mex-orange/10 blur-2xl" />

      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-mex-blue/80">Service prices</p>
          <h3 className="mt-1 text-2xl font-black text-mex-dark">Professional shipping carousel</h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-mex-blue/15 bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-mex-blue">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Rates update from active calculator
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/40 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 inline-flex rounded-full border border-mex-orange/20 bg-mex-orange/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-mex-orange">
              {slides[idx].tag}
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-mex-orange">{slides[idx].subtitle}</p>
            <h4 className="text-xl font-black text-mex-dark">{slides[idx].title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              aria-label="Previous pricing slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              aria-label="Next pricing slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.key} className="w-full shrink-0">
                {slide.body}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-2.5 rounded-full transition-all ${i === idx ? "w-9 bg-mex-blue shadow-sm" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Go to ${s.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
