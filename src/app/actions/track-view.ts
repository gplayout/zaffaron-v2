"use server";

// =============================================================================
// Phase 1b (2026-04-24): Anonymous recipe-view tracking Server Action.
//
// Purpose: a cheap, low-risk aggregate pageview counter. Feeds the
//   recipe_engagement.view_count column that was deployed in Stage 0
//   (2026-04-23). No PII, no cookies, no tracking pixel.
//
// This is NOT a unique-visitor system. It's raw view counting with a
// best-effort abuse damper. Stage 2 will add proper dedup (Turnstile +
// session-level throttling) and engagement-aware ranking.
//
// Privacy framing (per GPT wording tighten 2026-04-24):
//   Low-risk anonymous aggregate. No user profiles, no cross-page tracking,
//   no cookies set by this feature. IP is used only as a transient throttle
//   key (never persisted).
// =============================================================================

import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Cheap bot-noise reduction (NOT security). Sophisticated bots bypass.
// Stage 2 replaces this with Cloudflare Turnstile or equivalent.
const BOT_UA_REGEX = /bot|crawl|spider|scrape|fetch|headless|curl|wget/i;

// Best-effort abuse damper (NOT dedup). Single-instance in-memory Map.
// Resets on Vercel cold start (acceptable for Phase 1b).
// TODO(Stage 2): move to Upstash Redis for cross-instance consistency.
const THROTTLE_WINDOW_MS = 5000;
const THROTTLE = new Map<string, number>();
const MAX_MAP_SIZE = 10000;

function isThrottled(key: string): boolean {
  const now = Date.now();
  const last = THROTTLE.get(key);
  if (last !== undefined && now - last < THROTTLE_WINDOW_MS) return true;

  THROTTLE.set(key, now);

  // Opportunistic GC: when map grows large, drop entries older than 1 min.
  if (THROTTLE.size > MAX_MAP_SIZE) {
    const cutoff = now - 60_000;
    for (const [k, v] of THROTTLE) {
      if (v < cutoff) THROTTLE.delete(k);
    }
  }
  return false;
}

export async function trackRecipeView(
  recipeId: string,
): Promise<{ ok: true; skipped?: string }> {
  try {
    if (!recipeId || !UUID_REGEX.test(recipeId)) {
      return { ok: true, skipped: "invalid_uuid" };
    }

    const h = await headers();
    const userAgent = h.get("user-agent") || "";
    if (BOT_UA_REGEX.test(userAgent)) {
      return { ok: true, skipped: "bot" };
    }

    // Vercel populates x-forwarded-for with the original client IP.
    // x-real-ip is a defensive fallback for edge cases where x-forwarded-for
    // is absent (rare on Vercel, non-zero on mixed proxy setups).
    const xff = h.get("x-forwarded-for") || "";
    const ip =
      xff.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";

    if (isThrottled(`${ip}:${recipeId}`)) {
      return { ok: true, skipped: "throttled" };
    }

    // Stage 0 RPC, service_role-only grant enforced server-side.
    await supabaseServer.rpc("increment_recipe_view", {
      p_recipe_id: recipeId,
    });

    return { ok: true };
  } catch (err) {
    // Fire-and-forget: view tracking failures must never surface to users.
    console.warn("[track-view] error:", err);
    return { ok: true, skipped: "error" };
  }
}
