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
    const prompt = `Professional food photography style share card for a family recipe called "${title}".
${attributionName ? `Recipe by ${attributionName}.` : ""}
${cuisine ? `${cuisine} cuisine.` : ""}
Beautiful overhead shot of the dish on a warm rustic wooden table.
Natural lighting, appetizing, magazine quality.
Include elegant text overlay at bottom: "${title}"${attributionName ? ` — by ${attributionName}` : ""}.
The text should be warm cream/gold color on a semi-transparent dark banner.
Style: cozy, family, heritage, warmth. NOT corporate or minimal.
Aspect ratio exactly 1200x630 (OG image size). No watermarks.`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${process.env.GOOGLE_AI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
