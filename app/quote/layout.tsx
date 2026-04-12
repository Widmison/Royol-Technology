import type { Metadata } from "next";
import { sharePreviewOgImage } from "@/lib/share-image";

export const metadata: Metadata = {
  title: "Request a shipping quote",
  description:
    "Pre-register your shipment with MEX509: departure country, package details, destination in Haiti or the region, and preferred air, ocean, or ground freight.",
  alternates: { canonical: "/quote" },
  openGraph: {
    title: "Request a quote | MEX509",
    description: "Get a quote and pre-register your box for drop-off in Doral, FL.",
    url: "/quote",
    images: [sharePreviewOgImage],
  },
  twitter: {
    card: "summary",
    images: [sharePreviewOgImage.url],
  },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
