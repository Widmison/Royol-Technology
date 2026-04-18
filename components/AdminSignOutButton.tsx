"use client";

import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
  onBeforeNavigate?: () => void;
};

export default function AdminSignOutButton({
  className,
  children,
  "aria-label": ariaLabel,
  onBeforeNavigate,
}: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={async () => {
        if (!window.confirm("Sign out of the admin dashboard?")) return;
        await fetch("/api/auth", { method: "DELETE", credentials: "include" });
        onBeforeNavigate?.();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
