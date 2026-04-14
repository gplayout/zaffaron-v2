import type { Metadata } from "next";
import { ChefHat, Heart, Shield, Globe } from "lucide-react";
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: "About",
  description: "Zaffaron brings you authentic, tested recipes from Persian, Turkish, Indian, Moroccan, Greek, and world cuisines. Every recipe verified.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        About <span className="text-amber-600">Zaffaron</span>
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-stone-600">
        Zaffaron (زعفران) is named after saffron — the golden thread that connects
        kitchens across the world, from Persian stews to Moroccan tagines, Indian biryanis
        to Greek pastries. We believe great recipes should be accessible, accurate, and
        beautiful. No life stories before the recipe. No vague measurements. No guesswork.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
          <h3 className="mt-3 font-semibold">Persian Roots</h3>
          <p className="mt-1 text-sm text-stone-500">
            We started with Persian cuisine — saffron rice, herb stews, and kebabs —
            and grew to embrace the world&apos;s kitchens.
          </p>
        </div>
        <div className="text-center">
          <Globe className="mx-auto h-8 w-8 text-amber-600" />
          <h3 className="mt-3 font-semibold">8 Cuisines & Growing</h3>
          <p className="mt-1 text-sm text-stone-500">
            Persian, Turkish, Afghan, Lebanese, Azerbaijani, Indian, Moroccan,
            and Greek — with more on the way.
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
        The world&apos;s most vibrant cuisines often remain underrepresented online.
        Zaffaron exists to change that — starting with Persian food as our foundation,
        then expanding through the &quot;saffron belt&quot; of cuisines that share ingredients,
        techniques, and stories. From Turkish mezes to Indian curries, Moroccan tagines
        to Greek seafood, every recipe is researched, verified, and presented with the
        cultural context it deserves.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Contact</h2>
      <p className="mt-3 text-stone-600">
        Questions, corrections, or partnership inquiries?{" "}
        <a href="/contact" className="text-amber-600 underline hover:text-amber-700">
          Get in touch
        </a>.
      </p>
    </article>
  );
}
