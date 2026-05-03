import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isPortalStaffRole } from "@/lib/staffAccess";
import CompleteAdminProfileForm from "@/components/admin/CompleteAdminProfileForm";
import LanguageSelector from "@/components/LanguageSelector";

export default async function AdminCompleteProfilePage() {
  const user = await getAdminSessionUser();
  if (!user || !isPortalStaffRole(user.role)) {
    redirect("/admin/login");
  }
  if (user.adminProfileComplete) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 z-10 sm:right-4 sm:top-0">
        <LanguageSelector compact />
      </div>
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
    </div>
  );
}
