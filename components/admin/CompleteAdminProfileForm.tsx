"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminStaffRole } from "@prisma/client";
import { adminStaffRoleLabel } from "@/lib/adminStaffRoleDisplay";
import { SIGNUP_PASSWORD_RULES_TEXT } from "@/lib/passwordPolicy";

export type CompleteProfileInitial = {
  email: string;
  staffRole: AdminStaffRole | null;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

export default function CompleteAdminProfileForm({ initial }: { initial: CompleteProfileInitial }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [city, setCity] = useState(initial.city);
  const [state, setState] = useState(initial.state);
  const [zipCode, setZipCode] = useState(initial.zipCode);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address,
          city,
          state,
          zipCode,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save.");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-black tracking-tight text-mex-dark">Finish staff registration</h1>
      <p className="mt-2 text-sm font-medium text-gray-600">
        Confirm your details and choose a permanent password. After this, only your personal password works for admin
        sign-in (the shared bootstrap was one-time for first setup).
      </p>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="mb-6 rounded-xl bg-mex-blue/5 px-4 py-3 text-sm">
          <div className="font-bold text-mex-dark">{initial.email}</div>
          <div className="mt-1 text-gray-600">
            Role: <span className="font-semibold text-mex-blue">{adminStaffRoleLabel(initial.staffRole)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-gray-700">
              First name
              <input
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label className="block text-sm font-bold text-gray-700">
              Last name
              <input
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="block text-sm font-bold text-gray-700">
            Phone
            <input
              required
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>

          <label className="block text-sm font-bold text-gray-700">
            Street address
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-bold text-gray-700 sm:col-span-1">
              City
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
              />
            </label>
            <label className="block text-sm font-bold text-gray-700">
              State
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                value={state}
                onChange={(e) => setState(e.target.value)}
                autoComplete="address-level1"
              />
            </label>
            <label className="block text-sm font-bold text-gray-700">
              ZIP
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                autoComplete="postal-code"
              />
            </label>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-bold text-gray-700">
              Permanent password *
              <input
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Choose your admin password"
              />
              <p className="mt-1 text-xs font-medium text-gray-500">{SIGNUP_PASSWORD_RULES_TEXT}</p>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-900 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Finish registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
