import type { PackageStatus } from "@prisma/client";

export type AdminTrackingStatusOption = {
  value: PackageStatus;
  /** Short label in the admin dropdown */
  label: string;
  /** Stored on the tracking event as `description` (bilingual summary) */
  detail: string;
  defaultLocation: string;
};

export const ADMIN_TRACKING_STATUS_OPTIONS: AdminTrackingStatusOption[] = [
  {
    value: "RECEIVED_USA_WAREHOUSE",
    label: "1 — Received in USA Warehouse",
    detail: "Received in USA Warehouse — Colis resevwa nan depo USA ✅",
    defaultLocation: "1962 NW 82nd Ave Doral, FL 33126",
  },
  {
    value: "PROCESSING_SORTING_USA",
    label: "2 — Processing & sorting (USA)",
    detail: "Processing & sorting (USA) — Colis ap prepare pou shipment 🚚",
    defaultLocation: "1962 NW 82nd Ave Doral, FL 33126",
  },
  {
    value: "IN_TRANSIT_USA_TO_DR",
    label: "3 — In transit USA → Dominican Republic",
    detail: "In transit (USA → DR) — Colis ou sou wout pou RD ✈️",
    defaultLocation: "In transit — USA to Dominican Republic",
  },
  {
    value: "CUSTOMS_DR_ENTRY",
    label: "4 — Customs #1 (DR entry)",
    detail: "Customs clearance #1 (DR entry) — Premye douane (lè li antre RD) 🧾",
    defaultLocation: "Dominican Republic — customs",
  },
  {
    value: "ARRIVED_RD_WAREHOUSE",
    label: "5 — Arrived at RD warehouse",
    detail: "Arrived at RD warehouse — Colis ou rive nan depo RD 🇩🇴",
    defaultLocation: "RD warehouse",
  },
  {
    value: "PREPARING_HAITI_TRANSFER",
    label: "6 — Preparing for Haiti transfer",
    detail: "Preparing for Haiti transfer — Ap prepare pou travèse fwontyè 🚛",
    defaultLocation: "RD warehouse — outbound to Haiti",
  },
  {
    value: "IN_TRANSIT_RD_TO_HT",
    label: "7 — In transit RD → Haiti border",
    detail: "In transit (RD → Haiti border) — Sou wout pou antre Ayiti 🚚",
    defaultLocation: "En route — RD toward Haiti border",
  },
  {
    value: "CUSTOMS_HT_ENTRY",
    label: "8 — Customs #2 (Haiti entry)",
    detail: "Customs clearance #2 (Haiti entry) — Dezyèm douane (Ayiti) 🇭🇹",
    defaultLocation: "Haiti — customs",
  },
  {
    value: "ARRIVED_HT_MAIN_WAREHOUSE",
    label: "9 — Arrived at Haiti main warehouse",
    detail: "Arrived at Haiti main warehouse — Colis ou rive nan depo prensipal Ayiti 📍",
    defaultLocation: "Haiti main warehouse",
  },
  {
    value: "EN_ROUTE_CAP_HAITIEN",
    label: "10 — En route to Cap-Haïtien office",
    detail: "En route to Cap-Haïtien office — Sou wout pou biwo Okap",
    defaultLocation: "En route — Cap-Haïtien",
  },
  {
    value: "EN_ROUTE_HINCHE",
    label: "11 — En route to Hinche office",
    detail: "En route to Hinche office — Sou wout pou biwo Hinche",
    defaultLocation: "En route — Hinche",
  },
  {
    value: "EN_ROUTE_PORT_AU_PRINCE",
    label: "12 — En route to Port-au-Prince office",
    detail: "En route to Port-au-Prince office — Sou wout biwo Pòtoprens",
    defaultLocation: "En route — Port-au-Prince",
  },
  {
    value: "READY_FOR_PICKUP",
    label: "Ready for pickup (notify client)",
    detail: "Ready for pickup at local office — Pare pou ranmase",
    defaultLocation: "St Marc Rue louverture #336 Bon jean Market",
  },
  {
    value: "DELIVERED",
    label: "Delivered / picked up",
    detail: "Delivered / picked up — Livrezon finalize ✅",
    defaultLocation: "Final delivery",
  },
];

/** Legacy / shorthand statuses still allowed from older workflows */
export const ADMIN_TRACKING_LEGACY_OPTIONS: AdminTrackingStatusOption[] = [
  {
    value: "PROCESSING",
    label: "Legacy — Processing",
    detail: "Package in processing",
    defaultLocation: "Miami Warehouse (Doral, FL)",
  },
  {
    value: "IN_TRANSIT",
    label: "Legacy — In transit (generic)",
    detail: "In transit",
    defaultLocation: "In transit",
  },
  {
    value: "CUSTOMS",
    label: "Legacy — Customs (generic)",
    detail: "At customs",
    defaultLocation: "Customs",
  },
];

export const ALL_ADMIN_SCAN_STATUS_OPTIONS = [
  ...ADMIN_TRACKING_STATUS_OPTIONS,
  ...ADMIN_TRACKING_LEGACY_OPTIONS,
];

export function optionForStatus(status: string): AdminTrackingStatusOption | undefined {
  return ALL_ADMIN_SCAN_STATUS_OPTIONS.find((o) => o.value === status);
}
