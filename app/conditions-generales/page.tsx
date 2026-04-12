import type { Metadata } from "next";
import { CguLegalSections, CguPageHeader } from "@/components/CguDocument";
import { sharePreviewOgImage } from "@/lib/share-image";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description:
    "Conditions générales d'utilisation des services MEX509 : transport, déclaration, douane, paiement, livraison et contact.",
  alternates: { canonical: "/conditions-generales" },
  openGraph: {
    title: "Conditions Générales d'Utilisation | MEX509",
    description:
      "CGU MEX509 : règles de transport, responsabilités, paiements, réclamations et données personnelles.",
    url: "/conditions-generales",
    type: "article",
    locale: "fr_FR",
    images: [sharePreviewOgImage],
  },
  twitter: {
    card: "summary",
    images: [sharePreviewOgImage.url],
  },
};

export default function ConditionsGeneralesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <CguPageHeader />
        <CguLegalSections />
      </div>
    </div>
  );
}
