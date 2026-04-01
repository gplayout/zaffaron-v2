"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsSubmitting(true);

    // TODO: Connect to backend API
    console.log("Newsletter signup:", { email });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setIsSuccess(true);
    setEmail("");
  };

  if (isSuccess) {
    return (
      <section className="mt-16 rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-stone-800">
          You&apos;re Subscribed!
        </h2>
        <p className="mt-2 text-stone-600">
          Thank you for joining our newsletter. Look out for delicious Persian recipes in your inbox every Friday!
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Subscribe another email
        </button>
      </section>
    );
  }

  return (
    <section className="mt-16 rounded-2xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200 p-8 sm:p-10">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <Mail className="h-7 w-7 text-amber-600" />
        </div>
        
        <h2 className="mt-4 text-2xl font-bold text-stone-800 sm:text-3xl">
          🌿 Get Persian Recipes Weekly
        </h2>
        
        <p className="mt-3 text-stone-600">
          Join thousands of home cooks receiving authentic Persian recipes, cooking tips, and cultural stories delivered straight to your inbox every Friday.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-stone-300 bg-white px-5 py-3.5 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                required
              />
              {error && (
                <p className="mt-2 text-left text-sm text-red-600">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-8 py-3.5 font-semibold text-white shadow-md transition hover:bg-amber-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
          
          <p className="mt-4 text-xs text-stone-500">
            No spam, ever. Unsubscribe anytime. We respect your privacy.
          </p>
        </form>
      </div>
    </section>
  );
}
