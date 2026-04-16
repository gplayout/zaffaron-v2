import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type TranscriptionResult =
  | { ok: true; text: string; language: string; duration_seconds: number }
  | { ok: false; error: string };

/**
 * Transcribe audio using OpenAI Whisper API.
 * Supports 99+ languages, auto-detects language.
 * Cost: ~$0.006/minute
 */
export async function transcribeAudio(
  audioFile: File
): Promise<TranscriptionResult> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    if (!transcription.text || transcription.text.trim().length === 0) {
      return { ok: false, error: "No speech detected in audio." };
    }

    return {
      ok: true,
      text: transcription.text,
      language: transcription.language || "unknown",
      duration_seconds: transcription.duration || 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Transcription failed:", message);
    return { ok: false, error: `Transcription failed: ${message}` };
  }
}
