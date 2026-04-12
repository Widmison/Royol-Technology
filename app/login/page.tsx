"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, User as UserIcon, MapPin, KeyRound, Phone } from "lucide-react";
import { signupPasswordRuleChecks } from "@/lib/passwordPolicy";
import SignupPasswordHints from "@/components/SignupPasswordHints";

export default function LoginPage() {
  const router = useRouter();
  
  const [authMode, setAuthMode] = useState<"login" | "signup" | "verify">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(""); // ADDED PHONE STATE
  
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [otpCode, setOtpCode] = useState("");
  /** Shown on verify step when API returns a dev-only code (no real email provider yet). */
  const [devVerificationCode, setDevVerificationCode] = useState<string | null>(null);
  const [devVerificationNote, setDevVerificationNote] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  const signupPasswordOk =
    authMode !== "signup" || Object.values(signupPasswordRuleChecks(password)).every(Boolean);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (authMode === "signup" && !signupPasswordOk) {
      setIsSubmitting(false);
      setError("Please meet all password requirements below.");
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: authMode,
          email, password, firstName, lastName, phone, // ADDED PHONE TO API
          address, city, state, zipCode,
          code: otpCode 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requireVerification) {
          if (data.verificationEmailSent === true) {
            setInfoBanner("We emailed a 6-digit code to your address. Check inbox and spam.");
          } else {
            setInfoBanner(null);
          }
          if (typeof data.devVerificationCode === "string") {
            setDevVerificationCode(data.devVerificationCode);
            setDevVerificationNote(
              typeof data.devVerificationNote === "string" ? data.devVerificationNote : null
            );
          } else {
            setDevVerificationCode(null);
            setDevVerificationNote(null);
          }
          setAuthMode("verify");
        } else if (data.verified) {
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50 px-4 py-10 font-sans sm:py-14">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-mex-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-mex-orange/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-lg">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-black tracking-tight text-mex-dark sm:text-3xl">
            {authMode === "login" ? "Welcome Back" : authMode === "signup" ? "Create Your Account" : "Verify Your Email"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-gray-600">
            {authMode === "login"
              ? "Sign in to your customer portal."
              : authMode === "signup"
                ? "Create an account to book shipments and track packages."
                : "Enter the 6-digit code from your email."}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center animate-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleAuth}>
            
            {authMode !== "verify" && (
              <>
                {/* NAME & PHONE FIELDS (Signup Only) */}
                {authMode === "signup" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                          <input type="text" required={authMode === "signup"} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="John" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                        <input type="text" required={authMode === "signup"} value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="Doe" />
                      </div>
                    </div>

                    {/* NEW PHONE FIELD */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
                        <input type="tel" required={authMode === "signup"} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium text-gray-700" placeholder="(555) 123-4567" />
                      </div>
                    </div>
                  </div>
                )}

                {/* EMAIL & PASSWORD (Both) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium text-gray-700" placeholder="you@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input
                      type="password"
                      required
                      autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      minLength={authMode === "signup" ? 10 : undefined}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium text-gray-700"
                      placeholder="••••••••"
                    />
                  </div>
                  {authMode === "signup" && <div className="mt-3"><SignupPasswordHints password={password} /></div>}
                </div>

                {/* ADDRESS FIELDS (Signup Only) */}
                {authMode === "signup" && (
                  <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in duration-300">
                    <h3 className="font-black text-mex-dark text-lg flex items-center gap-2"><MapPin size={18} /> Home Address</h3>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                      <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                        <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="Miami" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                        <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="FL" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Zip Code</label>
                        <input type="text" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="33101" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {authMode === "verify" && (
              <div className="animate-in zoom-in space-y-3 py-2 duration-300 sm:space-y-4 sm:py-4">
                {infoBanner && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-center text-xs font-bold text-green-800">
                    {infoBanner}
                  </div>
                )}
                {devVerificationCode && (
                  <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Development — your code
                    </p>
                    <p className="font-black text-3xl tracking-[0.35em] text-mex-dark tabular-nums">
                      {devVerificationCode}
                    </p>
                    {devVerificationNote && (
                      <p className="text-xs text-amber-900/80 font-medium mt-2 leading-snug">{devVerificationNote}</p>
                    )}
                  </div>
                )}
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Enter 6-Digit Code</label>
                <div className="relative max-w-xs mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-6 w-6 text-mex-orange" /></div>
                  <input type="text" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full border-2 border-mex-orange rounded-xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-orange-100 outline-none font-black text-2xl tracking-widest text-center text-mex-dark" placeholder="000000" />
                </div>
                {!devVerificationCode && (
                  <p className="mt-2 text-center text-xs font-medium leading-relaxed text-gray-500">
                    Use the code we sent to your email. In local development without email, run{" "}
                    <code className="text-gray-700">npm run dev</code> and watch the terminal for the code.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !signupPasswordOk}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-900 disabled:opacity-70 sm:py-4 sm:text-lg"
            >
              {isSubmitting ? "Processing..." : authMode === "login" ? "Secure Login" : authMode === "signup" ? "Create Account" : "Verify & Enter"} <ArrowRight size={20} />
            </button>
          </form>

          {authMode !== "verify" && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setError("");
                  setInfoBanner(null);
                  setDevVerificationCode(null);
                  setDevVerificationNote(null);
                }}
                className="text-sm font-bold text-mex-blue hover:text-blue-900 transition-colors"
              >
                {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}