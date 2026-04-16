import Link from "next/link";
import { Heart, ChefHat } from "lucide-react";

interface VaultCTAProps {
  recipeTitle: string;
  recipeSlug: string;
  cuisine?: string;
}

export function VaultCTA({ recipeTitle, recipeSlug, cuisine }: VaultCTAProps) {
  return (
    <section className="mt-10 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-900 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <Heart className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Does your family make this differently?
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Every family has their own version. Maybe your grandmother adds a secret ingredient, 
            or your aunt has a completely different technique. Preserve your family&apos;s version 
            — with their name on it, forever.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/vault/create?fork=${encodeURIComponent(recipeSlug)}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              <ChefHat className="h-4 w-4" />
              Save My Family&apos;s Version
            </Link>
            <Link
              href="/vault"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 transition hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Learn about Family Vault
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
