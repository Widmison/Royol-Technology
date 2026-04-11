import type { Prisma } from "@prisma/client";

type PackageDelegate = Pick<Prisma.TransactionClient, "package">;

export async function allocateMexTrackingId(db: PackageDelegate): Promise<string> {
  for (let i = 0; i < 24; i++) {
    const trackingId = "MEX" + Math.floor(100000000 + Math.random() * 900000000);
    const taken = await db.package.findUnique({
      where: { trackingId },
      select: { id: true },
    });
    if (!taken) return trackingId;
  }
  throw new Error("Could not allocate a unique MEX tracking ID");
}
