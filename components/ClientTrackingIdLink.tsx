"use client";

import Link from "next/link";

type Props = {
  trackingId: string | null | undefined;
  /** Extra classes on the interactive link (e.g. table cell typography) */
  className?: string;
};

/**
 * Client portal: opens Live tracking with the timeline modal via `?open=MEX…`.
 */
export default function ClientTrackingIdLink({ trackingId, className = "" }: Props) {
  const raw = typeof trackingId === "string" ? trackingId.trim() : "";
  if (!raw) {
    return <span className={className}>Pending</span>;
  }

  return (
    <Link
      href={`/dashboard?tab=tracking&open=${encodeURIComponent(raw)}`}
      prefetch={false}
      className={`font-black text-mex-blue tracking-wider underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-mex-orange focus-visible:ring-offset-2 rounded-sm ${className}`}
    >
      {raw}
    </Link>
  );
}
