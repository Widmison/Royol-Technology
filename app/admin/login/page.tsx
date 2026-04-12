"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, User as UserIcon } from "lucide-react";
import { signupPasswordRuleChecks } from "@/lib/passwordPolicy";
import SignupPasswordHints from "@/components/SignupPasswordHints";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Signup
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const signupPasswordOk =
    isLogin || Object.values(signupPasswordRuleChecks(password)).every(Boolean);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!isLogin && !signupPasswordOk) {
      setIsSubmitting(false);
      setError("Please meet all password requirements below.");
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: isLogin ? "login" : "signup",
          email, 
          password,
          firstName,
          lastName
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
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

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-black tracking-tight text-mex-dark sm:text-3xl">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-gray-600">
            {isLogin ? "Sign in to the admin dashboard." : "Strong password required for new admin accounts."}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center animate-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleAuth}>
            
            {/* Show Name Fields ONLY if Signing Up */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" required={!isLogin} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="John" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input type="text" required={!isLogin} value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none text-sm font-medium text-gray-700" placeholder="Doe" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium text-gray-700" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={!isLogin ? 10 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium text-gray-700"
                  placeholder="••••••••"
                />
              </div>
              {!isLogin && (
                <div className="mt-3">
                  <SignupPasswordHints password={password} />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !signupPasswordOk}
              className="w-full flex justify-center items-center gap-2 bg-mex-blue text-white font-bold text-lg px-4 py-4 rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 mt-4"
            >
              {isSubmitting ? "Processing..." : isLogin ? "Secure Login" : "Create Account"} <ArrowRight size={20} />
            </button>
          </form>

          {/* TOGGLE BUTTON */}
          <div className="mt-8 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-sm font-bold text-mex-blue hover:text-blue-900 transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}