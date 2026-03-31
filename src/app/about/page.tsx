import type { Metadata } from "next";
import { ChefHat, Heart, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Zaffaron brings you authentic, tested recipes from the heart of Persian cuisine and beyond.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        About <span className="text-amber-600">Zaffaron</span>
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-stone-600">
        Zaffaron (زعفران) is named after saffron — the golden spice at the heart of
        Persian cooking. We believe great recipes should be accessible, accurate, and
        beautiful. No life stories before the recipe. No vague measurements. No guesswork.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        <div className="text-center">
          <Shield className="mx-auto h-8 w-8 text-amber-600" />
          <h3 className="mt-3 font-semibold">Tested & Verified</h3>
          <p className="mt-1 text-sm text-stone-500">
            Every recipe is cross-referenced against authoritative sources and
            verified for accuracy before publishing.
          </p>
        </div>
        <div className="text-center">
          <ChefHat className="mx-auto h-8 w-8 text-amber-600" />
          <h3 className="mt-3 font-semibold">Persian Heritage</h3>
          <p className="mt-1 text-sm text-stone-500">
            We specialize in authentic Persian cuisine — from classic stews and
            rice dishes to kebabs and sweets.
          </p>
        </div>
        <div className="text-center">
          <Heart className="mx-auto h-8 w-8 text-amber-600" />
          <h3 className="mt-3 font-semibold">Made with Care</h3>
          <p className="mt-1 text-sm text-stone-500">
            Clear instructions, exact measurements, helpful tips. Every recipe
            is written so a beginner can succeed.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-2xl font-bold">Our Mission</h2>
      <p className="mt-3 text-stone-600 leading-relaxed">
        Persian food is one of the world&apos;s great cuisines, yet it remains
        underrepresented online. Zaffaron exists to change that — starting with the
        most reliable, well-tested Persian recipes on the internet, then expanding to
        share the best of Middle Eastern and world cuisine.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Contact</h2>
      <p className="mt-3 text-stone-600">
        Questions, corrections, or partnership inquiries?{" "}
        <a href="mailto:hello@zaffaron.com" className="text-amber-600 underline hover:text-amber-700">
          hello@zaffaron.com
        </a>
      </p>
    </article>
  );
}
