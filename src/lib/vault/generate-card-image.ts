/**
 * Heritage Card Image Generator via Gemini 3 Pro Image (IRON LOCK model)
 * Uses raw fetch — NO SDK imports (Vercel bundler safe)
 */

export async function generateCardImage(
  title: string,
  attributionName?: string,
  cuisine?: string
): Promise<{ ok: true; imageBase64: string; mimeType: string } | { ok: false; error: string }> {
  try {
    const displayTitle = attributionName ? `${attributionName}'s ${title.replace(new RegExp(attributionName + "'s?", 'i'), '').trim()}` : title;

    const prompt = `Beautiful food photography share card for "${displayTitle}".
${cuisine ? `${cuisine} cuisine.` : ''}
Overhead shot on warm rustic wooden table, natural lighting, magazine quality.
Text overlay at bottom on semi-transparent dark banner:
- Main: "${displayTitle}" in warm cream serif font
- Small: "Preserved on Zaffaron Family Vault · zaffaron.com/vault"
Style: cozy, family heritage, warmth, appetizing.
Wide landscape format (1200x630). No watermarks. No redundant text.`;

    // F-kimi-6 fix (2026-04-26): use x-goog-api-key header instead of URL query param.
    // URL query exposes API key in server logs, reverse-proxy logs, Vercel function
    // logs, error reporting. Header keeps key in encrypted-at-rest infrastructure only.
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_AI_KEY ?? "",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["image", "text"] },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return { ok: false, error: `Gemini error: ${err.slice(0, 200)}` };
    }

    const data = await resp.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith("image/"));

    if (!imgPart?.inlineData) {
      return { ok: false, error: "No image in Gemini response" };
    }

    return {
      ok: true,
      imageBase64: imgPart.inlineData.data,
      mimeType: imgPart.inlineData.mimeType,
    };
  } catch (error) {
    return { ok: false, error: `Card generation failed: ${error instanceof Error ? error.message : "Unknown"}` };
  }
}
