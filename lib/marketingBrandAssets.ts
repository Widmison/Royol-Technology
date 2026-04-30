/** Static assets in `public/marketing/` — shared by `/services` and client dashboard pricing tab. */

export const MARKETING_CONTAINER = {
  src: "/marketing/branding-container.png",
  alt: "MEX509 branded shipping container — Voye li vit, resevwa li vit",
} as const;

export const MARKETING_PROMOS = [
  {
    src: "/marketing/promo-delivery-services.png",
    alt: "MEX509 delivery services — fast, safe package delivery",
  },
  {
    src: "/marketing/promo-transport-logistics.png",
    alt: "MEX509 transport and logistics — Doral FL and international freight",
  },
  {
    src: "/marketing/promo-trusted-cargo.png",
    alt: "MEX509 trusted cargo service — budget-friendly timely delivery",
  },
] as const;
