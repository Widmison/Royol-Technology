"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminStaffRole } from "@prisma/client";
import { Loader2, Shield, Sparkles, Trash2, UserPlus, Users } from "lucide-react";
import { adminStaffRoleLabel } from "@/lib/adminStaffRoleDisplay";

type Entry = {
  id: string;
  email: string;
  staffRole: AdminStaffRole;
  roleLabel: string;
  createdAt: string;
};

export default function AdminStaffAllowlistPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [staffRole, setStaffRole] = useState<AdminStaffRole>(AdminStaffRole.ADMIN_TEAM);
  const [roleLabel, setRoleLabel] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/staff-allowlist", { credentials: "include" });
      const data = (await res.json()) as { entries?: Entry[]; error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load allowlist.");
        return;
      }
      setEntries(data.entries ?? []);
    } catch {
      setError("Network error loading allowlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/staff-allowlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          staffRole,
          roleLabel,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not add.");
        return;
      }
      setEmail("");
      setRoleLabel("");
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Remove this email from the admin allowlist? They will no longer be able to sign in until re-added.")) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/staff-allowlist?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not remove.");
        return;
      }
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-mex-blue/20 bg-gradient-to-br from-white via-blue-50/40 to-white p-5 shadow-lg shadow-blue-900/5 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mex-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-mex-orange/10 blur-3xl" />

      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mex-blue text-white shadow-lg shadow-blue-900/30">
            <Shield size={24} aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-mex-dark sm:text-2xl">Staff allowlist</h2>
            <p className="mt-1 max-w-xl text-sm font-medium text-gray-600">
              Only emails listed here may sign into the admin portal (password flow or Google).{" "}
              <span className="font-bold text-mex-dark">Web Dev</span> manages this list;{" "}
              <span className="font-bold text-gray-700">Admin team</span> accounts use the portal but don&apos;t edit this
              section.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-mex-blue/30 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-mex-blue shadow-sm">
          <Sparkles size={12} aria-hidden /> Web Dev only
        </span>
      </div>

      {error && (
        <div className="relative mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="relative mt-8 grid gap-4 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-inner sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
        <label className="block text-sm font-bold text-gray-700">
          Work email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/25 focus:ring-2"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm font-bold text-gray-700">
          Access tier
          <select
            value={staffRole}
            onChange={(e) => setStaffRole(e.target.value as AdminStaffRole)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-bold text-mex-dark outline-none ring-mex-blue/25 focus:ring-2"
          >
            <option value={AdminStaffRole.WEB_DEV}>{adminStaffRoleLabel(AdminStaffRole.WEB_DEV)}</option>
            <option value={AdminStaffRole.ADMIN_TEAM}>{adminStaffRoleLabel(AdminStaffRole.ADMIN_TEAM)}</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-gray-700 sm:col-span-1">
          Label <span className="font-medium text-gray-400">(optional)</span>
          <input
            type="text"
            value={roleLabel}
            onChange={(e) => setRoleLabel(e.target.value)}
            placeholder="e.g. Warehouse lead"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/25 focus:ring-2"
            maxLength={120}
          />
        </label>
        <button
          type="submit"
          disabled={saving || !email.trim()}
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-mex-dark px-5 text-sm font-black text-white shadow-md transition hover:bg-black disabled:opacity-50 sm:mb-0"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} aria-hidden />}
          Add
        </button>
      </form>

      <div className="relative mt-8 rounded-2xl border border-gray-100 bg-white/95">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
          <Users size={14} aria-hidden />
          Allowed identities ({entries.length})
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="animate-spin text-mex-blue" size={32} aria-hidden />
          </div>
        ) : entries.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm font-medium text-gray-500">No entries (unexpected — check database).</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {entries.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-all font-black text-mex-dark">{row.email}</p>
                  {row.roleLabel ? (
                    <p className="mt-0.5 text-xs font-medium text-gray-500">{row.roleLabel}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      row.staffRole === AdminStaffRole.WEB_DEV
                        ? "bg-purple-100 text-purple-800 ring-1 ring-purple-200"
                        : "bg-blue-100 text-mex-blue ring-1 ring-blue-200"
                    }`}
                  >
                    {adminStaffRoleLabel(row.staffRole)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleRemove(row.id)}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={14} aria-hidden />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
