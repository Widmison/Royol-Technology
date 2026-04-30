"use client";

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
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={async () => {
        if (!window.confirm("Sign out of the admin dashboard?")) return;
        try {
          await fetch("/api/admin/signout", { method: "POST", credentials: "include" });
        } catch {
          /* continue */
        }
        onBeforeNavigate?.();
        /** Clears NextAuth session (Google sign-in) and returns to login. */
        window.location.href = `/api/auth/signout?callbackUrl=${encodeURIComponent("/admin/login")}`;
      }}
    >
      {children}
    </button>
  );
}
