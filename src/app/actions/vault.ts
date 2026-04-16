"use server";

import { createServerSupabase } from "@/lib/supabase-server-auth";
import { structureRecipeText } from "@/lib/vault/structure";
import type { VaultStructuredData } from "@/lib/vault/types";
import { nanoid } from "nanoid";

// Credit limit check
async function checkCredits(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>): Promise<{ ok: true } | { ok: false; error: string }> {
  // Check user entitlements
  const { data: ent } = await supabase.from("user_entitlements").select("tier, ai_credits_remaining, recipe_limit").eq("user_id", userId).single();
  
  if (!ent) {
    // First-time user — create entitlements with free tier defaults
    await supabase.from("user_entitlements").insert({ user_id: userId, tier: "free", ai_credits_remaining: 5, recipe_limit: 10 });
    return { ok: true };
  }
  
  if (ent.ai_credits_remaining <= 0) {
    return { ok: false, error: "You've used all your free AI credits this month. Upgrade to Heritage Pro for unlimited." };
  }
  
  // Check recipe count
  const { count } = await supabase.from("vault_recipes").select("*", { count: "exact", head: true }).eq("owner_id", userId);
  if ((count || 0) >= (ent.recipe_limit || 10) && ent.tier === "free") {
    return { ok: false, error: `You've reached the ${ent.recipe_limit} recipe limit. Upgrade to Heritage Pro for unlimited.` };
  }
  
  return { ok: true };
}

async function decrementCredits(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data: ent } = await supabase.from("user_entitlements").select("ai_credits_remaining").eq("user_id", userId).single();
  if (ent && ent.ai_credits_remaining > 0) {
    await supabase.from("user_entitlements").update({ ai_credits_remaining: ent.ai_credits_remaining - 1 }).eq("user_id", userId);
  }
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

  // Auth + credit check for AI usage
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const creditCheck = await checkCredits(user.id, supabase);
    if (!creditCheck.ok) return creditCheck;
  }

  const result = await structureRecipeText(rawText, title);
  if (!result.ok) return result;

  // Decrement AI credit after successful structuring
  if (user) {
    await decrementCredits(user.id, supabase);
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
