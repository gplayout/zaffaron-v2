import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server-auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipeId } = await request.json();
    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID required" }, { status: 400 });
    }

    // RLS ensures only owner can delete
    const { error } = await supabase
      .from("vault_recipes")
      .delete()
      .eq("id", recipeId)
      .eq("owner_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
