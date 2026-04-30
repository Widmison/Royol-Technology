"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** No user activity for this long → show “still there?” prompt (admin: min 5 min per ops policy) */
const IDLE_MS_CLIENT = 30 * 60 * 1000;
const IDLE_MS_ADMIN = 5 * 60 * 1000;
/** After prompt opens, auto sign out if user does not confirm within this window */
const PROMPT_GRACE_MS = 60 * 1000;

const ACTIVITY_THROTTLE_MS = 2000;

export type PortalIdleGuardVariant = "admin" | "client";

function isExcludedPath(variant: PortalIdleGuardVariant, pathname: string) {
  if (variant === "admin") {
    return (
      pathname === "/admin/login" ||
      pathname === "/admin/access-denied" ||
      pathname.startsWith("/admin/print")
    );
  }
  return !pathname.startsWith("/dashboard");
}

/**
 * Admin: idle prompt after 5 minutes. Client portal: 30 minutes. “Stay signed in” resets the timer;
 * no response within the grace period signs the user out.
 */
export default function PortalIdleGuard({ variant }: { variant: PortalIdleGuardVariant }) {
  const idleMs = variant === "admin" ? IDLE_MS_ADMIN : IDLE_MS_CLIENT;
  const pathname = usePathname();
  const [promptOpen, setPromptOpen] = useState(false);
  const lastActivityRef = useRef(0);
  const promptOpenRef = useRef(false);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastThrottleRef = useRef(0);

  const clearGraceTimer = useCallback(() => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  }, []);

  const performLogout = useCallback(async () => {
    clearGraceTimer();
    setPromptOpen(false);
    promptOpenRef.current = false;
    if (variant === "admin") {
      try {
        await fetch("/api/admin/signout", { method: "POST", credentials: "include" });
      } catch {
        /* still redirect */
      }
      window.location.href = "/admin/login";
    } else {
      try {
        await fetch("/api/auth", { method: "DELETE", credentials: "include" });
      } catch {
        /* still redirect */
      }
      window.location.href = "/login";
    }
  }, [clearGraceTimer, variant]);

  const staySignedIn = useCallback(() => {
    clearGraceTimer();
    setPromptOpen(false);
    promptOpenRef.current = false;
    lastActivityRef.current = Date.now();
  }, [clearGraceTimer]);

  useEffect(() => {
    promptOpenRef.current = promptOpen;
  }, [promptOpen]);

  useEffect(() => {
    if (!pathname || isExcludedPath(variant, pathname)) return;

    lastActivityRef.current = Date.now();

    const bump = () => {
      const now = Date.now();
      if (now - lastThrottleRef.current < ACTIVITY_THROTTLE_MS) return;
      lastThrottleRef.current = now;
      if (!promptOpenRef.current) {
        lastActivityRef.current = now;
      }
    };

    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", bump, opts);
    window.addEventListener("keydown", bump);
    window.addEventListener("scroll", bump, opts);

    idleCheckRef.current = setInterval(() => {
      if (promptOpenRef.current) return;
      if (Date.now() - lastActivityRef.current >= idleMs) {
        setPromptOpen(true);
        promptOpenRef.current = true;
        graceTimerRef.current = setTimeout(() => {
          if (promptOpenRef.current) {
            void performLogout();
          }
        }, PROMPT_GRACE_MS);
      }
    }, 15_000);

    return () => {
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("scroll", bump);
      if (idleCheckRef.current) clearInterval(idleCheckRef.current);
      clearGraceTimer();
    };
  }, [pathname, variant, idleMs, performLogout, clearGraceTimer]);

  if (!pathname || isExcludedPath(variant, pathname) || !promptOpen) return null;

  const scopeLabel = variant === "admin" ? "admin session" : "portal session";

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-guard-title"
      aria-describedby="idle-guard-desc"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h2 id="idle-guard-title" className="text-lg font-black text-mex-dark">
          Still there?
        </h2>
        <p id="idle-guard-desc" className="mt-2 text-sm font-medium text-gray-600">
          {variant === "admin"
            ? "You have been inactive for about 5 minutes on your admin session. Stay signed in to continue, or you will be signed out automatically in about a minute for security."
            : `You have been inactive for about 30 minutes on your ${scopeLabel}. Stay signed in to continue, or you will be signed out automatically in about a minute for security.`}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => void performLogout()}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Sign out now
          </button>
          <button
            type="button"
            onClick={staySignedIn}
            className="rounded-xl bg-mex-blue px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-900"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
