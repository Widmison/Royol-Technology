import type { MetadataRoute } from "next";
import { getSiteUrlString } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrlString();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api/", "/pay/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
