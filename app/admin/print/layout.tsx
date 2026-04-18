import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Print",
  robots: { index: false, follow: false },
};

export default function AdminPrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
