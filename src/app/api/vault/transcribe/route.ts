import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/vault/transcribe";
import { structureRecipeText } from "@/lib/vault/structure";

export const maxDuration = 30; // Allow 30s for transcription + structuring

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

    // Size limit: 25MB (Whisper limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 25MB)" }, { status: 400 });
    }

    // Step 1: Transcribe audio
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const transcription = await transcribeAudio(audioBuffer, audioFile.name || "recording.webm");

    if (!transcription.ok) {
      return NextResponse.json({ error: transcription.error }, { status: 422 });
    }

    // Step 2: Structure the transcript into a recipe
    const structured = await structureRecipeText(transcription.text, title);

    if (!structured.ok) {
      // Return transcript even if structuring fails (user can still use it)
      return NextResponse.json({
        transcript: transcription.text,
        language: transcription.language,
        duration: transcription.duration_seconds,
        structureError: structured.error,
      }, { status: 200 });
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
