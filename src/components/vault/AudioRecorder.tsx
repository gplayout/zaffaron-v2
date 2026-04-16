"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";

interface AudioRecorderProps {
  onTranscription: (data: {
    transcript: string;
    language: string;
    structured?: Record<string, unknown>;
    confidence?: number;
  }) => void;
  title: string;
  disabled?: boolean;
}

export default function AudioRecorder({ onTranscription, title, disabled }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) {
          setError("Recording too short. Please try again.");
          return;
        }

        setProcessing(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          formData.append("title", title || "Untitled Recipe");

          const resp = await fetch("/api/vault/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await resp.json();

          if (!resp.ok) {
            setError(data.error || "Transcription failed");
            return;
          }

          onTranscription({
            transcript: data.transcript,
            language: data.language,
            structured: data.structured,
            confidence: data.confidence,
          });
        } catch {
          setError("Failed to process audio. Please try again.");
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone in browser settings.");
      } else {
        setError("Could not start recording. Please check your microphone.");
      }
    }
  }, [title, onTranscription]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {processing ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <div>
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Processing your recording...</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Transcribing + structuring (10-20 seconds)</p>
          </div>
        </div>
      ) : recording ? (
        <div className="flex items-center gap-4">
          <button
            onClick={stopRecording}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600 animate-pulse"
          >
            <Square className="h-6 w-6" />
          </button>
          <div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Recording... {formatTime(duration)}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Speak your recipe clearly. Tap to stop.</p>
          </div>
        </div>
      ) : (
        <button
          onClick={startRecording}
          disabled={disabled || !title.trim()}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 p-4 text-left transition hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Mic className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Record by Voice</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Speak your recipe in any language — 99+ supported</p>
          </div>
        </button>
      )}
    </div>
  );
}
