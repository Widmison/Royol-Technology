"use client";

import Link from "next/link";
import { FileText, Tag } from "lucide-react";
import { adminPrintInvoicePath, adminPrintLabelPath } from "@/lib/adminPrintUrls";

type Props = {
  requestId: string;
  /** `row` = horizontal in table cells; `stack` = vertical */
  layout?: "row" | "stack";
  className?: string;
};

const linkClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-mex-dark shadow-sm transition hover:border-mex-blue hover:bg-blue-50/80";

/**
 * Opens branded print layouts in a new tab. Users choose **Print → Save as PDF** to download a file.
 */
export default function AdminPrintDocumentLinks({ requestId, layout = "row", className = "" }: Props) {
  const wrap =
    layout === "row"
      ? "flex flex-wrap items-center justify-end gap-1.5"
      : "flex flex-col items-stretch gap-1.5";

  return (
    <div className={`${wrap} ${className}`.trim()}>
      <Link
        href={adminPrintInvoicePath(requestId)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="Commercial invoice — print or Save as PDF"
      >
        <FileText className="h-3.5 w-3.5 shrink-0 text-mex-orange" aria-hidden />
        Invoice
      </Link>
      <Link
        href={adminPrintLabelPath(requestId)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="Warehouse label (4×6 style) — print or Save as PDF"
      >
        <Tag className="h-3.5 w-3.5 shrink-0 text-mex-blue" aria-hidden />
        Label
      </Link>
    </div>
  );
}
