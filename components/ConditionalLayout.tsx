import { headers } from "next/headers";
import ConditionalLayoutClient from "@/components/ConditionalLayoutClient";
import { isAdminDashboardHost } from "@/lib/adminDashboardHost";

export default async function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  return (
    <ConditionalLayoutClient isAdminPortalHost={isAdminDashboardHost(host)}>
      {children}
    </ConditionalLayoutClient>
  );
}
