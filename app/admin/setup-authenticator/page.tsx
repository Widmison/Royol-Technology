import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AdminTwoFactorPanel from "@/components/admin/AdminTwoFactorPanel";
import LanguageSelector from "@/components/LanguageSelector";
import { adminNeedsAuthenticatorEnrollment } from "@/lib/adminTotpRequirement";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isPortalStaffRole } from "@/lib/staffAccess";

export default async function AdminSetupAuthenticatorPage() {
  const user = await getAdminSessionUser();
  if (!user || !isPortalStaffRole(user.role)) {
    redirect("/admin/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/admin/shipments");
  }
  if (!adminNeedsAuthenticatorEnrollment(user)) {
    redirect("/admin/dashboard");
  }

  const t = await getTranslations("AdminSecurity");

  return (
    <div className="relative space-y-8">
      <div className="absolute right-0 top-0 z-10 sm:right-4 sm:top-0">
        <LanguageSelector compact />
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
        {t("blockingBanner")}
      </div>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-mex-dark sm:text-3xl">{t("setupTitle")}</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-gray-600">{t("setupIntro")}</p>
      </div>

      <ol className="list-decimal space-y-4 border border-gray-100 bg-white/80 py-6 pe-8 ps-14 text-[15px] font-medium leading-relaxed text-gray-700 shadow-inner sm:text-base">
        <li>
          <p className="font-black text-mex-dark">{t("step1Title")}</p>
          <p className="mt-1 text-gray-600">{t("step1Body")}</p>
        </li>
        <li>
          <p className="font-black text-mex-dark">{t("step2Title")}</p>
          <p className="mt-1 text-gray-600">{t("step2Body")}</p>
        </li>
        <li>
          <p className="font-black text-mex-dark">{t("step3Title")}</p>
          <p className="mt-1 text-gray-600">{t("step3Body")}</p>
        </li>
        <li>
          <p className="font-black text-mex-dark">{t("step4Title")}</p>
          <p className="mt-1 text-gray-600">{t("step4Body")}</p>
        </li>
      </ol>

      <AdminTwoFactorPanel variant="mandatoryEnrollment" />

      <p className="text-xs font-medium text-gray-500">{t("afterSetup")}</p>
    </div>
  );
}
