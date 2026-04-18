"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ArrowLeft, User as UserIcon, MapPin, KeyRound, Phone } from "lucide-react";
import { signupPasswordRuleChecks } from "@/lib/passwordPolicy";
import SignupPasswordHints from "@/components/SignupPasswordHints";

type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset";

export default function LoginPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [otpCode, setOtpCode] = useState("");
  const [devVerificationCode, setDevVerificationCode] = useState<string | null>(null);
  const [devVerificationNote, setDevVerificationNote] = useState<string | null>(null);

  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  const signupPasswordOk =
    authMode !== "signup" || Object.values(signupPasswordRuleChecks(password)).every(Boolean);

  const resetRulesOk =
    authMode !== "reset" ||
    resetStep !== 2 ||
    Object.values(signupPasswordRuleChecks(newPassword)).every(Boolean);
  const resetPasswordsMatch =
    authMode !== "reset" ||
    resetStep !== 2 ||
    (newPassword.length > 0 && confirmNewPassword.length > 0 && newPassword === confirmNewPassword);
  const resetPasswordOk = resetRulesOk && resetPasswordsMatch;

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
          email,
          password,
          firstName,
          lastName,
          phone,
          address,
          city,
          state,
          zipCode,
          code: otpCode,
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
          router.push("/dashboard?tab=tracking");
        }
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setInfoBanner(null);
    setNewPassword("");
    setConfirmNewPassword("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot_password", email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed.");
        return;
      }
      setInfoBanner(data.message || "Check your email for reset instructions.");
      const devCode =
        typeof data.devResetCode === "string"
          ? data.devResetCode
          : typeof data.devResetToken === "string"
            ? data.devResetToken
            : "";
      if (devCode) setResetToken(devCode);
      setResetStep(1);
      setAuthMode("reset");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    if (!resetRulesOk) {
      setIsSubmitting(false);
      setError("Please meet all password requirements below.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setIsSubmitting(false);
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          email,
          token: resetToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed.");
        return;
      }
      setInfoBanner(data.message || "Password updated. You can sign in.");
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetToken("");
      setResetStep(1);
      setAuthMode("login");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    if (!email.trim() || resetToken.length !== 6) {
      setIsSubmitting(false);
      setError("Enter your email and the full 6-digit code.");
      return;
    }
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_reset_code",
          email,
          token: resetToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code.");
        return;
      }
      setInfoBanner("Code verified. On the next step, choose your new password.");
      setResetStep(2);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    authMode === "login"
      ? "Welcome Back"
      : authMode === "signup"
        ? "Create Your Account"
        : authMode === "verify"
          ? "Verify Your Email"
          : authMode === "forgot"
            ? "Forgot password"
            : resetStep === 1
              ? "Enter verification code"
              : "Set a new password";

  const subtitle =
    authMode === "login"
      ? "Sign in to your customer portal."
      : authMode === "signup"
        ? "Create an account to book shipments and track packages."
        : authMode === "verify"
          ? "Enter the 6-digit code from your email."
          : authMode === "forgot"
            ? "Enter your email. We will send reset instructions if an account exists."
            : resetStep === 1
              ? "Enter the code from your email, then continue to choose a new password."
              : "Use a strong password and enter it twice to avoid typos.";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50 px-4 py-10 font-sans sm:py-14">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-mex-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-mex-orange/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-lg">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-black tracking-tight text-mex-dark sm:text-3xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-gray-600">{subtitle}</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
          {error && (
            <div className="mb-6 animate-in zoom-in rounded-xl bg-red-50 p-4 text-center text-sm font-bold text-red-600 duration-300">
              {error}
            </div>
          )}

          {infoBanner && (authMode === "login" || authMode === "reset") && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-center text-xs font-bold text-green-800">
              {infoBanner}
            </div>
          )}

          {authMode === "forgot" && (
            <form className="space-y-4 sm:space-y-5" onSubmit={handleForgot}>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-900 disabled:opacity-70 sm:py-4 sm:text-lg"
              >
                {isSubmitting ? "Sending…" : "Send reset instructions"} <ArrowRight size={20} />
              </button>
            </form>
          )}

          {authMode === "reset" && resetStep === 1 && (
            <form className="space-y-4 sm:space-y-5" onSubmit={handleVerifyResetCode}>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={resetToken}
                  onChange={(e) =>
                    setResetToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-lg tracking-[0.35em] text-gray-800 outline-none focus:ring-2 focus:ring-mex-blue"
                  placeholder="000000"
                  aria-describedby="reset-code-hint"
                />
                <p id="reset-code-hint" className="mt-2 text-xs font-medium text-gray-500">
                  Check inbox and spam for the 6-digit code we sent.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || resetToken.length !== 6 || !email.trim()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-900 disabled:opacity-70 sm:py-4 sm:text-lg"
              >
                {isSubmitting ? "Checking…" : "Continue"} <ArrowRight size={20} />
              </button>
            </form>
          )}

          {authMode === "reset" && resetStep === 2 && (
            <form className="space-y-4 sm:space-y-5" onSubmit={handleReset}>
              <button
                type="button"
                onClick={() => {
                  setResetStep(1);
                  setError("");
                  setInfoBanner(
                    "Enter your email and code again if you need to change them."
                  );
                }}
                className="flex items-center gap-2 text-sm font-bold text-mex-blue hover:text-blue-900"
              >
                <ArrowLeft size={18} /> Back to code
              </button>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">New password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                  />
                </div>
                <div className="mt-3">
                  <SignupPasswordHints password={newPassword} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Confirm new password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 font-medium outline-none focus:ring-2 focus:ring-mex-blue ${
                      confirmNewPassword.length === 0
                        ? "border-gray-300 text-gray-700"
                        : newPassword === confirmNewPassword
                          ? "border-green-400 bg-green-50/40 text-gray-900"
                          : "border-red-300 bg-red-50/40 text-gray-900"
                    }`}
                  />
                </div>
                {confirmNewPassword.length > 0 &&
                  (newPassword === confirmNewPassword ? (
                    <p className="mt-2 text-xs font-bold text-green-700">Passwords match.</p>
                  ) : (
                    <p className="mt-2 text-xs font-bold text-red-600">Passwords do not match.</p>
                  ))}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !resetPasswordOk}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-mex-blue px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-900 disabled:opacity-70 sm:py-4 sm:text-lg"
              >
                {isSubmitting ? "Updating…" : "Update password"} <ArrowRight size={20} />
              </button>
            </form>
          )}

          {(authMode === "login" || authMode === "signup" || authMode === "verify") && (
            <form className="space-y-4 sm:space-y-5" onSubmit={handleAuth}>
              {authMode !== "verify" && (
                <>
                  {authMode === "signup" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">First Name</label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                              placeholder="John"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-gray-700">Last Name</label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">Phone Number</label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="block text-sm font-bold text-gray-700">Password</label>
                      {authMode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setError("");
                            setInfoBanner(null);
                            setResetStep(1);
                            setResetToken("");
                            setNewPassword("");
                            setConfirmNewPassword("");
                          }}
                          className="text-xs font-bold text-mex-blue hover:text-blue-900"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                        minLength={authMode === "signup" ? 10 : undefined}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                        placeholder="••••••••"
                      />
                    </div>
                    {authMode === "signup" && (
                      <div className="mt-3">
                        <SignupPasswordHints password={password} />
                      </div>
                    )}
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-300">
                      <h3 className="flex items-center gap-2 text-lg font-black text-mex-dark">
                        <MapPin size={18} /> Home Address
                      </h3>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">Street Address</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                          placeholder="123 Main St"
                        />
                      </div>
                      <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-3">
                          <label className="mb-2 block text-sm font-bold text-gray-700">City</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                            placeholder="Miami"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="mb-2 block text-sm font-bold text-gray-700">State</label>
                          <input
                            type="text"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                            placeholder="FL"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-2 block text-sm font-bold text-gray-700">Zip Code</label>
                          <input
                            type="text"
                            required
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-mex-blue"
                            placeholder="33101"
                          />
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
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                        Development — your code
                      </p>
                      <p className="font-black text-3xl tracking-[0.35em] text-mex-dark tabular-nums">
                        {devVerificationCode}
                      </p>
                      {devVerificationNote && (
                        <p className="mt-2 text-xs font-medium leading-snug text-amber-900/80">{devVerificationNote}</p>
                      )}
                    </div>
                  )}
                  <label className="mb-2 block text-center text-sm font-bold text-gray-700">Enter 6-Digit Code</label>
                  <div className="relative mx-auto max-w-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <KeyRound className="h-6 w-6 text-mex-orange" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full rounded-xl border-2 border-mex-orange py-4 pl-12 pr-4 text-center font-black text-2xl tracking-widest text-mex-dark outline-none focus:ring-4 focus:ring-orange-100"
                      placeholder="000000"
                    />
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
                {isSubmitting ? "Processing..." : authMode === "login" ? "Secure Login" : authMode === "signup" ? "Create Account" : "Verify & Enter"}{" "}
                <ArrowRight size={20} />
              </button>
            </form>
          )}

          {(authMode === "login" || authMode === "signup") && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setError("");
                  setInfoBanner(null);
                  setDevVerificationCode(null);
                  setDevVerificationNote(null);
                }}
                className="text-sm font-bold text-mex-blue transition-colors hover:text-blue-900"
              >
                {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          )}

          {(authMode === "forgot" || authMode === "reset") && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                  setInfoBanner(null);
                  setResetStep(1);
                  setResetToken("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
                className="text-sm font-bold text-mex-blue transition-colors hover:text-blue-900"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
