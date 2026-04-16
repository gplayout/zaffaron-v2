/**
 * Streaming recipe structuring via Vercel AI SDK 6.
 * This is a server action that returns a ReadableStream.
 * Client consumes it with useObject() or manual stream reading.
 */
"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server-auth";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const recipeSchema = z.object({
  ingredients: z.array(
    z.object({
      item: z.string(),
      amount: z.string(),
      unit: z.string(),
      note: z.string().optional(),
    })
  ),
  instructions: z.array(
    z.object({
      step: z.number(),
      text: z.string(),
    })
  ),
  prep_time_minutes: z.number().nullable(),
  cook_time_minutes: z.number().nullable(),
  servings: z.number().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable(),
  cuisine: z.string().nullable(),
  category: z.string().nullable(),
  language: z.string(),
});

export type RecipeStreamData = z.infer<typeof recipeSchema>;

const SYSTEM_PROMPT = `You are a recipe structuring assistant for Zaffaron, a global family recipe vault.

Take raw recipe text (in ANY language) and extract structured data.

RULES:
1. Detect the language automatically
2. Keep ingredient names in their ORIGINAL language + English translation if not English
3. Keep instruction text in the ORIGINAL language
4. Extract quantities accurately — if vague, keep original wording
5. Never invent ingredients or steps not in the original
6. Be conservative with time estimates`;

export async function structureRecipeStreaming(
  title: string,
  rawText: string
): Promise<{ ok: true; data: RecipeStreamData; confidence: number; language: string } | { ok: false; error: string }> {
  // Auth + credit check
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  let creditDeducted = false;

  if (user) {
    const { data: ent } = await supabase.from("user_entitlements").select("user_id").eq("user_id", user.id).single();
    if (!ent) {
      await supabase.from("user_entitlements").insert({ user_id: user.id, tier: "free", ai_credits_remaining: 5, recipe_limit: 10 });
    }
    const { data: ok } = await supabase.rpc("decrement_ai_credits", { p_user_id: user.id, p_cost: 1 });
    if (!ok) return { ok: false, error: "No AI credits remaining." };
    creditDeducted = true;
  }

  try {
    const result = streamObject({
      model: openai("gpt-5.2"),
      schema: recipeSchema,
      system: SYSTEM_PROMPT,
      prompt: `Recipe title: ${title}\n\nRaw recipe text:\n${rawText}`,
      temperature: 0.3,
    });

    // For now, consume the full object (streaming will be added to UI later)
    const finalObject = await result.object;

    let confidence = 0.5;
    if (finalObject.ingredients?.length >= 2) confidence += 0.15;
    if (finalObject.instructions?.length >= 2) confidence += 0.15;
    if (finalObject.prep_time_minutes) confidence += 0.05;
    if (finalObject.cook_time_minutes) confidence += 0.05;
    if (finalObject.servings) confidence += 0.05;
    if (finalObject.cuisine) confidence += 0.05;

    return {
      ok: true,
      data: finalObject,
      confidence: Math.min(confidence, 1.0),
      language: finalObject.language || "en",
    };
  } catch (error) {
    if (creditDeducted && user) {
      await supabase.rpc("refund_ai_credits", { p_user_id: user.id, p_cost: 1 });
    }
    return { ok: false, error: `Structuring failed: ${error instanceof Error ? error.message : "Unknown"}` };
  }
}
