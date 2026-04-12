import type { Metadata } from "next";
import Link from "next/link";
import { sharePreviewOgImage } from "@/lib/share-image";
import { Plane, Ship, ShoppingCart, MapPinned, Warehouse } from "lucide-react";
import { LOGISTICS_SERVICES, type LogisticsServiceId } from "@/lib/logistics-services";

export const metadata: Metadata = {
  title: "Logistics Services",
  description:
    "MEX509 services: USA–Haiti air freight, DR–Haiti ocean freight, shopping & consolidation, local delivery, and warehouse solutions from Doral, FL.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Our logistics services | MEX509",
    description: "Air, ocean, shopping, warehouse, and local delivery tailored for Haiti-bound cargo.",
    url: "/services",
    images: [sharePreviewOgImage],
  },
  twitter: {
    card: "summary",
    images: [sharePreviewOgImage.url],
  },
};

function ServiceIcon({ id }: { id: LogisticsServiceId }) {
  const common = "h-10 w-10 text-mex-blue";
  switch (id) {
    case "us-ht":
      return <Plane className={common} />;
    case "dr-ht":
      return <Ship className={common} />;
    case "shopping":
      return <ShoppingCart className={common} />;
    case "local":
      return <MapPinned className={common} />;
    case "warehouse":
      return <Warehouse className={common} />;
    default:
      return null;
  }
}

export default function ServicesPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-4xl font-black italic text-mex-blue uppercase mb-4">Our Services</h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Comprehensive logistics solutions tailored for speed, security, and peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {LOGISTICS_SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-xl hover:border-mex-orange/30 transition-all group flex flex-col h-full"
            >
              <div className="bg-white w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ServiceIcon id={service.id} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-mex-dark mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-8 flex-grow text-sm sm:text-base">{service.description}</p>
              {service.external ? (
                <a
                  href={service.actionHref}
                  className="text-mex-orange font-bold flex items-center gap-2 hover:gap-3 transition-all mt-auto w-fit"
                >
                  Start Now <span className="text-xl">&rarr;</span>
                </a>
              ) : (
                <Link
                  href={service.actionHref}
                  className="text-mex-orange font-bold flex items-center gap-2 hover:gap-3 transition-all mt-auto w-fit"
                >
                  Start Now <span className="text-xl">&rarr;</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
