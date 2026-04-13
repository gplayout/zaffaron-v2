"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export default function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");
    const result = await subscribeNewsletter(formData);
    setLoading(false);

    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage(result.message || "Subscribed!");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-900">
        Newsletter
      </p>
      <p className="mb-3 text-sm text-stone-500">
        Get seasonal recipes & cultural food stories.
      </p>
      <form action={handleSubmit} className="flex gap-2">
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "..." : "Join"}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${isError ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
