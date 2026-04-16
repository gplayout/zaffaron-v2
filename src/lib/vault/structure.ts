/**
 * Recipe structuring via raw fetch to OpenAI API.
 * NO openai SDK import — Vercel bundler crashes with the SDK in API routes.
 */
import type { VaultStructuredData, StructureResult } from "./types";

const SYSTEM_PROMPT = `You are a recipe structuring assistant for Zaffaron, a global family recipe vault.

Your job: Take raw recipe text (in ANY language) and extract structured data.

RULES:
1. Detect the language automatically
2. Keep ingredient names in their ORIGINAL language + add English translation in parentheses if not English
3. Keep instruction text in the ORIGINAL language
4. Extract quantities accurately — if vague ("a pinch", "some"), keep the original wording
5. If something is unclear, include it as-is rather than guessing
6. Never invent ingredients or steps that aren't in the original
7. Be conservative with time estimates — only include if mentioned or clearly implied

Output ONLY valid JSON matching this schema:
{
  "ingredients": [{"item": "string", "amount": "string", "unit": "string", "note": "string (optional)"}],
  "instructions": [{"step": 1, "text": "string"}],
  "prep_time_minutes": number or null,
  "cook_time_minutes": number or null,
  "servings": number or null,
  "difficulty": "easy" | "medium" | "hard" or null,
  "cuisine": "string or null (detected cuisine)",
  "category": "string or null (main course, dessert, soup, etc.)",
  "language": "string (ISO 639-1 code of the original text)"
}`;

export async function structureRecipeText(
  rawText: string,
  title: string
): Promise<StructureResult> {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Recipe title: ${title}\n\nRaw recipe text:\n${rawText}` },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { ok: false, error: `OpenAI error: ${err.slice(0, 200)}` };
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { ok: false, error: "No response from AI" };

    const parsed = JSON.parse(content) as VaultStructuredData;

    if (!parsed.ingredients || !Array.isArray(parsed.ingredients)) {
      return { ok: false, error: "AI did not return valid ingredients" };
    }
    if (!parsed.instructions || !Array.isArray(parsed.instructions)) {
      return { ok: false, error: "AI did not return valid instructions" };
    }

    let confidence = 0.5;
    if (parsed.ingredients.length >= 2) confidence += 0.15;
    if (parsed.instructions.length >= 2) confidence += 0.15;
    if (parsed.prep_time_minutes) confidence += 0.05;
    if (parsed.cook_time_minutes) confidence += 0.05;
    if (parsed.servings) confidence += 0.05;
    if (parsed.cuisine) confidence += 0.05;
    confidence = Math.min(confidence, 1.0);

    return {
      ok: true,
      data: parsed,
      confidence,
      language_detected: parsed.language || "en",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: `Structuring failed: ${message}` };
  }
}
