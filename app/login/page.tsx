"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, User as UserIcon, MapPin, KeyRound, Phone } from "lucide-react";

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-y-auto">
      
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mex-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mex-orange/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 my-8">
        <Link href="/">
          <Image src="/logo.jpg" alt="MEX509" width={200} height={60} className="mx-auto h-16 w-auto object-contain cursor-pointer" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-mex-dark">
          {authMode === "login" ? "Welcome Back" : authMode === "signup" ? "Create Your Account" : "Verify Your Email"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          {authMode === "login" ? "Enter your details to access your portal." : 
           authMode === "signup" ? "Join MEX509 to track your shipments easily." :
           "We sent a 6-digit code to your email address."}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 mb-8">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center animate-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuth}>
            
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
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium text-gray-700" placeholder="••••••••" />
                  </div>
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
              <div className="animate-in zoom-in duration-300 py-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Enter 6-Digit Code</label>
                <div className="relative max-w-xs mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-6 w-6 text-mex-orange" /></div>
                  <input type="text" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full border-2 border-mex-orange rounded-xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-orange-100 outline-none font-black text-2xl tracking-widest text-center text-mex-dark" placeholder="000000" />
                </div>
                <p className="text-xs text-center text-gray-400 mt-4 font-medium">
                  Check your VS Code Terminal (if testing locally) for the code!
                </p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 bg-mex-blue text-white font-bold text-lg px-4 py-4 rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 mt-4">
              {isSubmitting ? "Processing..." : authMode === "login" ? "Secure Login" : authMode === "signup" ? "Create Account" : "Verify & Enter"} <ArrowRight size={20} />
            </button>
          </form>

          {authMode !== "verify" && (
            <div className="mt-8 text-center">
              <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setError(""); }} className="text-sm font-bold text-mex-blue hover:text-blue-900 transition-colors">
                {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}