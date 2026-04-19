"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, Loader2, X } from "lucide-react";

type Row = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

type Variant = "client" | "admin";

const GAP = 10;
const VIEW_MARGIN = 12;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function PortalNotificationBell({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Row[]>([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const [panelStyle, setPanelStyle] = useState<CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    width: 320,
    maxHeight: "min(70vh, 420px)",
    zIndex: 550,
  });

  const endpoint = variant === "client" ? "/api/notifications" : "/api/admin/notifications";

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok) return;
      setItems(data.notifications ?? []);
      if (variant === "client") setUnread(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [endpoint, variant]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void fetchList();
    const t = setInterval(() => void fetchList(), 25000);
    return () => clearInterval(t);
  }, [fetchList]);

  const updatePanelPosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn || !open) return;

    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const safeBottom = typeof window !== "undefined" ? parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0", 10) || 0 : 0;

    const maxPanelW = Math.min(360, vw - VIEW_MARGIN * 2);
    const panelW = maxPanelW;

    let left = rect.right - panelW;
    left = clamp(left, VIEW_MARGIN, vw - panelW - VIEW_MARGIN);

    const panelEl = panelRef.current;
    const measuredH = panelEl?.offsetHeight ?? Math.min(420, vh * 0.72);
    const panelH = Math.min(measuredH, vh - VIEW_MARGIN * 2 - safeBottom);

    let top = rect.bottom + GAP;
    const roomBelow = vh - rect.bottom - GAP - VIEW_MARGIN - safeBottom;
    const roomAbove = rect.top - GAP - VIEW_MARGIN;

    if (roomBelow < Math.min(panelH, 120) && roomAbove > roomBelow) {
      top = rect.top - panelH - GAP;
    }

    top = clamp(top, VIEW_MARGIN, vh - panelH - VIEW_MARGIN - safeBottom);

    setPanelStyle({
      position: "fixed",
      top,
      left,
      width: panelW,
      maxHeight: `min(72vh, calc(100vh - ${VIEW_MARGIN * 2}px))`,
      zIndex: 550,
    });
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !mounted) return;
    updatePanelPosition();
    const ro =
      typeof ResizeObserver !== "undefined" && panelRef.current
        ? new ResizeObserver(() => updatePanelPosition())
        : null;
    if (panelRef.current && ro) ro.observe(panelRef.current);

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    const id = requestAnimationFrame(() => updatePanelPosition());
    const id2 = requestAnimationFrame(() => updatePanelPosition());

    return () => {
      cancelAnimationFrame(id);
      cancelAnimationFrame(id2);
      ro?.disconnect();
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [mounted, open, items.length, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function markRead(ids: string[]) {
    if (variant !== "client" || ids.length === 0) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setUnread((u) => Math.max(0, u - ids.length));
    void fetchList();
  }

  async function markAllRead() {
    if (variant !== "client") return;
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnread(0);
    void fetchList();
  }

  const dropdown =
    open &&
    mounted &&
    createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        style={panelStyle}
        className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2.5 pl-4">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">Alerts</span>
          <div className="flex shrink-0 items-center gap-1">
            {variant === "client" && unread > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-mex-blue hover:bg-white hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-200/80 hover:text-mex-dark"
              aria-label="Close notifications"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm font-medium leading-relaxed text-gray-500">
              No notifications yet.
            </p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="border-b border-gray-100 px-4 py-3 text-left last:border-0">
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => {
                      if (!n.readAt && variant === "client") void markRead([n.id]);
                      setOpen(false);
                    }}
                    className="block rounded-lg px-1 py-0.5 hover:bg-gray-50"
                  >
                    <NotificationBody n={n} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-lg px-1 py-0.5 text-left hover:bg-gray-50"
                    onClick={() => {
                      if (!n.readAt && variant === "client") void markRead([n.id]);
                    }}
                  >
                    <NotificationBody n={n} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        {variant === "admin" && (
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-4 py-3 text-center">
            <Link
              href="/admin/external-tracking"
              className="text-xs font-bold text-mex-blue hover:underline"
              onClick={() => setOpen(false)}
            >
              External tracking inbox →
            </Link>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          void fetchList();
        }}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
        aria-label="Notifications"
        aria-expanded={open}
      >
        {loading && open ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <Bell size={20} />}
        {variant === "client" && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {dropdown}
    </div>
  );
}

function NotificationBody({ n }: { n: Row }) {
  return (
    <>
      <p className="text-sm font-black text-mex-dark">{n.title}</p>
      <p className="mt-0.5 text-xs font-medium leading-snug text-gray-600">{n.body}</p>
      <p className="mt-1 text-[10px] font-bold text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
    </>
  );
}
