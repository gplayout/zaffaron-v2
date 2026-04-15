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
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
        Newsletter
      </p>
      <p className="mb-3 text-sm text-stone-500 dark:text-stone-400">
        Get seasonal recipes & cultural food stories.
      </p>
      <form action={handleSubmit} className="flex gap-2">
        {/* Honeypot: hidden from humans, bots fill it */}
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          aria-label="Email address for newsletter"
          className="flex-1 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
