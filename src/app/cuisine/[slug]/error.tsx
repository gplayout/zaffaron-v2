"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function CuisineErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Cuisine page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8">
        <h2 className="mb-4 text-2xl font-bold text-red-800">
          Oops! Something went wrong
        </h2>
        <p className="mb-6 text-red-600">
          We couldn&apos;t load this cuisine. Please try again or browse all recipes.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Try Again
          </button>
          <Link
            href="/recipes"
            className="rounded-lg border border-red-300 bg-white px-6 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Browse All Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
