import Link from "next/link";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import BrandLogo from "@/components/BrandLogo";

const linkFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mex-orange rounded-sm";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-mex-dark text-white py-12 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row md:items-start md:justify-between md:gap-8 lg:px-8">
        <div className="flex w-full flex-col items-center text-center md:w-auto md:max-w-sm md:items-start md:text-left">
          <div className="mb-3 flex justify-center md:justify-start">
            <BrandLogo href="/" width={200} height={64} className="h-12 w-auto max-w-[180px] object-left" prefetch={false} />
          </div>
          <p className="mt-1 text-sm font-medium text-gray-400">{t("slogan")}</p>
          <p className="mt-1 text-xs text-gray-500">{t("slogan_ht")}</p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSevT3DsMg7B3fXAX9sqz4xOZYds_Xhk2QzmWOn2yCsgPSs7kA/viewform?pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className={`group mx-auto mt-4 block w-full max-w-sm text-center text-sm font-bold text-mex-orange underline decoration-mex-orange underline-offset-4 transition-colors hover:text-white hover:decoration-white md:mx-0 md:text-left ${linkFocus}`}
          >
            <span className="block">{t("partner")}</span>
            <span className="mt-1 block text-xs font-medium normal-case text-gray-400 group-hover:text-gray-200">
              {t("partnerSub")}
            </span>
          </a>
        </div>

        <div className="flex w-full flex-col items-center gap-2 text-center text-sm text-gray-400 md:w-auto md:items-start md:text-left">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-white">{t("contact")}</h3>

          <address className="not-italic">
            <p className="flex items-start justify-center gap-2 hover:text-white md:justify-start">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
              <span>
                {t("addressLine1")}
                <br />
                {t("addressLine2")}
              </span>
            </p>
          </address>

          <p className="flex justify-center md:block">
            <a
              href="mailto:info@mex509.com"
              className={`inline-flex items-center gap-2 py-1 transition-colors hover:text-mex-orange ${linkFocus}`}
            >
              <Mail className="h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
              info@mex509.com
            </a>
          </p>

          <p className="flex justify-center md:block">
            <a
              href="tel:+50934494494"
              className={`inline-flex items-center gap-2 py-1 transition-colors hover:text-mex-orange ${linkFocus}`}
            >
              <Phone className="h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
              +509 34 49 44 94
            </a>
          </p>

          <p className="flex justify-center md:block">
            <a
              href="https://wa.me/50934536985"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 py-1 transition-colors hover:text-mex-orange ${linkFocus}`}
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-mex-orange" aria-hidden />
              WhatsApp +509 34 53 69 85
            </a>
          </p>

          <div className="mt-3 w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900/30 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-300">{t("servicePointsTitle")}</p>
            <div className="mt-2 space-y-2 text-xs">
              <div>
                <p className="font-bold text-white">{t("stMarcName")}</p>
                <p className="text-gray-400">{t("stMarcAddress")}</p>
              </div>
              <div>
                <p className="font-bold text-white">{t("santiagoName")}</p>
                <p className="text-gray-400">{t("santiagoAddress")}</p>
                <p className="font-bold text-mex-orange">{t("santiagoPhone")}</p>
              </div>
            </div>
          </div>

          <div className="mt-2 w-full max-w-xs border-t border-gray-800 pt-3 md:max-w-none">
            <Link
              href="/conditions-generales"
              className={`block py-1 font-medium text-gray-300 underline decoration-mex-orange underline-offset-4 transition-colors hover:text-mex-orange ${linkFocus}`}
            >
              {t("cgu")}
            </Link>
            <p className="mt-2 text-xs text-gray-600">{t("lastUpdated")}</p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-2 border-t border-gray-800 pt-8 text-center text-sm font-medium text-gray-400 md:w-auto md:border-none md:pt-0 md:text-right">
          <p className="max-w-xs text-pretty md:max-w-none">
            &copy; {new Date().getFullYear()} {t("company")}. {t("rights")}
          </p>
          <p className="text-xs text-gray-500">
            {t("designedBy")}{" "}
            <a
              href="https://royoltechnology.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block py-1 font-bold text-mex-orange transition-colors hover:text-white ${linkFocus}`}
            >
              Royol Technology
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
