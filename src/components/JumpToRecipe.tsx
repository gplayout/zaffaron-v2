"use client";

export default function JumpToRecipe() {
  return (
    <a
      href="#recipe-ingredients"
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
    >
      ↓ Jump to Recipe
    </a>
  );
}
