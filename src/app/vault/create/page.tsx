"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Loader2, Check, AlertCircle, Sparkles } from "lucide-react";
import { structureRecipe, saveVaultRecipe } from "@/app/actions/vault";
import type { VaultStructuredData } from "@/lib/vault/types";
import { useAuth } from "@/components/AuthProvider";
// import AudioRecorder from "@/components/vault/AudioRecorder"; // temporarily disabled for deploy fix

type Step = "input" | "processing" | "review" | "saving" | "done";
type InputMode = "text" | "voice";

export default function VaultCreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [attributionName, setAttributionName] = useState("");
  const [attributionStory, setAttributionStory] = useState("");
  const [structuredData, setStructuredData] = useState<VaultStructuredData | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState<string | null>(null);

  async function handleStructure() {
    if (!title.trim() || !rawText.trim()) {
      setError("Please enter a title and recipe text.");
      return;
    }
    setError(null);
    setStep("processing");

    const result = await structureRecipe(title, rawText);
    if (!result.ok) {
      setError(result.error);
      setStep("input");
      return;
    }

    setStructuredData(result.data);
    setConfidence(result.confidence);
    setLanguage(result.language);
    setStep("review");
  }

  async function handleSave() {
    if (!structuredData) return;

    if (!user) {
      // Redirect to login with return URL
      router.push(`/auth/login?redirect=${encodeURIComponent("/vault/create")}`);
      return;
    }

    setStep("saving");
    const result = await saveVaultRecipe(
      title,
      rawText,
      structuredData,
      attributionName || undefined,
      attributionStory || undefined
    );

    if (!result.ok) {
      setError(result.error);
      setStep("review");
      return;
    }

    setStep("done");
    // Redirect to vault recipe view
    setTimeout(() => router.push(`/vault/recipe/${result.slug}`), 1500);
  }

  function handleBackToEdit() {
    setStep("input");
    setStructuredData(null);
  }

  function handleVoiceTranscription(data: {
    transcript: string;
    language: string;
    structured?: Record<string, unknown>;
    confidence?: number;
  }) {
    setRawText(data.transcript);
    setLanguage(data.language);

    if (data.structured) {
      setStructuredData(data.structured as unknown as VaultStructuredData);
      setConfidence(data.confidence || 0.7);
      setStep("review");
    } else {
      // Transcript only — user can edit and then structure
      setInputMode("text");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
          Preserve a Family Recipe
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Type your recipe below. Our AI will structure it beautifully.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        {[
          { key: "input", label: "Write" },
          { key: "processing", label: "AI Structuring" },
          { key: "review", label: "Review" },
          { key: "done", label: "Saved" },
        ].map((s, i) => {
          const isActive = s.key === step || (step === "saving" && s.key === "review");
          const isDone =
            (s.key === "input" && step !== "input") ||
            (s.key === "processing" && ["review", "saving", "done"].includes(step)) ||
            (s.key === "review" && step === "done");
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className="h-px w-8 bg-stone-300 dark:bg-stone-600" />}
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-amber-600 text-white"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`hidden sm:inline ${
                  isActive ? "font-semibold text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Input */}
      {step === "input" && (
        <div className="space-y-6">
          {/* Input Mode Tabs */}
          <div className="flex rounded-lg border border-stone-200 dark:border-stone-700 p-1 bg-stone-100 dark:bg-stone-800">
            <button
              onClick={() => setInputMode("text")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                inputMode === "text"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
              }`}
            >
              ⌨️ Type Recipe
            </button>
            <button
              onClick={() => setInputMode("voice")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                inputMode === "voice"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
              }`}
            >
              🎤 Record Voice
            </button>
          </div>

          <div>
            <label htmlFor="recipe-title" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Recipe Name *
            </label>
            <input
              id="recipe-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Maman Zahra's Ghormeh Sabzi"
              className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Text Input Mode */}
          {inputMode === "text" && (
            <div>
              <label htmlFor="recipe-text" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                Recipe (in any language) *
              </label>
              <textarea
                id="recipe-text"
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"Type or paste your recipe here...\n\nFor example:\n2 cups dried herbs (parsley, cilantro, fenugreek)\n500g lamb, cubed\n3 dried limes\n\n1. Fry the herbs until dark green...\n2. Brown the meat with turmeric..."}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono text-sm"
              />
              <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                Write in any language — Persian, Turkish, Arabic, Hindi, English, or any other. Our AI supports 99+ languages.
              </p>
            </div>
          )}

          {/* Voice Input Mode — temporarily disabled for deploy fix */}
          {inputMode === "voice" && (
            <div>
              <p className="text-center text-stone-500 dark:text-stone-400 py-8">Voice recording coming soon! Use text input for now.</p>
              {rawText && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Transcript (edit if needed)
                  </label>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-3 text-stone-900 dark:text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono text-sm"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="attribution-name" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                Who taught you this recipe?
              </label>
              <input
                id="attribution-name"
                type="text"
                value={attributionName}
                onChange={(e) => setAttributionName(e.target.value)}
                placeholder="e.g., Maman Zahra, Nonna Maria, Yiayia Elena"
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label htmlFor="attribution-story" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                Family story (optional)
              </label>
              <input
                id="attribution-story"
                type="text"
                value={attributionStory}
                onChange={(e) => setAttributionStory(e.target.value)}
                placeholder="e.g., She always made this on Friday nights..."
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <button
            onClick={handleStructure}
            disabled={!title.trim() || !rawText.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-5 w-5" />
            Structure with AI
          </button>
        </div>
      )}

      {/* STEP 2: Processing */}
      {step === "processing" && (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-600" />
          <p className="mt-4 text-lg font-medium text-stone-700 dark:text-stone-300">
            Reading your recipe...
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Identifying ingredients, steps, and timing
          </p>
        </div>
      )}

      {/* STEP 3: Review (Side-by-Side) */}
      {step === "review" && structuredData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Review AI Output
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-medium ${confidence >= 0.8 ? "text-green-600" : confidence >= 0.6 ? "text-amber-600" : "text-red-600"}`}>
                {Math.round(confidence * 100)}% confidence
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-500 dark:text-stone-400">
                Detected: {language.toUpperCase()}
              </span>
            </div>
          </div>

          {confidence < 0.7 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Low confidence — please review carefully. Some fields may need correction.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Original Text */}
            <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Your Original Text
              </h3>
              <p className="mb-2 font-semibold text-stone-900 dark:text-stone-100">{title}</p>
              <pre className="whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300 font-mono">
                {rawText}
              </pre>
            </div>

            {/* AI Structured */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-stone-800 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-600">
                AI Structured Output
              </h3>

              {structuredData.cuisine && (
                <p className="mb-2 text-xs text-stone-500 dark:text-stone-400">
                  Cuisine: {structuredData.cuisine} • Category: {structuredData.category || "—"}
                </p>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  Ingredients ({structuredData.ingredients.length})
                </h4>
                <ul className="space-y-1">
                  {structuredData.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm text-stone-700 dark:text-stone-300">
                      <span className="font-medium">{ing.amount} {ing.unit}</span>{" "}
                      {ing.item}
                      {ing.note && <span className="text-stone-400"> ({ing.note})</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  Instructions ({structuredData.instructions.length} steps)
                </h4>
                <ol className="space-y-2">
                  {structuredData.instructions.map((inst) => (
                    <li key={inst.step} className="text-sm text-stone-700 dark:text-stone-300">
                      <span className="font-semibold text-amber-600">Step {inst.step}:</span>{" "}
                      {inst.text}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-stone-500 dark:text-stone-400">
                {structuredData.prep_time_minutes && (
                  <span>Prep: {structuredData.prep_time_minutes}min</span>
                )}
                {structuredData.cook_time_minutes && (
                  <span>Cook: {structuredData.cook_time_minutes}min</span>
                )}
                {structuredData.servings && <span>Serves: {structuredData.servings}</span>}
                {structuredData.difficulty && <span>Difficulty: {structuredData.difficulty}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBackToEdit}
              className="flex-1 rounded-lg border border-stone-300 dark:border-stone-600 px-6 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              ← Back to Edit
            </button>
            <button
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              {user ? "Looks Good — Save to Vault" : "Sign In & Save"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Saving / Done */}
      {(step === "saving" || step === "done") && (
        <div className="py-16 text-center">
          {step === "saving" ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600" />
              <p className="mt-4 text-lg font-medium text-stone-700 dark:text-stone-300">
                Saving to your vault...
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">
                Recipe Preserved! 🧡
              </p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Redirecting to your recipe...
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
