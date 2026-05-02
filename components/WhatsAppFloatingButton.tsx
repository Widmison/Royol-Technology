"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const WHATSAPP_HT = "https://wa.link/ckduxz";
const WHATSAPP_DR = "https://wa.link/yhoclq";

export default function WhatsAppFloatingButton() {
  const t = useTranslations("WhatsApp");
  const [href, setHref] = useState(WHATSAPP_HT);

  useEffect(() => {
    let mounted = true;
    async function loadGeo() {
      try {
        const res = await fetch("/api/public/geo", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as { country?: string | null };
        if (!mounted) return;
        const country = (data.country || "").toUpperCase();
        if (country === "DO") {
          setHref(WHATSAPP_DR);
          return;
        }
        setHref(WHATSAPP_HT);
      } catch {
        if (mounted) setHref(WHATSAPP_HT);
      }
    }
    void loadGeo();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("aria")}
      title={t("label")}
      className="fixed bottom-20 right-4 z-[120] inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-2xl shadow-green-500/40 transition hover:scale-[1.03] sm:bottom-16 sm:right-6"
    >
      <Image
        src="/icons/whatsapp-icon.png"
        alt={t("label")}
        width={56}
        height={56}
        className="h-14 w-14 object-cover"
        priority={false}
      />
      <span className="sr-only">{t("label")}</span>
    </a>
  );
}
