"use server";

import { createServerSupabase } from "@/lib/supabase-server-auth";
import { structureRecipeText } from "@/lib/vault/structure";
import type { VaultStructuredData } from "@/lib/vault/types";
import { nanoid } from "nanoid";
import { generateHeritageCard } from "@/lib/vault/heritage-card";
import { supabaseServer } from "@/lib/supabase-server";

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

  const result = await structureRecipeText(rawText, title);
  if (!result.ok) return result;

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

    // Generate Heritage Card (background, don't block save)
    try {
      const cardBuffer = await generateHeritageCard({
        title,
        attributionName: attributionName || undefined,
        cuisine: structuredData.cuisine || undefined,
        ingredientCount: structuredData.ingredients?.length || 0,
        stepCount: structuredData.instructions?.length || 0,
      });
      const cardPath = `vault-cards/${shareSlug}.jpg`;
      await supabaseServer.storage
        .from("recipe-images")
        .upload(cardPath, cardBuffer, { contentType: "image/jpeg", upsert: true });
      
      const cardUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${cardPath}`;
      await supabase.from("vault_recipes").update({ image_url: cardUrl }).eq("share_slug", shareSlug);
    } catch (cardError) {
      // Card generation failure should NOT block recipe save
      console.error("Heritage card generation failed:", cardError);
    }

    return { ok: true, slug: shareSlug };
  } catch (error) {
    console.error("Vault save error:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
