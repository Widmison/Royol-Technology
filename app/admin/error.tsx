"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] route error:", error.digest ?? error.message, error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-black text-mex-dark">Something went wrong</p>
      <p className="text-sm font-medium text-gray-600">
        Admin failed to load. Try again, or open Vercel → this deployment → <strong>Functions</strong> logs and search
        for the error digest below.
      </p>
      {error.digest ? (
        <p className="rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-700">Digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-mex-dark px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
