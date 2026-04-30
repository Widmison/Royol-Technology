import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminDashboardHost } from "@/lib/adminDashboardHost";

/** Same destination as middleware uses on the admin portal host (`/login` → `/admin/login`). */
export async function redirectToAdminLogin(): Promise<never> {
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  redirect(isAdminDashboardHost(host) ? "/login" : "/admin/login");
}
