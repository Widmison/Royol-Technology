import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { getSiteUrlString } from "@/lib/site";

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
    images: [
      {
        url: "/hero-v2.jpg",
        width: 1200,
        height: 630,
        alt: "MEX509 delivery and logistics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/hero-v2.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased text-mex-dark bg-white">
        
        {/* We wrap the whole app in our Smart Layout to handle Admin vs Public views */}
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        
      </body>
    </html>
  );
}