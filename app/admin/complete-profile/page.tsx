import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isPortalStaffRole } from "@/lib/staffAccess";
import CompleteAdminProfileForm from "@/components/admin/CompleteAdminProfileForm";

export default async function AdminCompleteProfilePage() {
  const user = await getAdminSessionUser();
  if (!user || !isPortalStaffRole(user.role)) {
    redirect("/admin/login");
  }
  if (user.adminProfileComplete) {
    redirect("/admin/dashboard");
  }

  return (
    <CompleteAdminProfileForm
      initial={{
        email: user.email,
        staffRole: user.adminStaffRole,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
        zipCode: user.zipCode ?? "",
      }}
    />
  );
}
