export const locales = ["en", "fr", "es"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";

export function isAppLocale(v: string): v is AppLocale {
  return (locales as readonly string[]).includes(v);
}
