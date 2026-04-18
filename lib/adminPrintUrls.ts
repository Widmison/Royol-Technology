/**
 * Admin printable documents (HTML views). Data is always loaded fresh from the DB —
 * best practice without blob storage: one source of truth, reproducible print/PDF.
 */
export function adminPrintInvoicePath(requestId: string) {
  return `/admin/print/invoice/${requestId}`;
}

export function adminPrintLabelPath(requestId: string) {
  return `/admin/print/label/${requestId}`;
}
