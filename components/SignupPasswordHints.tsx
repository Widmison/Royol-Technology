"use client";

import { CheckCircle } from "lucide-react";
import {
  SIGNUP_PASSWORD_RULES_TEXT,
  signupPasswordRuleChecks,
  type SignupPasswordRuleKey,
} from "@/lib/passwordPolicy";

const LABELS: Record<SignupPasswordRuleKey, string> = {
  length: "At least 10 characters (max 128)",
  upper: "One uppercase letter (A–Z)",
  lower: "One lowercase letter (a–z)",
  digit: "One number (0–9)",
  symbol: "One symbol (e.g. ! @ # $ % & *)",
};

const ORDER: SignupPasswordRuleKey[] = ["length", "upper", "lower", "digit", "symbol"];

export default function SignupPasswordHints({ password }: { password: string }) {
  const c = signupPasswordRuleChecks(password);
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-xs">
      <p className="mb-2 font-bold leading-snug text-gray-800">{SIGNUP_PASSWORD_RULES_TEXT}</p>
      <ul className="space-y-1.5 font-medium text-gray-600">
        {ORDER.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 shrink-0 ${c[key] ? "text-green-600" : "text-gray-300"}`} aria-hidden />
            <span className={c[key] ? "text-gray-900" : undefined}>{LABELS[key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
