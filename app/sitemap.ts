import type { MetadataRoute } from "next";
import { getSiteUrlString } from "@/lib/site";

/** Public marketing & utility pages (no admin, dashboard, or pay). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrlString();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/track`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/quote`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/conditions-generales`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  return entries;
}
