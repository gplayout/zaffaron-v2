"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChefHat, Mail, Lock, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center">
            <ChefHat className="h-12 w-12 text-amber-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-stone-900">
            Check your email
          </h1>
          <p className="mt-2 text-stone-600">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Please click the link to verify your account.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-white transition hover:bg-amber-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <ChefHat className="h-12 w-12 text-amber-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-stone-900">
            Create an account
          </h1>
          <p className="mt-2 text-stone-600">
            Join Zaffaron and start saving your favorite recipes
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700"
            >
              Full name
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700"
            >
              Email address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Must be at least 6 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-amber-600 px-4 py-2.5 font-medium text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-stone-50 px-2 text-stone-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-medium text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <p className="text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
