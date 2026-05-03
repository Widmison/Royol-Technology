"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { SessionProvider } from "next-auth/react";
import GoogleAdminSignInButton from "@/components/admin/GoogleAdminSignInButton";
import LanguageSelector from "@/components/LanguageSelector";

type Step = "choose" | "otp" | "totp";

function AdminLoginInner() {
  const tSecurity = useTranslations("AdminSecurity");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | undefined>();

  function redirectAfterSignIn(needsProfile: boolean) {
    const next = needsProfile ? "/admin/complete-profile" : "/admin/dashboard";
    window.location.assign(next);
  }

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    setDevOtp(undefined);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "credentials", email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        step?: string;
        needsProfile?: boolean;
        devOtp?: string;
      };
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Sign-in failed.");
        return;
      }
      if (data.step === "signed_in") {
        redirectAfterSignIn(data.needsProfile === true);
        return;
      }
      if (data.devOtp && typeof data.devOtp === "string") {
        setDevOtp(data.devOtp);
      }
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "otp", email, code: otp }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        step?: string;
        needsProfile?: boolean;
      };
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Invalid code.");
        return;
      }
      if (data.step === "totp_required") {
        setStep("totp");
        setTotp("");
        return;
      }
      redirectAfterSignIn(data.needsProfile === true);
    } finally {
      setLoading(false);
    }
  }

  async function submitTotp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "totp", email, totp }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; needsProfile?: boolean };
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Invalid code.");
        return;
      }
      redirectAfterSignIn(data.needsProfile === true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50 px-4 py-10 font-sans sm:py-14">
      <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-6">
        <LanguageSelector compact />
      </div>
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-mex-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-mex-orange/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-black tracking-tight text-mex-dark sm:text-3xl">Admin sign in</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-gray-600">{tSecurity("loginIntro")}</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              Sign-in failed. Please try again.
            </div>
          )}
          {err && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-bold text-red-700">{err}</div>
          )}

          {step === "choose" && (
            <>
              <form onSubmit={submitCredentials} className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Work email
                  <input
                    type="email"
                    autoComplete="username"
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </label>
                <label className="block text-sm font-bold text-gray-700">
                  Password
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 font-medium outline-none ring-mex-blue/30 focus:ring-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-900 disabled:opacity-60"
                >
                  {loading ? "Working…" : "Continue — email me a code (admins)"}
                </button>
              </form>
              <GoogleAdminSignInButton />
            </>
          )}

          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-4">
              <p className="text-sm font-medium text-gray-600">
                Enter the 6-digit code sent to <span className="font-bold text-mex-dark">{email}</span>.
              </p>
              <p className="text-xs font-medium text-gray-500">
                If you haven’t finished staff registration yet, you’ll continue there to set your permanent password.
              </p>
              {devOtp && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                  Dev only: code <span className="tracking-widest">{devOtp}</span>
                </div>
              )}
              <label className="block text-sm font-bold text-gray-700">
                Email verification code
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-center text-2xl font-black tracking-[0.3em] outline-none ring-mex-blue/30 focus:ring-2"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                />
              </label>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-900 disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("choose");
                  setOtp("");
                  setErr(null);
                  setDevOtp(undefined);
                }}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            </form>
          )}

          {step === "totp" && (
            <form onSubmit={submitTotp} className="space-y-4">
              <p className="text-sm font-medium text-gray-600">
                Open your authenticator app and enter the 6-digit code for <span className="font-bold text-mex-dark">{email}</span>.
              </p>
              <label className="block text-sm font-bold text-gray-700">
                Authenticator code
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-center text-2xl font-black tracking-[0.3em] outline-none ring-mex-blue/30 focus:ring-2"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                />
              </label>
              <button
                type="submit"
                disabled={loading || totp.length !== 6}
                className="w-full rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-900 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Verify and sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("otp");
                  setTotp("");
                  setErr(null);
                }}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Back to email code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
        <AdminLoginInner />
      </Suspense>
    </SessionProvider>
  );
}
