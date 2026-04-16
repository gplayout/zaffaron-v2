import type { Metadata } from "next";
import Link from "next/link";
import { ChefHat, Mic, Camera, Type, Heart, Share2, Lock, Globe } from "lucide-react";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Family Recipe Vault — Preserve Your Heritage",
  description:
    "Save your family's recipes forever. Record by voice, snap a photo of handwritten recipes, or type them in. AI structures everything beautifully. Private, secure, shareable.",
  alternates: { canonical: `${SITE_URL}/vault` },
  openGraph: {
    title: "Family Recipe Vault — Preserve Your Heritage",
    description:
      "Save your family's recipes forever. Voice, photo, or text — AI structures everything beautifully.",
    url: `${SITE_URL}/vault`,
    images: [{ url: "/og-default.jpg" }],
  },
};

const features = [
  {
    icon: Mic,
    title: "Record by Voice",
    description:
      "Speak your recipe in any language — Persian, Turkish, Arabic, Hindi, Greek, or 90+ more. Our AI transcribes and structures it perfectly.",
  },
  {
    icon: Camera,
    title: "Photo OCR (Coming Soon)",
    description:
      "Soon: snap a photo of a handwritten recipe card and our AI will read it. Currently in development.",
  },
  {
    icon: Type,
    title: "Type It In",
    description:
      "Prefer typing? Enter your recipe and our AI will organize ingredients, steps, and timing into a beautiful format.",
  },
  {
    icon: Heart,
    title: "Family Attribution",
    description:
      'Every recipe carries the name of who created it. "Maman Zahra\'s Ghormeh Sabzi" — preserved with love and respect.',
  },
  {
    icon: Share2,
    title: "Share with Family",
    description:
      "Share your recipe via link. Family multiplayer features (versions, notes) coming soon.",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description:
      "Your recipes are yours. Private by default. We never use family recipes to train AI. Delete everything instantly, anytime.",
  },
];

const steps = [
  {
    number: "1",
    title: "Upload Your Recipe",
    description: "Voice, photo, or text — however you have it.",
  },
  {
    number: "2",
    title: "AI Structures It",
    description: "Ingredients, steps, timing — all beautifully organized.",
  },
  {
    number: "3",
    title: "Review & Approve",
    description: "You always see the original alongside the AI output. Nothing saves without your OK.",
  },
  {
    number: "4",
    title: "Share & Preserve",
    description: "A beautiful heritage card, shareable with your whole family.",
  },
];

export default function VaultLandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 mb-6">
          <Globe className="h-4 w-4" />
          99+ languages supported
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 dark:text-stone-100 leading-tight mb-6">
          Every family has recipes<br />
          <span className="text-amber-600">worth preserving forever</span>
        </h1>
        <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-8">
          Your grandmother&apos;s recipes live in her memory. When she&apos;s gone, they&apos;re gone too.
          Zaffaron Vault preserves them — beautifully, privately, forever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/vault/create"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-amber-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
          >
            <ChefHat className="h-5 w-5" />
            Start Preserving — Free
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-amber-600 transition"
          >
            See how it works ↓
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="mb-16 text-center">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Join families from around the world preserving their culinary heritage
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-2xl">
          <span>🇮🇷</span><span>🇹🇷</span><span>🇦🇫</span><span>🇱🇧</span>
          <span>🇮🇳</span><span>🇲🇦</span><span>🇬🇷</span><span>🇦🇿</span>
          <span>🇲🇽</span><span>🇮🇹</span><span>🇯🇵</span><span>🇰🇷</span>
          <span>🇨🇳</span><span>🇪🇹</span><span>🇳🇬</span><span>🇧🇷</span>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 text-center mb-10">
          How It Works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-lg font-bold text-amber-700 dark:text-amber-400">
                {step.number}
              </div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 text-center mb-10">
          Everything You Need
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm transition hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600"
            >
              <feature.icon className="h-8 w-8 text-amber-600 mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA from Library */}
      <section className="mb-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-900 border border-amber-200 dark:border-stone-700 p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
          Already browsing our {" "}
          <Link href="/recipes" className="text-amber-600 hover:underline">
            1,900+ recipes
          </Link>
          ?
        </h2>
        <p className="text-stone-600 dark:text-stone-400 max-w-xl mx-auto mb-6">
          Does your family make any of them differently? Save your family&apos;s version
          with personal notes, secret ingredients, and the name of who taught you.
        </p>
        <Link
          href="/vault/create"
          className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-amber-700"
        >
          Save Your Family&apos;s Version
        </Link>
      </section>

      {/* Privacy Promise */}
      <section className="text-center mb-16">
        <Lock className="h-12 w-12 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Your Recipes. Your Rules.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-stone-600 dark:text-stone-400 mt-4">
          <span className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Private by default
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Never used to train AI
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Delete anytime, instantly
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Export coming soon
          </span>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12 border-t border-stone-200 dark:border-stone-700">
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 mb-4">
          Don&apos;t let family recipes disappear
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-lg mx-auto">
          Start preserving today. It&apos;s free, private, and takes less than 2 minutes.
        </p>
        <Link
          href="/vault/create"
          className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-amber-700 hover:shadow-xl"
        >
          <ChefHat className="h-6 w-6" />
          Start Preserving — Free
        </Link>
      </section>
    </div>
  );
}
