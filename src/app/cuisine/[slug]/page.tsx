import { notFound } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { getRecipesByCuisine, getCuisineRecipeCount } from "@/lib/api/recipes";
import { getCuisine, getAllCuisineSlugs } from "@/lib/cuisines";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";
import { humanize } from "@/lib/formatting";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllCuisineSlugs().map((slug) => ({ slug }));
}

const PAGE_SIZE = 24;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cuisine = getCuisine(slug);

  if (!cuisine) {
    const count = await getCuisineRecipeCount(slug);
    if (count === 0) return { title: "Not Found", robots: { index: false } };
    return {
      // NOTE: layout.tsx applies the site template ("%s — Zaffaron").
      // Avoid repeating the brand name here.
      title: `${humanize(slug)} Recipes`,
      description: `Browse our collection of authentic ${humanize(slug).toLowerCase()} recipes.`,
      alternates: { canonical: `https://zaffaron.com/cuisine/${slug}` },
    };
  }

  return {
    // NOTE: layout.tsx applies the site template ("%s — Zaffaron").
    // Avoid repeating the brand name here.
    title: `${cuisine.name} Recipes`,
    description: cuisine.description,
    alternates: { canonical: `https://zaffaron.com/cuisine/${slug}` },
    openGraph: {
      title: `${cuisine.name} Recipes — Zaffaron`,
      description: cuisine.description,
      url: `https://zaffaron.com/cuisine/${slug}`,
    },
  };
}

export default async function CuisinePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1);
  const cuisine = getCuisine(slug);

  const { recipes: items, count } = await getRecipesByCuisine(slug, page, PAGE_SIZE);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  // 404 for unknown cuisines with no recipes
  if (items.length === 0 && !cuisine) {
    notFound();
  }

  const title = cuisine?.name ? `${cuisine.name} Recipes` : `${humanize(slug)} Recipes`;
  const description = cuisine?.description || `Browse our collection of authentic ${humanize(slug).toLowerCase()} recipes.`;

  // ItemList JSON-LD for cuisine hub
  const itemListSchema = items.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: count,
    itemListElement: items.map((r, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * PAGE_SIZE + i + 1,
      url: `https://zaffaron.com/recipe/${r.slug}`,
      name: r.title,
    })),
  } : null;

  return (
    <>
      {/* Structured Data */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
        />
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span className="mx-1.5 text-stone-300">›</span>
        <span className="text-stone-700 font-medium">{title}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {cuisine?.emoji && <span className="mr-2">{cuisine.emoji}</span>}
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-stone-500">{description}</p>
        <p className="mt-2 text-sm text-stone-400">{count || items.length} recipes</p>
      </div>

      {/* Cultural context (hub page content for SEO) */}
      {cuisine?.cultural_context && (
        <div className="mb-8 rounded-xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-sm leading-relaxed text-stone-600">{cuisine.cultural_context}</p>
        </div>
      )}

      {/* Pantry Essentials */}
      {cuisine?.pantry_essentials && cuisine.pantry_essentials.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-stone-800 mb-3">🧂 Essential Pantry</h2>
          <div className="flex flex-wrap gap-2">
            {cuisine.pantry_essentials.map((item) => (
              <span key={item} className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm text-amber-800">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sub-categories */}
      {cuisine?.sub_categories && cuisine.sub_categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-stone-800 mb-3">📂 Categories</h2>
          <div className="flex flex-wrap gap-2">
            {cuisine.sub_categories.map((cat) => (
              <span key={cat} className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-sm text-stone-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-stone-400">No recipes in this cuisine yet.</p>
          <p className="text-sm text-stone-400 mt-2">Check back soon — we&apos;re adding new recipes regularly!</p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((recipe, i) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} priority={i < 6} />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/cuisine/${slug}?page=${page - 1}`} className="rounded-lg bg-stone-100 px-4 py-2 text-sm hover:bg-amber-100">
              ← Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-stone-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/cuisine/${slug}?page=${page + 1}`} className="rounded-lg bg-stone-100 px-4 py-2 text-sm hover:bg-amber-100">
              Next →
            </Link>
          )}
        </nav>
      )}

      {/* Related Cuisines */}
      {cuisine?.related_cuisines && cuisine.related_cuisines.length > 0 && (
        <div className="mt-12 border-t border-stone-200 pt-8">
          <h2 className="text-lg font-bold text-stone-800 mb-3">🌍 Related Cuisines</h2>
          <div className="flex flex-wrap gap-2">
            {cuisine.related_cuisines.map((relSlug) => {
              const rel = getCuisine(relSlug);
              return (
                <Link
                  key={relSlug}
                  href={`/cuisine/${relSlug}`}
                  className="rounded-full bg-stone-100 border border-stone-200 px-4 py-1.5 text-sm text-stone-600 transition hover:bg-amber-50 hover:border-amber-200"
                >
                  {rel?.emoji} {rel?.name || humanize(relSlug)}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
