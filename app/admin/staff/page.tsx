import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSessionUser } from "@/lib/serverSession";
import { isSuperAdminUser } from "@/lib/staffAccess";
import { adminStaffRoleLabel } from "@/lib/adminStaffRoleDisplay";
import { STAFF_ALLOWLIST_OWNER_EMAIL } from "@/lib/webDevAccess";

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
            Users with admin access (email sign-in). To add or remove who may sign in, use{" "}
            <span className="font-bold text-mex-dark">Admin → Settings → Staff allowlist</span> — only the owner (
            {STAFF_ALLOWLIST_OWNER_EMAIL}) and Web Dev can edit that list.
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
        {staff.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm font-medium text-gray-500">No admin users found.</p>
        ) : (
          <>
            <div className="lg:hidden divide-y divide-gray-100">
              {staff.map((row) => (
                <div key={row.id} className="space-y-2 p-4 font-medium text-mex-dark sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-black">
                      {[row.firstName, row.lastName].filter(Boolean).join(" ") || "—"}
                    </p>
                    {row.adminProfileComplete ? (
                      <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                        Complete
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="break-all text-sm text-gray-700">{row.email}</p>
                  <p className="text-sm text-gray-700">{adminStaffRoleLabel(row.adminStaffRole, row.email)}</p>
                  <p className="text-xs text-gray-500">
                    {row.createdAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden lg:block overflow-x-auto overscroll-x-contain">
              <table className="min-w-[640px] w-full divide-y divide-gray-100 text-left text-sm">
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
                      <td className="px-4 py-3 text-gray-700">{adminStaffRoleLabel(row.adminStaffRole, row.email)}</td>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
