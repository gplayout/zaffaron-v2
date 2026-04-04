import { notFound } from "next/navigation";
import Link from "next/link";
import { getIngredient, getAllIngredientSlugs } from "@/lib/ingredients";
import { supabaseServer } from "@/lib/supabase-server";
import { humanize } from "@/lib/formatting";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllIngredientSlugs().map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ingredient = getIngredient(slug);
  if (!ingredient) return { title: "Not Found" };

  const firstLocal = Object.values(ingredient.localNames)[0] || "";
  return {
    title: `${ingredient.name}${firstLocal ? ` (${firstLocal})` : ""} - Complete Guide | Zaffaron`,
    description: ingredient.description.slice(0, 155) + "...",
    alternates: { canonical: `https://zaffaron.com/ingredients/${slug}` },
    openGraph: {
      title: `${ingredient.name} - Everything You Need to Know`,
      description: ingredient.description.slice(0, 155) + "...",
      url: `https://zaffaron.com/ingredients/${slug}`,
    },
  };
}

export default async function IngredientPage({ params }: Props) {
  const { slug } = await params;
  const ingredient = getIngredient(slug);
  if (!ingredient) notFound();

  // Find recipes that use this ingredient
  const allLocalNames = Object.values(ingredient.localNames);
  const searchTerms = [ingredient.name.toLowerCase(), ...allLocalNames.map(n => n.split('(')[0].trim())];
  const { data: relatedRecipes } = await supabaseServer
    .from("recipes_v2")
    .select("slug,title,cuisine_slug,image_url")
    .eq("published", true)
    .or(searchTerms.map(t => `ingredients::text.ilike.%${t}%`).join(","))
    .order("published_at", { ascending: false })
    .limit(12);

  return (
    <article className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span className="mx-1.5 text-stone-300">›</span>
        <Link href="/ingredients" className="hover:text-amber-600">Ingredients</Link>
        <span className="mx-1.5 text-stone-300">›</span>
        <span className="text-stone-700 font-medium">{ingredient.name}</span>
      </nav>

      {/* Hero */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {ingredient.emoji} {ingredient.name}
        </h1>

        {/* Local names across cultures */}
        {Object.keys(ingredient.localNames).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(ingredient.localNames).map(([lang, localName]) => (
              <span
                key={lang}
                className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-sm text-stone-600"
              >
                <span className="font-medium capitalize text-stone-700">{lang}:</span> {localName}
              </span>
            ))}
          </div>
        )}
        <p className="mt-3 text-lg leading-relaxed text-stone-600">{ingredient.description}</p>

        {/* Cuisine tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {ingredient.cuisines.map((c) => (
            <Link
              key={c}
              href={`/cuisine/${c}`}
              className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm text-amber-800 hover:bg-amber-100 transition"
            >
              {humanize(c)}
            </Link>
          ))}
        </div>
      </header>

      {/* History & Culture */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-stone-800 mb-3">📜 History & Culture</h2>
        <p className="text-stone-600 leading-relaxed">{ingredient.history}</p>
      </section>

      {/* Buying Guide */}
      <section className="mb-8 rounded-xl border border-stone-200 bg-stone-50 p-6">
        <h2 className="text-xl font-bold text-stone-800 mb-3">🛒 Buying Guide</h2>
        <div className="text-stone-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: ingredient.buyingGuide.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      </section>

      {/* Storage */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-stone-800 mb-3">🏺 Storage & Shelf Life</h2>
        <p className="text-stone-600 leading-relaxed">{ingredient.storage}</p>
      </section>

      {/* Substitutes */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-stone-800 mb-3">🔄 Substitutes</h2>
        <div className="space-y-3">
          {ingredient.substitutes.map((sub) => (
            <div key={sub.name} className="rounded-lg border border-stone-200 p-4">
              <h3 className="font-semibold text-stone-800">{sub.name}</h3>
              <p className="mt-1 text-sm text-stone-500">{sub.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Recipes */}
      {relatedRecipes && relatedRecipes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-stone-800 mb-3">
            🍽️ Recipes with {ingredient.name} ({relatedRecipes.length}+)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedRecipes.map((r) => (
              <Link
                key={r.slug}
                href={`/recipe/${r.slug}`}
                className="group rounded-lg border border-stone-200 p-3 transition hover:shadow-md hover:border-amber-200"
              >
                <h3 className="text-sm font-semibold text-stone-800 line-clamp-2 group-hover:text-amber-700">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs text-stone-400">{humanize(r.cuisine_slug || "")}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${ingredient.name}${allLocalNames[0] ? ` (${allLocalNames[0]})` : ''} — Complete Guide`,
            description: ingredient.description,
            url: `https://zaffaron.com/ingredients/${ingredient.slug}`,
            publisher: { "@type": "Organization", name: "Zaffaron" },
          }),
        }}
      />
    </article>
  );
}
