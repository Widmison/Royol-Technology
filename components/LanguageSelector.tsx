"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { locales, type AppLocale } from "@/i18n/routing";

function setLocaleCookie(next: AppLocale) {
  document.cookie = `mex509_lang=${next}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  return (
    <label
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 ${
        compact ? "" : "shadow-sm"
      }`}
      aria-label="Select language"
    >
      <Languages size={14} className="text-mex-blue" />
      <select
        value={locale}
        onChange={(e) => {
          const v = e.target.value as AppLocale;
          setLocaleCookie(v);
          router.refresh();
        }}
        className="bg-transparent text-xs font-black uppercase text-mex-dark outline-none"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
