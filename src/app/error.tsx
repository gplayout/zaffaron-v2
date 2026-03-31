"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="py-20 text-center">
      <p className="text-6xl">⚠️</p>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-stone-500">
        We&apos;re having trouble loading this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        Try again
      </button>
    </div>
  );
}
