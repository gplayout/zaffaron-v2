"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Loader2, RotateCcw, Share2, Star } from "lucide-react";
import { rateTahdig } from "./actions";
import type { TahdigResult } from "./lib/scoring";
import { SITE_URL } from '@/lib/config';

type Phase = "upload" | "analyzing" | "result";

export default function TahdigPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TahdigResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file 🖼️");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10MB) 📏");
      return;
    }
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setPhase("analyzing");
    setError(null);

    const formData = new FormData();
    formData.append("photo", file);

    const resp = await rateTahdig(formData);
    if (resp.ok) {
      setResult(resp.result);
      setPhase("result");
    } else {
      setError(resp.error);
      setPhase("upload");
    }
  };

  const reset = () => {
    setPhase("upload");
    setPreview(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleShare = async () => {
    const text = result
      ? `My tahdig scored ${result.overall}/10 — "${result.badge.en}" ${result.badge.emoji}\nRate yours at zaffaron.com/tahdig`
      : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Tahdig Rater", text, url: `${SITE_URL}/tahdig` });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text + `\n${SITE_URL}/tahdig`);
      alert("Copied to clipboard! 📋");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          🍚 Tahdig Rater
        </h1>
        <p className="mt-2 text-lg text-stone-600">
          How good is YOUR tahdig? Let AI be the judge.
        </p>
        <p className="mt-1 text-sm text-stone-400">
          تهدیگت چند از ده میشه؟
        </p>
      </div>

      {/* Upload Phase */}
      {phase === "upload" && (
        <div className="space-y-4">
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-12 cursor-pointer transition hover:border-amber-400 hover:bg-amber-50"
            >
              <div className="flex gap-3">
                <Camera className="h-8 w-8 text-amber-500" />
                <Upload className="h-8 w-8 text-amber-500" />
              </div>
              <div className="text-center">
                <p className="font-medium text-stone-700">
                  Drop your tahdig photo here
                </p>
                <p className="text-sm text-stone-500 mt-1">
                  or tap to take a photo 📸
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Your tahdig"
                  className="w-full rounded-2xl object-cover max-h-80"
                />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                  aria-label="Remove photo"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-amber-500 py-3.5 text-lg font-bold text-white transition hover:bg-amber-600 active:scale-[0.98]"
              >
                Rate My Tahdig! 🔥
              </button>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {/* Privacy note */}
          <p className="text-xs text-center text-stone-400 mt-4">
            Your photo is analyzed by AI and never stored. 🔒
          </p>
        </div>
      )}

      {/* Analyzing Phase */}
      {phase === "analyzing" && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="relative">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Analyzing..."
                className="w-32 h-32 rounded-2xl object-cover opacity-80"
              />
            )}
            <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-amber-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-stone-700 animate-pulse">
              AI is judging your tahdig...
            </p>
            <p className="text-sm text-stone-500 mt-1">
              هوش مصنوعی داره تهدیگت رو بررسی می‌کنه...
            </p>
          </div>
        </div>
      )}

      {/* Result Phase */}
      {phase === "result" && result && (
        <div className="space-y-6">
          {/* Not tahdig? */}
          {!result.isTahdig ? (
            <div className="text-center space-y-4 py-8">
              <p className="text-6xl">🤔</p>
              <h2 className="text-2xl font-bold text-stone-800">
                Not Tahdig!
              </h2>
              <p className="text-stone-600">{result.rejectReason}</p>
              <button
                onClick={reset}
                className="rounded-xl bg-amber-500 px-8 py-3 font-bold text-white transition hover:bg-amber-600"
              >
                Try Again 🔄
              </button>
            </div>
          ) : (
            <>
              {/* Score Card */}
              <div
                ref={cardRef}
                className="rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 p-6 space-y-5"
              >
                {/* Photo + Overall Score */}
                <div className="flex gap-4 items-start">
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Your tahdig"
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div>
                    <div className="text-4xl font-black text-amber-600">
                      {result.overall}
                      <span className="text-lg font-normal text-stone-400">
                        /10
                      </span>
                    </div>
                    <div className="text-lg font-bold text-stone-700 mt-1">
                      {result.badge.emoji} {result.badge.en}
                    </div>
                    <div className="text-sm text-stone-500">
                      {result.badge.fa}
                    </div>
                  </div>
                </div>

                {/* Criteria Bars */}
                <div className="space-y-3">
                  {result.criteria.map((c, i) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-stone-700">
                          {c.name}{" "}
                          <span className="text-stone-400">{c.nameFa}</span>
                        </span>
                        <span className="font-bold text-amber-600">
                          {c.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 ease-out"
                          style={{
                            width: `${c.score * 10}%`,
                            transitionDelay: `${i * 200}ms`,
                          }}
                        />
                      </div>
                      {c.note && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          {c.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Commentary */}
                <div className="rounded-xl bg-white border border-stone-100 p-4 space-y-2">
                  <p className="text-sm text-stone-700 italic">
                    &ldquo;{result.commentary.en}&rdquo;
                  </p>
                  {result.commentary.fa && (
                    <p className="text-sm text-stone-500 italic" dir="rtl">
                      &ldquo;{result.commentary.fa}&rdquo;
                    </p>
                  )}
                </div>

                {/* Tips */}
                {result.tips.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-stone-700 mb-2">
                      💡 Tips to Level Up
                    </h3>
                    <ul className="space-y-1.5">
                      {result.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="text-sm text-stone-600 flex gap-2"
                        >
                          <Star className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Branding */}
                <div className="text-center pt-2 border-t border-stone-100">
                  <p className="text-xs text-stone-400">
                    🍚 zaffaron.com/tahdig — Rate YOUR tahdig
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-white transition hover:bg-amber-600"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <RotateCcw className="h-4 w-4" /> Rate Another
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* SEO / Landing Copy */}
      {phase === "upload" && !preview && (
        <div className="mt-12 space-y-6 text-center">
          <h2 className="text-xl font-bold text-stone-800">
            How It Works
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-3xl mb-2">📸</div>
              <p className="font-medium text-stone-700">Upload Photo</p>
              <p className="text-stone-500 mt-1">Snap or upload your tahdig</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤖</div>
              <p className="font-medium text-stone-700">AI Analyzes</p>
              <p className="text-stone-500 mt-1">5 criteria scored by AI</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🏆</div>
              <p className="font-medium text-stone-700">Get Your Score</p>
              <p className="text-stone-500 mt-1">Share with friends!</p>
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
            <p className="font-medium text-stone-700 mb-1">What we rate:</p>
            <p>Color 🎨 · Crispiness 🔥 · Evenness 📏 · Shape ⭕ · Presentation ✨</p>
          </div>
        </div>
      )}
    </div>
  );
}
