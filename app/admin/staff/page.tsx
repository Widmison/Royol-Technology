import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isSuperAdminUser } from "@/lib/staffAccess";
import { adminStaffRoleLabel } from "@/lib/adminStaffRoleDisplay";

export default async function AdminStaffPage() {
  const admin = await getAdminSessionUser();
  if (!admin || !isSuperAdminUser(admin)) {
    redirect("/admin/dashboard");
  }
  if (!admin.adminProfileComplete) {
    redirect("/admin/complete-profile");
  }

  const staff = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      adminStaffRole: true,
      adminProfileComplete: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-mex-dark">Staff accounts</h1>
          <p className="mt-1 text-sm font-medium text-gray-600">
            Users with admin access (email sign-in). Invite changes are made in code / env — contact Web
            Dev to add emails.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
        >
          Settings
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staff.map((row) => (
              <tr key={row.id} className="font-medium text-mex-dark">
                <td className="px-4 py-3">
                  {[row.firstName, row.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">{row.email}</td>
                <td className="px-4 py-3 text-gray-700">{adminStaffRoleLabel(row.adminStaffRole)}</td>
                <td className="px-4 py-3">
                  {row.adminProfileComplete ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                      Complete
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {row.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <p className="px-4 py-8 text-center text-sm font-medium text-gray-500">No admin users found.</p>
        )}
      </div>
    </div>
  );
}
