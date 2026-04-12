import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";

import AdminUserManager from "@/components/AdminUserManager";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const allClients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-mex-dark flex items-center gap-3 flex-wrap">
            <Users className="text-mex-blue shrink-0" size={32} />
            Client database
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Registered portal users only. Total:{" "}
            <strong className="text-mex-orange text-lg">{allClients.length}</strong>
          </p>
        </div>
      </div>

      <div className="overflow-x-hidden min-w-0">
        <AdminUserManager initialUsers={allClients} />
      </div>
    </div>
  );
}
