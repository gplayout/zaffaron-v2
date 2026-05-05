/**
 * Recipe structuring via Vercel AI SDK — STREAMING foundation (preserved).
 *
 * STATUS (2026-05-05 00:15 PDT, Phase 2.5 vault fix): NOT CURRENTLY ACTIVE.
 * The active /vault/create path uses raw fetch via lib/vault/structure.ts +
 * actions/vault.ts (IRON-LAW-compliant baseline).
 *
 * THIS FILE IS PRESERVED as the foundation for future client-streaming UX
 * (per Mehdi 2026-04-16 architecture review: "keep raw fetch() as baseline;
 * adopt Vercel AI SDK selectively for text streaming/typed outputs").
 *
 * To re-activate: build a Route Handler (per architecture review) that calls
 * structureRecipeStream() and pipes the ReadableStream to client via SSE/fetch
 * stream, with client-side useObject() consuming partial JSON updates.
 *
 * Uses @ai-sdk/openai (edge-compatible, NOT the bloated openai SDK).
 */
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema for structured recipe output
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
2. Keep ingredient names in their ORIGINAL language + add English translation in parentheses if not English
3. Keep instruction text in the ORIGINAL language
4. Extract quantities accurately — if vague ("a pinch"), keep the original wording
5. If something is unclear, include it as-is rather than guessing
6. Never invent ingredients or steps not in the original
7. Be conservative with time estimates — only if mentioned or clearly implied`;

export function streamRecipeStructure(title: string, rawText: string) {
  return streamObject({
    model: openai("gpt-5.2"),
    schema: recipeSchema,
    system: SYSTEM_PROMPT,
    prompt: `Recipe title: ${title}\n\nRaw recipe text:\n${rawText}`,
    temperature: 0.3,
  });
}
