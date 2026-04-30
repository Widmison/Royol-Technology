import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ShippingCalculatorProvider } from "@/components/ShippingCalculatorProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteUrlString } from "@/lib/site";
import { sharePreviewOgImage } from "@/lib/share-image";

// Load the custom Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: '--font-montserrat',
  display: 'swap',
});

const siteUrl = getSiteUrlString();
const defaultTitle = "MEX509 | Voye Li Vit, Resevwa Li Vit!";
const defaultDescription =
  "MEX509: fast, secure shipping from the USA, Dominican Republic, and China to Haiti. Air freight, ocean freight, ground freight, tracking, and Doral FL drop-off.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | MEX509",
  },
  description: defaultDescription,
  applicationName: "MEX509",
  keywords: [
    "MEX509",
    "shipping to Haiti",
    "freight Haiti",
    "air freight Haiti",
    "ocean freight Haiti",
    "cargo Doral",
    "logistics USA Haiti",
    "package tracking Haiti",
    "Dominican Republic to Haiti shipping",
    "China to Haiti shipping",
    "Doral FL shipping",
  ],
  authors: [{ name: "MEX509 Shipping Services", url: siteUrl }],
  creator: "MEX509 Shipping Services",
  publisher: "MEX509 Shipping Services",
  formatDetection: { telephone: true, email: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR", "ht_HT"],
    url: "/",
    siteName: "MEX509",
    title: defaultTitle,
    description: defaultDescription,
    images: [sharePreviewOgImage],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
    images: [sharePreviewOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  /** Favicon + Apple touch icon: `app/icon.jpg` + `app/apple-icon.jpg` (Next.js metadata file conventions). */
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={montserrat.variable}>
      <body className="font-sans antialiased text-mex-dark bg-white">
        <NextIntlClientProvider messages={messages}>
          <ShippingCalculatorProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ShippingCalculatorProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}