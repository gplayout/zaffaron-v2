"use server";

import { createServerSupabase } from "@/lib/supabase-server-auth";
import { structureRecipeText } from "@/lib/vault/structure";
import type { VaultStructuredData } from "@/lib/vault/types";
import { nanoid } from "nanoid";

// Atomic credit system via Supabase RPC (prevents race conditions)
async function ensureEntitlements(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data: ent } = await supabase.from("user_entitlements").select("user_id").eq("user_id", userId).single();
  if (!ent) {
    await supabase.from("user_entitlements").insert({ user_id: userId, tier: "free", ai_credits_remaining: 5, recipe_limit: 10 });
  }
}

async function tryDecrementCredits(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>): Promise<boolean> {
  await ensureEntitlements(userId, supabase);
  const { data } = await supabase.rpc("decrement_ai_credits", { p_user_id: userId, p_cost: 1 });
  return data === true;
}

async function refundCredits(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  await supabase.rpc("refund_ai_credits", { p_user_id: userId, p_cost: 1 });
}

async function checkRecipeLimit(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>): Promise<boolean> {
  const { data: ent } = await supabase.from("user_entitlements").select("tier, recipe_limit").eq("user_id", userId).single();
  if (!ent || ent.tier !== "free") return true;
  const { count } = await supabase.from("vault_recipes").select("*", { count: "exact", head: true }).eq("owner_id", userId);
  return (count || 0) < (ent.recipe_limit || 10);
}

export async function structureRecipe(
  title: string,
  rawText: string
): Promise<
  | { ok: true; data: VaultStructuredData; confidence: number; language: string }
  | { ok: false; error: string }
> {
  if (!title.trim() || !rawText.trim()) {
    return { ok: false, error: "Title and recipe text are required." };
  }

  if (rawText.length > 10000) {
    return { ok: false, error: "Recipe text is too long (max 10,000 characters)." };
  }

  // Auth + atomic credit deduction
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  let creditDeducted = false;
  if (user) {
    const hasCredits = await tryDecrementCredits(user.id, supabase);
    if (!hasCredits) {
      return { ok: false, error: "No AI credits remaining. Upgrade to Heritage Pro for unlimited." };
    }
    creditDeducted = true;
  }

  const result = await structureRecipeText(rawText, title);

  // F-kimi-4 fix (2026-04-26): refund credit on AI failure BEFORE returning.
  // Pre-fix, refund was after early return — unreachable dead code. Users would
  // lose AI credits on transient failures (rate limits, malformed responses, etc).
  if (!result.ok) {
    if (creditDeducted && user) {
      await refundCredits(user.id, supabase);
    }
    return result;
  }

  return {
    ok: true,
    data: result.data,
    confidence: result.confidence,
    language: result.language_detected,
  };
}

export async function saveVaultRecipe(
  title: string,
  rawText: string,
  structuredData: VaultStructuredData,
  attributionName?: string,
  attributionStory?: string
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: "Please sign in to save recipes." };
    }

    // Recipe limit check
    const withinLimit = await checkRecipeLimit(user.id, supabase);
    if (!withinLimit) {
      return { ok: false, error: "Recipe limit reached. Upgrade to Heritage Pro for unlimited." };
    }

    // Generate share slug
    const shareSlug = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50)}-${nanoid(6)}`;

    const { error: insertError } = await supabase.from("vault_recipes").insert({
      owner_id: user.id,
      title,
      structured_data: structuredData,
      source_type: "text",
      raw_transcript: rawText,
      attribution_name: attributionName || undefined,
      attribution_story: attributionStory || undefined,
      visibility: "private",
      share_slug: shareSlug,
      ai_confidence: null, // Set after review
      is_verified: false,
      cuisine: structuredData.cuisine || undefined,
      language: structuredData.language || "en",
    });

    if (insertError) {
      console.error("Vault save failed:", insertError);
      return { ok: false, error: "Failed to save recipe. Please try again." };
    }

    // TODO: Heritage card generation via separate API route (sharp causes Vercel bundling issues)

    return { ok: true, slug: shareSlug };
  } catch (error) {
    console.error("Vault save error:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
