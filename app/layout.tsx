import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

// Load the custom Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: '--font-montserrat',
  display: 'swap',
});

// Define the SEO metadata and Favicon (Browser Tab Icon)
export const metadata: Metadata = {
  title: "Mex509 | VOYE LI VIT, RESEVWA LI VIT!",
  description: "Mex509: Fast, secure, and headache-free delivery logistics. Shipping from USA, DR, and China to Haiti.",
  icons: {
    icon: "/Logo.JPG",   // <-- Your standard browser tab icon
    apple: "/Logo.JPG",  // <-- Your icon for iOS Home Screen saves
  },
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