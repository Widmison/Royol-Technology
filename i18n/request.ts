import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isAppLocale, type AppLocale } from "./routing";

const COUNTRY_TO_LOCALE: Record<string, AppLocale> = {
  HT: "fr",
  FR: "fr",
  ES: "es",
  MX: "es",
  DO: "es",
  CO: "es",
  VE: "es",
  AR: "es",
  CL: "es",
  PE: "es",
  EC: "es",
  PA: "es",
  CR: "es",
  GT: "es",
  HN: "es",
  NI: "es",
  SV: "es",
  UY: "es",
  PY: "es",
  BO: "es",
  CU: "es",
};

function localeFromAcceptLanguage(value: string | null): AppLocale | null {
  if (!value) return null;
  const tokens = value
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean) as string[];
  for (const token of tokens) {
    if (token.startsWith("fr")) return "fr";
    if (token.startsWith("es")) return "es";
    if (token.startsWith("en")) return "en";
  }
  return null;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const fromSegment = await requestLocale;
  let locale: AppLocale = defaultLocale;

  if (fromSegment && isAppLocale(fromSegment)) {
    locale = fromSegment;
  } else {
    const c = (await cookies()).get("mex509_lang")?.value;
    if (c && isAppLocale(c)) {
      locale = c;
    } else {
      const h = await headers();
      const country = h.get("x-vercel-ip-country")?.toUpperCase();
      if (country && COUNTRY_TO_LOCALE[country]) {
        locale = COUNTRY_TO_LOCALE[country];
      } else {
        const fromAcceptLanguage = localeFromAcceptLanguage(h.get("accept-language"));
        if (fromAcceptLanguage) {
          locale = fromAcceptLanguage;
        }
      }
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
