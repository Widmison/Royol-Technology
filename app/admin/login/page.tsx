"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, User as UserIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Signup
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
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
    // THE PRO TRICK: 'fixed inset-0 z-[100]' makes the login page fullscreen, hiding the header and footer!
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mex-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mex-orange/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/">
          <Image src="/Logo.JPG" alt="MEX509" width={200} height={60} className="mx-auto h-16 w-auto object-contain cursor-pointer" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-mex-dark">
          {isLogin ? "Welcome Back" : "Create Your Account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          {isLogin ? "Enter your details to access your portal." : "Join MEX509 to track your shipments easily."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center animate-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuth}>
            
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
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-medium text-gray-700" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 bg-mex-blue text-white font-bold text-lg px-4 py-4 rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 mt-4">
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