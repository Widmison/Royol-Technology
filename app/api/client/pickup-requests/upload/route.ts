import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireClientApiUser } from "@/lib/requireApiSession";

export async function POST(req: Request) {
  const clientOrRes = await requireClientApiUser();
  if (clientOrRes instanceof NextResponse) return clientOrRes;

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      { error: "File upload is not configured yet. Set BLOB_READ_WRITE_TOKEN." },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large. Max 8MB." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `pickup-requests/${clientOrRes.id}/${Date.now()}-${safeName}`;
  const uploaded = await put(path, file, { access: "public", token });

  return NextResponse.json({ url: uploaded.url });
}
