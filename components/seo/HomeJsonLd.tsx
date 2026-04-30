import { getSiteUrlString } from "@/lib/site";

/** Organization + local office + WebSite (tracking search) for Google rich results. */
export default function HomeJsonLd() {
  const base = getSiteUrlString();
  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: "MEX509 Shipping Services",
      url: base,
      logo: `${base}/logo.jpg`,
      email: "info@mex509.com",
      telephone: "+50934494494",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+50934494494",
        email: "info@mex509.com",
        contactType: "customer service",
        areaServed: ["HT", "US", "DO"],
        availableLanguage: ["English", "French", "Haitian Creole"],
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${base}/#local`,
      name: "MEX509 — Doral, FL",
      image: `${base}/logo.jpg`,
      url: base,
      parentOrganization: { "@id": `${base}/#organization` },
      address: {
        "@type": "PostalAddress",
        streetAddress: "1962 NW 82nd Ave",
        addressLocality: "Doral",
        addressRegion: "FL",
        postalCode: "33191",
        addressCountry: "US",
      },
      priceRange: "$$",
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: "MEX509",
      description:
        "Fast, secure shipping and logistics from USA, Dominican Republic, and China to Haiti. Air, ocean, and ground freight.",
      publisher: { "@id": `${base}/#organization` },
      inLanguage: ["en", "fr", "es"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${base}/track?id={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
