"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { LogOut, X } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Close modal on Escape without signing out */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  const finalizeSignOut = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/admin/signout", { method: "POST", credentials: "include" });
    } catch {
      /* Continue — clear NextAuth & redirect anyway */
    }
    onBeforeNavigate?.();
    /** POST sign-out (no NextAuth interim HTML page) */
    await signOut({
      redirect: true,
      callbackUrl: "/admin/login",
    });
    setBusy(false);
  }, [onBeforeNavigate]);

  /** Focus modal when opened */
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  const modal =
    mounted && open
      ? createPortal(
          <div
            className="fixed inset-0 z-[500] isolate flex items-center justify-center px-4 py-8 sm:py-12"
            role="presentation"
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close dialog"
              disabled={busy}
              className="absolute inset-0 bg-mex-dark/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
              onClick={() => {
                if (!busy) setOpen(false);
              }}
            />

            {/* Panel */}
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={busy}
                className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 outline-none ring-mex-blue/40 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 disabled:pointer-events-none"
                aria-label="Cancel"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              <div className="border-b border-gray-100 bg-gradient-to-br from-slate-50 to-white px-6 pb-6 pt-8 sm:px-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <LogOut className="h-6 w-6" aria-hidden />
                </div>
                <h2
                  id={titleId}
                  className="mt-5 font-black tracking-tight text-mex-dark sm:text-xl"
                >
                  Sign out of admin?
                </h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
                  You’ll leave the dashboard and open the login screen. Unsaved changes on this tab are
                  unchanged — finish what you’re doing before continuing.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 bg-gray-50/80 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-black text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:min-w-[7rem]"
                >
                  Stay signed in
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void finalizeSignOut()}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-black text-white shadow-lg shadow-red-600/25 transition-colors hover:bg-red-700 disabled:opacity-70 sm:w-auto sm:min-w-[7rem]"
                >
                  {busy ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={() => setOpen(true)}>
        {children}
      </button>
      {modal}
    </>
  );
}
