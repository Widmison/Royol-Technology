"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Link2, Share2 } from "lucide-react";
import { getPortalSiteUrl } from "@/lib/siteUrl";

type Props = { referralCode: string };

function signupLink(code: string): string {
  const base =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : getPortalSiteUrl();
  return `${base.replace(/\/$/, "")}/login?ref=${encodeURIComponent(code)}`;
}

export default function DashboardReferralShareCard({ referralCode }: Props) {
  const t = useTranslations("Dashboard.referral");
  const [which, setWhich] = useState<"none" | "code" | "link">("none");
  const link = signupLink(referralCode);
  const shareText = t("shareText", { code: referralCode, link });

  async function copyText(label: "code" | "link", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setWhich(label);
      window.setTimeout(() => setWhich("none"), 2200);
    } catch {
      window.alert("Copy is not available in this browser.");
    }
  }

  return (
    <div className="rounded-2xl border border-mex-orange/20 bg-gradient-to-br from-orange-50/80 to-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-mex-orange">{t("title")}</h3>
          <p className="mt-1 break-all font-mono text-lg font-black leading-snug tracking-wide text-mex-dark [overflow-wrap:anywhere] sm:text-2xl md:text-3xl">
            {referralCode}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mex-orange/10 text-mex-orange">
          <Share2 size={20} />
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600">{t("hint")}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => void copyText("code", referralCode)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-mex-dark px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
        >
          {which === "code" ? <Check size={16} className="text-green-300" /> : <Copy size={16} />}
          {which === "code" ? t("copied") : t("copyCode")}
        </button>
        <button
          type="button"
          onClick={() => void copyText("link", link)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-mex-blue bg-white px-4 py-2.5 text-sm font-bold text-mex-blue transition hover:bg-blue-50"
        >
          {which === "link" ? <Check size={16} className="text-green-600" /> : <Link2 size={16} />}
          {which === "link" ? t("copied") : t("copyLink")}
        </button>
        {"share" in navigator && typeof navigator.share === "function" ? (
          <button
            type="button"
            onClick={() => void navigator.share!({ text: shareText, url: link }).catch(() => undefined)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-mex-dark hover:bg-gray-100"
          >
            <Share2 size={16} />
            {t("shareButton")}
          </button>
        ) : null}
      </div>
      <p className="mt-3 break-all text-[11px] font-medium text-gray-400">{link}</p>
    </div>
  );
}
