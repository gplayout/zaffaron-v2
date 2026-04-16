"use client";

import { useState } from "react";
import { Share2, Lock, Globe, Trash2, Copy, Check } from "lucide-react";

interface Props {
  recipeId: string;
  slug: string;
  visibility: string;
}

export default function VaultRecipeActions({ recipeId, slug, visibility: initialVisibility }: Props) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shareUrl = `${window.location.origin}/vault/recipe/${slug}`;

  async function toggleVisibility() {
    const newVis = visibility === "private" ? "public" : "private";
    try {
      const res = await fetch("/api/vault/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, visibility: newVis }),
      });
      if (res.ok) {
        setVisibility(newVis);
      } else {
        alert("Failed to update visibility. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/vault/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) window.location.href = "/vault";
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-4">
      <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mr-auto">
        Your Recipe
      </span>

      <button
        onClick={toggleVisibility}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        {visibility === "private" ? (
          <>
            <Lock className="h-3.5 w-3.5" /> Private — Make Public
          </>
        ) : (
          <>
            <Globe className="h-3.5 w-3.5" /> Public — Make Private
          </>
        )}
      </button>

      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-600" /> Copied!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copy Link
          </>
        )}
      </button>

      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: "Family Recipe", url: shareUrl });
          } else {
            copyLink();
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
