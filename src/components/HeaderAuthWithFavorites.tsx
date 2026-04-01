"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { HeaderAuth } from "./HeaderAuth";
import { useAuth } from "@/hooks/useAuth";

export function HeaderAuthWithFavorites() {
  const { user, loading } = useAuth();

  return (
    <div className="flex items-center gap-1">
      {user && !loading && (
        <Link
          href="/favorites"
          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-red-500"
          aria-label="Your favorites"
          title="Your favorites"
        >
          <Heart className="h-5 w-5" />
        </Link>
      )}
      <HeaderAuth />
    </div>
  );
}
