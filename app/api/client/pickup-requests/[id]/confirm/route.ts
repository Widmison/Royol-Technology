import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const clientOrRes = await requireClientApiUser();
  if (clientOrRes instanceof NextResponse) return clientOrRes;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing pickup request id." }, { status: 400 });
  }

  const pickupRequest = (
    prisma as unknown as {
      pickupRequest: {
        findUnique: (args: unknown) => Promise<{ id: string; clientId: string | null; status: string } | null>;
        update: (args: unknown) => Promise<unknown>;
      };
    }
  ).pickupRequest;
  const row = await pickupRequest.findUnique({
    where: { id },
    select: { id: true, clientId: true, status: true },
  });
  if (!row || row.clientId !== clientOrRes.id) {
    return NextResponse.json({ error: "Pickup request not found." }, { status: 404 });
  }

  if (row.status !== "PRICE_SENT") {
    return NextResponse.json({ error: "Pickup can only be confirmed after price is sent." }, { status: 409 });
  }

  const updated = await pickupRequest.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  return NextResponse.json({ request: updated });
}
