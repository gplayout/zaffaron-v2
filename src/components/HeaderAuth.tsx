"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Loader2 } from "lucide-react";

export function HeaderAuth() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex h-9 w-9 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white">
            <span className="text-xs font-medium">
              {user.user_metadata?.full_name?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                "U"}
            </span>
          </div>
          <span className="hidden text-sm font-medium text-stone-700 sm:block max-w-[100px] truncate">
            {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
          </span>
        </div>
        <button
          onClick={signOut}
          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:block"
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700"
      >
        Sign up
      </Link>
    </div>
  );
}
