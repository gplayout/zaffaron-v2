import { notFound } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { getRecipesByCategory, getCategorySlugs, getCategoryRecipeCount } from "@/lib/api/recipes";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const categoryDescriptions: Record<string, { title: string; emoji: string; description: string }> = {
  stew: { title: "Stew Recipes", emoji: "🍲", description: "Rich, slow-cooked stews from around the world — Persian Ghormeh Sabzi, Moroccan tagines, Greek stifado, and Indian curries. These dishes reward patience with extraordinary depth of flavor." },
  rice: { title: "Rice Dishes", emoji: "🍚", description: "From Persian saffron tahdig to Indian biryani, Afghan Kabuli Palaw to Azerbaijani plov — explore rice dishes that are the centerpiece of cuisines across the saffron belt." },
  kebab: { title: "Kebab Recipes", emoji: "🍢", description: "Grilled perfection from every tradition — Persian Koobideh, Turkish Adana, Afghan Chopan, Lebanese Shish Tawook, and Greek Souvlaki. Master the art of fire and spice." },
  appetizer: { title: "Appetizers & Sides", emoji: "🥗", description: "Start your feast with creamy hummus, smoky baba ganoush, Greek saganaki, Indian samosas, and Moroccan zaalouk — small plates with big flavor." },
  soup: { title: "Soup Recipes", emoji: "🥣", description: "Hearty, nourishing soups — from Persian Ash Reshteh to Moroccan Harira, Turkish Mercimek to Greek Avgolemono. Warmth in every bowl." },
  dessert: { title: "Desserts & Sweets", emoji: "🍮", description: "Sweet endings from every kitchen — Persian Sholeh Zard, Turkish Baklava, Indian Gulab Jamun, Moroccan Chebakia, and Greek Galaktoboureko." },
  drink: { title: "Drinks & Beverages", emoji: "🥛", description: "Traditional beverages — Persian Doogh, Indian Lassi, Moroccan Mint Tea, and Afghan Qaimaq Chai. The perfect complement to any meal." },
  breakfast: { title: "Breakfast Recipes", emoji: "🍳", description: "Morning traditions from around the world — Turkish Menemen, Indian Upma, Lebanese Manoushe, and Greek Bougatsa." },
  main: { title: "Main Courses", emoji: "🍽️", description: "Complete main dishes from 8 cuisines — curries, tagines, roasts, and braises. Every recipe tested and verified." },
  salad: { title: "Salad Recipes", emoji: "🥗", description: "Fresh, vibrant salads — Turkish Çoban, Greek Horiatiki, Lebanese Fattoush, Moroccan Taktouka, and more." },
  side: { title: "Side Dishes", emoji: "🫒", description: "Perfect accompaniments from every cuisine to complete your meal." },
  pickle: { title: "Pickles & Preserves", emoji: "🫙", description: "Pickles and preserves from Persian Torshi to Moroccan Preserved Lemons, Indian Mango Pickle, and Lebanese Makdous." },
  sweet: { title: "Sweets", emoji: "🍯", description: "Traditional sweets and confections from Persian, Turkish, Indian, Moroccan, and Greek kitchens." },
};

const defaultDesc = (slug: string) => ({
  title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")} Recipes`,
  emoji: "🍽️",
  description: `Browse our collection of ${slug.replace(/-/g, " ")} recipes.`,
});

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

const PAGE_SIZE = 24;

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!categoryDescriptions[slug]) {
    // Check if any recipes exist for this slug
    const count = await getCategoryRecipeCount(slug);
    if (count === 0) return { title: "Not Found", robots: { index: false } };
  }
  const info = categoryDescriptions[slug] || defaultDesc(slug);
  const url = `https://zaffaron.com/category/${slug}`;
  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: url },
    openGraph: {
      title: info.title,
      description: info.description,
      url,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
  const info = categoryDescriptions[slug] || defaultDesc(slug);

  const { recipes: items, count } = await getRecipesByCategory(slug, page, PAGE_SIZE);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  // 404 for invalid categories
  if (items.length === 0 && !categoryDescriptions[slug]) {
    notFound();
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span className="mx-1.5 text-stone-300">›</span>
        <span className="text-stone-700 font-medium">{info.title}</span>
      </nav>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{info.emoji} {info.title}</h1>
        <p className="mt-3 max-w-2xl text-stone-500">{info.description}</p>
        <p className="mt-2 text-sm text-stone-400">{count || items.length} recipes</p>
      </div>
      {items.length === 0 ? (
        <p className="text-stone-400">No recipes in this category yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((recipe, i) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} priority={i < 6} />
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
          {page > 1 && <Link href={`/category/${slug}?page=${page - 1}`} className="rounded-lg bg-stone-100 px-4 py-2 text-sm hover:bg-amber-100">← Previous</Link>}
          <span className="px-4 py-2 text-sm text-stone-500">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`/category/${slug}?page=${page + 1}`} className="rounded-lg bg-stone-100 px-4 py-2 text-sm hover:bg-amber-100">Next →</Link>}
        </nav>
      )}
    </>
  );
}
