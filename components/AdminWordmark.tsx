"use client";

import Link from "next/link";

/** Blue / orange typographic mark — admin chrome only (public UI uses `logo.jpg` via `BrandLogo`). */
export default function AdminWordmark({
  href = "/admin/dashboard",
  onClick,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex select-none items-baseline no-underline ${className}`}
      aria-label="MEX509 admin home"
    >
      <span className="text-2xl font-black italic tracking-tighter text-mex-blue sm:text-3xl">MEX</span>
      <span className="text-xs font-black italic leading-none text-mex-orange sm:text-sm">509</span>
    </Link>
  );
}
