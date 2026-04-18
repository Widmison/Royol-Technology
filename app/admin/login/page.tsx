"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50 px-4 py-10 font-sans sm:py-14">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-mex-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-mex-orange/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-black tracking-tight text-mex-dark sm:text-3xl">Admin sign in</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-gray-600">
            Staff dashboard — not the same login as the client portal.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-bold text-red-600 animate-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-mex-blue px-4 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-900 disabled:opacity-70"
            >
              {isSubmitting ? "Signing in…" : "Sign in to admin"}
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
