import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { generateCardImage } from "@/lib/vault/generate-card-image";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, attributionName, cuisine, shareSlug } = await request.json();
    if (!title || !shareSlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Generate image with Gemini 3 Pro Image (IRON LOCK)
    const result = await generateCardImage(title, attributionName, cuisine);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    // Upload to Supabase Storage
    const buffer = Buffer.from(result.imageBase64, "base64");
    const cardPath = `vault-cards/${shareSlug}.jpg`;

    const { error: uploadError } = await supabaseServer.storage
      .from("recipe-images")
      .upload(cardPath, buffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const cardUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${cardPath}`;

    // Update recipe with card URL (lookup by slug)
    await supabase.from("vault_recipes").update({ image_url: cardUrl }).eq("share_slug", shareSlug).eq("owner_id", user.id);

    return NextResponse.json({ ok: true, imageUrl: cardUrl });
  } catch (error) {
    console.error("Card generation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
