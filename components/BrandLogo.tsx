"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Single brand asset: `public/logo.jpg`.
 * Plain `<img>` so it always resolves from `/logo.jpg` without the image optimizer.
 */
export type BrandLogoProps = Omit<ComponentProps<typeof Link>, "href" | "className" | "children"> & {
  href?: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export default function BrandLogo({
  href = "/",
  alt = "MEX509",
  width = 200,
  height = 64,
  className = "",
  priority,
  ...linkRest
}: BrandLogoProps) {
  const img = (
    <img
      src="/logo.jpg"
      alt={alt}
      width={width}
      height={height}
      className={["max-w-full select-none object-contain", className].filter(Boolean).join(" ")}
      decoding={priority ? "sync" : "async"}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );

  return (
    <Link href={href} className="inline-flex shrink-0 items-center no-underline" {...linkRest}>
      {img}
    </Link>
  );
}
