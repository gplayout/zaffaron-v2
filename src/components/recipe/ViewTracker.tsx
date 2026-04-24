"use client";

// =============================================================================
// Phase 1b (2026-04-24): Anonymous view tracker for recipe pages.
//
// Mounts invisibly. After a 5-second settle window, if the tab is still
// visible and the page isn't prerendering, it fires a fire-and-forget
// Server Action that increments recipe_engagement.view_count.
//
// - 5s delay is an initial operating heuristic. Catches common
//   instant-bounce and prefetch hits. Tuneable in Stage 2 from real data.
// - Visibility + prerendering gates keep Next.js Link prefetches and
//   background tabs from inflating counts.
// - bfcache re-entry is intentionally NOT handled here (Path B minimal).
// =============================================================================

import { useEffect } from "react";
import { trackRecipeView } from "@/app/actions/track-view";

interface ViewTrackerProps {
  recipeId: string;
}

const SETTLE_MS = 5000;

export function ViewTracker({ recipeId }: ViewTrackerProps) {
  useEffect(() => {
    if (!recipeId) return;

    // Skip if Next.js / browser is prerendering this route (Speculation Rules).
    // Fully supported in Chromium; Safari lacks this signal and will over-count
    // slightly — acceptable for Phase 1b.
    // `document.prerendering` is an experimental Web API not yet in lib.dom.d.ts.
    const doc = typeof document !== "undefined"
      ? (document as Document & { prerendering?: boolean })
      : null;
    if (doc?.prerendering) return;

    const timer = setTimeout(() => {
      // Skip if the tab has moved to background during the settle window.
      if (document.visibilityState !== "visible") return;

      // Fire-and-forget; never block render or surface errors to the user.
      void trackRecipeView(recipeId).catch(() => {});
    }, SETTLE_MS);

    return () => clearTimeout(timer);
  }, [recipeId]);

  return null;
}
