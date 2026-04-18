"use client";

import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
  /** e.g. close mobile drawer before navigation */
  onBeforeNavigate?: () => void;
};

export default function ClientSignOutButton({
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
        if (!window.confirm("Sign out of your account?")) return;
        await fetch("/api/auth", { method: "DELETE", credentials: "include" });
        onBeforeNavigate?.();
        router.push("/login");
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
