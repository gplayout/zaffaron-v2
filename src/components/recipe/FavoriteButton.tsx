"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toggleFavorite, getIsFavorited } from "./favorites-actions";

interface FavoriteButtonProps {
  recipeId: string;
}

export function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Load initial favorite status from server when signed in
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadFavoriteStatus = async () => {
      const result = await getIsFavorited(recipeId);
      if (!cancelled && result.ok) {
        setIsFavorited(result.isFavorited);
      }
    };

    loadFavoriteStatus();

    return () => {
      cancelled = true;
    };
  }, [user, recipeId]);

  const handleToggle = useCallback(async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);

    // Optimistic update
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    const result = await toggleFavorite(recipeId);

    if (result.ok) {
      setIsFavorited(result.isFavorited);
    } else {
      // Revert on error
      setIsFavorited(previousState);
      console.error("Failed to toggle favorite:", result.error);
    }

    setIsLoading(false);
    setTimeout(() => setIsAnimating(false), 300);
  }, [user, isLoading, isFavorited, recipeId]);

  if (!user) {
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition hover:bg-stone-50"
          aria-label="Sign in to save recipes"
          disabled
        >
          <Heart className="h-5 w-5" />
        </button>
        {showTooltip && (
          <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-800 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
            Sign in to save recipes
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-stone-800" />
          </div>
        )}
      </div>
    );
  }

  const effectiveIsFavorited = user ? isFavorited : false;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-50 ${
        effectiveIsFavorited
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-stone-200 bg-white text-stone-400 hover:bg-stone-50 hover:text-stone-600"
      }`}
      aria-label={effectiveIsFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={effectiveIsFavorited}
      title={effectiveIsFavorited ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart
        className={`h-5 w-5 transition-all duration-300 ${
          effectiveIsFavorited ? "fill-current" : ""
        } ${isAnimating ? "scale-125" : "scale-100"}`}
      />
    </button>
  );
}
