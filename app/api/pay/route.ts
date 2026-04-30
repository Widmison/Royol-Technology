import { NextResponse } from "next/server";

/**
 * Client payment pages no longer self-confirm payments (QR + instructions only).
 * Staff records payment in Admin → Invoices via POST /api/admin/invoices/[id]/mark-paid.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Self-service payment confirmation is disabled. MEX509 staff records payment after verifying MonCash, NatCash, or cash. Use Admin → Invoices → Record paid.",
    },
    { status: 403 }
  );
}
