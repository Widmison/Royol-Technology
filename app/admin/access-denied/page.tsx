import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LanguageSelector from "@/components/LanguageSelector";

export default async function AdminAccessDeniedPage() {
  const t = await getTranslations("AdminSecurity");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50 px-4 py-10 font-sans sm:py-14">
      <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-6">
        <LanguageSelector compact />
      </div>
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-red-500/10 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-black tracking-tight text-mex-dark sm:text-3xl">{t("accessDeniedTitle")}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm font-medium text-gray-600">{t("accessDeniedBody")}</p>
        <Link
          href="/admin/login"
          className="mt-8 inline-flex rounded-xl bg-mex-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-900"
        >
          {t("accessDeniedCta")}
        </Link>
      </div>
    </div>
  );
}
