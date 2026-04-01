"use client";

import { useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FavoriteButtonProps {
  recipeId: string;
}

const STORAGE_KEY = "zaffaron_favorites";

function getFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function useFavorites() {
  return useSyncExternalStore(
    subscribe,
    getFavoritesFromStorage,
    () => []
  );
}

export function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const { user } = useAuth();
  const favorites = useFavorites();
  const isFavorited = favorites.includes(recipeId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleFavorite = () => {
    if (!user) return;

    setIsAnimating(true);
    
    const stored = localStorage.getItem(STORAGE_KEY);
    let newFavorites: string[] = [];
    
    if (stored) {
      try {
        newFavorites = JSON.parse(stored);
      } catch {
        newFavorites = [];
      }
    }

    if (isFavorited) {
      newFavorites = newFavorites.filter((id) => id !== recipeId);
    } else {
      newFavorites.push(recipeId);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    
    // Dispatch storage event to update other components
    window.dispatchEvent(new StorageEvent("storage"));

    // Reset animation after it completes
    setTimeout(() => setIsAnimating(false), 300);
  };

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

  return (
    <button
      onClick={toggleFavorite}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ${
        isFavorited
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-stone-200 bg-white text-stone-400 hover:bg-stone-50 hover:text-stone-600"
      }`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
      title={isFavorited ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart
        className={`h-5 w-5 transition-all duration-300 ${
          isFavorited ? "fill-current" : ""
        } ${isAnimating ? "scale-125" : "scale-100"}`}
      />
    </button>
  );
}

// Helper function to get favorites from localStorage
export function getFavoriteIds(): string[] {
  return getFavoritesFromStorage();
}

// Helper function to check if a recipe is favorited
export function isRecipeFavorited(recipeId: string): boolean {
  const favorites = getFavoritesFromStorage();
  return favorites.includes(recipeId);
}
