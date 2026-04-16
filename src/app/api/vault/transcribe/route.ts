import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/vault/transcribe";
import { structureRecipeText } from "@/lib/vault/structure";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const title = formData.get("title") as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: "Recipe title required" }, { status: 400 });
    }
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio too large (max 25MB)" }, { status: 400 });
    }

    const transcription = await transcribeAudio(audioFile);
    if (!transcription.ok) {
      return NextResponse.json({ error: transcription.error }, { status: 422 });
    }

    const structured = await structureRecipeText(transcription.text, title);
    if (!structured.ok) {
      return NextResponse.json({
        transcript: transcription.text,
        language: transcription.language,
        duration: transcription.duration_seconds,
        structureError: structured.error,
      });
    }

    return NextResponse.json({
      transcript: transcription.text,
      language: transcription.language,
      duration: transcription.duration_seconds,
      structured: structured.data,
      confidence: structured.confidence,
    });
  } catch (error) {
    console.error("Transcribe API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
