import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country")?.toUpperCase() || null;
  return NextResponse.json({ country });
}
