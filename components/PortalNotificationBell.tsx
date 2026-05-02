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
type FilterMode = "all" | "new" | "read";

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
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [toast, setToast] = useState<{ title: string; count: number } | null>(null);
  const prevUnreadRef = useRef(0);
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
      const nextItems = (data.notifications ?? []) as Row[];
      const nextUnread = Number(data.unreadCount ?? 0);
      const prevUnread = prevUnreadRef.current;

      setItems(nextItems);
      setUnread(nextUnread);

      if (mounted && !open && nextUnread > prevUnread) {
        const newestUnread = nextItems.find((n) => !n.readAt);
        setToast({
          title: newestUnread?.title ?? "New notification",
          count: nextUnread - prevUnread,
        });
      }
      prevUnreadRef.current = nextUnread;
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [endpoint, mounted, open]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void fetchList();
    const t = setInterval(() => void fetchList(), 25000);
    return () => clearInterval(t);
  }, [fetchList]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

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
    if (ids.length === 0) return;
    await fetch(endpoint, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setUnread((u) => Math.max(0, u - ids.length));
    void fetchList();
  }

  async function markUnread(ids: string[]) {
    if (ids.length === 0) return;
    await fetch(endpoint, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, markUnread: true }),
    });
    setUnread((u) => u + ids.length);
    void fetchList();
  }

  async function markAllRead() {
    await fetch(endpoint, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnread(0);
    void fetchList();
  }

  const readCount = Math.max(0, items.length - unread);
  const filteredItems =
    filterMode === "new" ? items.filter((n) => !n.readAt) : filterMode === "read" ? items.filter((n) => Boolean(n.readAt)) : items;

  const groupedItems = filteredItems.reduce(
    (acc, n) => {
      const created = new Date(n.createdAt);
      const now = new Date();
      const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startCreated = new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime();
      const diffDays = Math.floor((startNow - startCreated) / 86400000);

      if (diffDays === 0) acc.today.push(n);
      else if (diffDays === 1) acc.yesterday.push(n);
      else acc.earlier.push(n);
      return acc;
    },
    { today: [] as Row[], yesterday: [] as Row[], earlier: [] as Row[] }
  );

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
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            Alerts · {unread} new / {readCount} read
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {unread > 0 && (
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
        <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-3 py-2">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              filterMode === "all" ? "bg-mex-blue text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("new")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              filterMode === "new" ? "bg-mex-orange text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            New ({unread})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("read")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              filterMode === "read" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Read ({readCount})
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {filteredItems.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm font-medium leading-relaxed text-gray-500">
              {filterMode === "all"
                ? "No notifications yet."
                : filterMode === "new"
                  ? "No new notifications."
                  : "No read notifications yet."}
            </p>
          ) : (
            <>
              <NotificationGroup
                label="Today"
                rows={groupedItems.today}
                onOpen={() => setOpen(false)}
                onMarkRead={(id) => void markRead([id])}
                onMarkUnread={(id) => void markUnread([id])}
              />
              <NotificationGroup
                label="Yesterday"
                rows={groupedItems.yesterday}
                onOpen={() => setOpen(false)}
                onMarkRead={(id) => void markRead([id])}
                onMarkUnread={(id) => void markUnread([id])}
              />
              <NotificationGroup
                label="Earlier"
                rows={groupedItems.earlier}
                onOpen={() => setOpen(false)}
                onMarkRead={(id) => void markRead([id])}
                onMarkUnread={(id) => void markUnread([id])}
              />
            </>
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
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {dropdown}
      {mounted && toast && !open
        ? createPortal(
            <div className="fixed bottom-5 right-5 z-[560] max-w-[300px] rounded-2xl border border-mex-orange/30 bg-white p-3 shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-mex-orange">
                {toast.count > 1 ? `${toast.count} new alerts` : "New alert"}
              </p>
              <p className="mt-1 text-sm font-bold text-mex-dark">{toast.title}</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(true);
                  setToast(null);
                  void fetchList();
                }}
                className="mt-2 text-xs font-bold text-mex-blue hover:underline"
              >
                Open notifications
              </button>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function NotificationGroup({
  label,
  rows,
  onOpen,
  onMarkRead,
  onMarkUnread,
}: {
  label: string;
  rows: Row[];
  onOpen: () => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="border-b border-gray-100 last:border-0">
      <p className="sticky top-0 z-[1] bg-white/95 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </p>
      {rows.map((n) => (
        <div key={n.id} className={`border-t border-gray-100 px-4 py-3 text-left ${!n.readAt ? "bg-orange-50/30" : ""}`}>
          {n.link ? (
            <Link
              href={n.link}
              onClick={() => {
                if (!n.readAt) onMarkRead(n.id);
                onOpen();
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
                if (!n.readAt) onMarkRead(n.id);
              }}
            >
              <NotificationBody n={n} />
            </button>
          )}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => (n.readAt ? onMarkUnread(n.id) : onMarkRead(n.id))}
              className="text-[11px] font-bold text-gray-500 hover:text-mex-blue hover:underline"
            >
              {n.readAt ? "Mark unread" : "Mark read"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationBody({ n }: { n: Row }) {
  return (
    <>
      <p className="text-sm font-black text-mex-dark">
        {n.title} {!n.readAt ? <span className="ml-1 text-[10px] uppercase tracking-wider text-mex-orange">NEW</span> : null}
      </p>
      <p className="mt-0.5 text-xs font-medium leading-snug text-gray-600">{n.body}</p>
      <p className="mt-1 text-[10px] font-bold text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
    </>
  );
}
