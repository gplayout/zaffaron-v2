export type TranscriptionResult =
  | { ok: true; text: string; language: string; duration_seconds: number }
  | { ok: false; error: string };

export async function transcribeAudio(
  audioFile: File
): Promise<TranscriptionResult> {
  try {
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: formData,
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { ok: false, error: `Whisper error: ${err.slice(0, 200)}` };
    }

    const data = await resp.json();
    if (!data.text?.trim()) return { ok: false, error: "No speech detected." };

    return {
      ok: true,
      text: data.text,
      language: data.language || "unknown",
      duration_seconds: data.duration || 0,
    };
  } catch (error) {
    return { ok: false, error: `Failed: ${error instanceof Error ? error.message : "Unknown"}` };
  }
}
