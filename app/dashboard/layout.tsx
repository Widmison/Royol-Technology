import { redirect } from "next/navigation";
import { getClientSessionUser } from "@/lib/serverSession";

export const dynamic = "force-dynamic";

/** Blocks all `/dashboard` routes unless a valid client session exists (defense in depth with middleware). */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getClientSessionUser();
  if (!session) {
    redirect("/login");
  }
  return <>{children}</>;
}
