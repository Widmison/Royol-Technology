"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";
import QRCode from "react-qr-code";

export default function AdminTwoFactorPanel() {
  const [enabled, setEnabled] = useState(false);
  const [hasSecret, setHasSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/totp", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        twoFactorEnabled?: boolean;
        hasSecret?: boolean;
        otpauthUrl?: string | null;
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 403) {
          setErr("Only full admins can manage two-factor authentication. Staff members use email and password only.");
        } else {
          setErr(typeof data.error === "string" ? data.error : "Could not load 2FA status.");
        }
        return;
      }
      setEnabled(!!data.twoFactorEnabled);
      setHasSecret(!!data.hasSecret);
      if (data.twoFactorEnabled) {
        setOtpauthUrl(null);
      } else if (typeof data.otpauthUrl === "string" && data.otpauthUrl.length > 0) {
        setOtpauthUrl(data.otpauthUrl);
      } else {
        setOtpauthUrl(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (err && !hasSecret && !enabled && !loading) {
    return (
      <section className="rounded-2xl border border-amber-100 bg-amber-50/80 p-5 sm:p-6 text-sm text-amber-900 font-medium">
        {err}
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 text-sm text-gray-500 font-medium">
        Loading two-factor status…
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="text-lg font-black text-mex-dark flex items-center gap-2 mb-2">
        <Shield className="text-mex-blue" size={22} />
        Two-factor (Google Authenticator)
      </h2>
      <p className="text-sm text-gray-600 font-medium mb-4">
        Required for <span className="font-bold text-mex-dark">admin</span> sign-in when enabled: after your email code, you will enter a 6-digit
        app code. <span className="font-bold">Staff</span> accounts are not required to use 2FA.
      </p>

      {err && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{err}</div>}

      {enabled && (
        <p className="text-sm font-bold text-green-700 mb-3">Two-factor authentication is <span className="uppercase">on</span> for this account.</p>
      )}

      {!enabled && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={async () => {
              setErr(null);
              setOtpauthUrl(null);
              const res = await fetch("/api/admin/totp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "begin" }),
              });
              const data = (await res.json().catch(() => ({}))) as { otpauthUrl?: string; error?: string };
              if (!res.ok) {
                setErr(typeof data.error === "string" ? data.error : "Could not start setup.");
                return;
              }
              if (typeof data.otpauthUrl === "string") setOtpauthUrl(data.otpauthUrl);
            }}
            className="rounded-xl bg-mex-blue px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-900"
          >
            {hasSecret ? "Show setup link again" : "Set up authenticator app"}
          </button>

          {otpauthUrl && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-800">
              <p className="font-bold text-mex-dark mb-2">Add in Google Authenticator (or similar)</p>
              <p className="text-gray-500 mb-4 text-[13px] leading-snug">
                Scan this QR code with your app. If scanning fails, use &quot;Enter a setup key&quot; / manual entry with the secret from the text below.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-inner">
                  <QRCode value={otpauthUrl} size={200} level="M" bgColor="#ffffff" fgColor="#0f172a" />
                </div>
                <div className="w-full min-w-0 max-w-xl flex-1">
                  <p className="mb-2 font-semibold text-[11px] uppercase tracking-wide text-gray-500">Manual setup (otpauth URI)</p>
                  <code className="block select-all break-all rounded border bg-white p-3 text-[10px] leading-relaxed text-gray-900">
                    {otpauthUrl}
                  </code>
                </div>
              </div>
              <label className="mt-6 block text-sm font-bold text-gray-700">
                Enter 6-digit code from the app to confirm
                <input
                  className="mt-1 w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-lg font-black tracking-widest"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={enrollCode}
                  onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                />
              </label>
              <p className="mt-2 text-[11px] text-gray-500">
                The orange button stays disabled until you enter all 6 digits. If the code is rejected, check your phone&apos;s time is set automatically (network time).
              </p>
              <button
                type="button"
                onClick={async () => {
                  setErr(null);
                  const res = await fetch("/api/admin/totp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ action: "enable", code: enrollCode }),
                  });
                  const data = (await res.json().catch(() => ({}))) as { error?: string };
                  if (!res.ok) {
                    setErr(typeof data.error === "string" ? data.error : "Invalid code.");
                    return;
                  }
                  setOtpauthUrl(null);
                  setEnrollCode("");
                  await load();
                }}
                disabled={enrollCode.length !== 6}
                className="mt-3 rounded-xl bg-mex-orange px-4 py-2.5 text-sm font-bold text-white shadow-sm transition enabled:hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Enable 2FA
              </button>
            </div>
          )}
        </div>
      )}

      {enabled && (
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-bold text-gray-700">
            Account password (to turn off 2FA)
            <input
              type="password"
              className="mt-1 w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button
            type="button"
            onClick={async () => {
              setErr(null);
              const res = await fetch("/api/admin/totp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "disable", password: disablePassword }),
              });
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              if (!res.ok) {
                setErr(typeof data.error === "string" ? data.error : "Could not disable 2FA.");
                return;
              }
              setDisablePassword("");
              await load();
            }}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-800 hover:bg-red-100"
          >
            Disable two-factor
          </button>
        </div>
      )}
    </section>
  );
}
