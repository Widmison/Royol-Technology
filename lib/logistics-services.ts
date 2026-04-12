/**
 * Shared copy for marketing `/services` and client portal pricing tab.
 */
export type LogisticsServiceId = "us-ht" | "dr-ht" | "shopping" | "local" | "warehouse";

export type LogisticsService = {
  id: LogisticsServiceId;
  title: string;
  description: string;
  /** Portal-relative path or absolute mailto */
  actionHref: string;
  external?: boolean;
};

export const LOGISTICS_SERVICES: LogisticsService[] = [
  {
    id: "us-ht",
    title: "Shipping USA to Haiti",
    description:
      "Fast, reliable air and ocean freight from our Miami warehouse directly to Port-au-Prince. Secure handling for personal packages, electronics, and commercial goods.",
    actionHref: "/dashboard?tab=new-box",
  },
  {
    id: "dr-ht",
    title: "Shipping DR to Haiti",
    description:
      "Cross-border logistics from the Dominican Republic to Haiti. We handle customs, transportation, and final delivery safely and efficiently.",
    actionHref: "/dashboard?tab=new-box",
  },
  {
    id: "shopping",
    title: "Online Shopping Assistance",
    description:
      "Don't have a credit card? We buy on your behalf from Shein, Amazon, Alibaba, or DR stores, and ship it straight to you in Haiti.",
    actionHref:
      "mailto:support@mex509.com?subject=MEX509%20%E2%80%94%20Online%20Shopping%20Assistance",
    external: true,
  },
  {
    id: "local",
    title: "Local Delivery",
    description:
      "Convenient local distribution. Choose between secure pickup at our designated facilities or direct-to-door delivery in supported zones.",
    actionHref: "mailto:support@mex509.com?subject=MEX509%20%E2%80%94%20Local%20Delivery%20Request",
    external: true,
  },
  {
    id: "warehouse",
    title: "Warehouse Services",
    description:
      "Secure storage solutions. Consolidate multiple packages into one shipment to save money on freight costs.",
    actionHref: "/dashboard?tab=new-box",
  },
];
