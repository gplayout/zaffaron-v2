import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import type { Recipe } from "@/types";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const cuisineDescriptions: Record<string, { title: string; description: string }> = {
  persian: {
    title: "Persian Recipes",
    description: "Discover the rich flavors of Persian cuisine — from aromatic herb stews like Ghormeh Sabzi to jeweled saffron rice dishes, succulent kebabs, and traditional sweets. Persian food is one of the world's oldest and most sophisticated culinary traditions, built on a foundation of saffron, dried limes, barberries, and fresh herbs.",
  },
  indian: {
    title: "Indian Recipes",
    description: "Explore the vibrant spices and bold flavors of Indian cuisine — from creamy butter chicken to fragrant biryanis and aromatic curries.",
  },
  "middle-eastern": {
    title: "Middle Eastern Recipes",
    description: "Discover the shared flavors of the Middle East — from smoky grilled meats to fresh salads, creamy dips, and aromatic rice dishes.",
  },
};

const defaultDesc = (slug: string) => ({
  title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")} Recipes`,
  description: `Browse our collection of authentic ${slug.replace(/-/g, " ")} recipes.`,
});

export async function generateStaticParams() {
  const { data } = await supabaseServer
    .from("recipes_v2")
    .select("cuisine_slug")
    .eq("published", true);
  const slugs = [...new Set((data || []).map((r) => r.cuisine_slug).filter(Boolean))];
  return slugs.map((slug) => ({ slug }));
}

const PAGE_SIZE = 24;

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!cuisineDescriptions[slug]) {
    const { count } = await supabaseServer.from("recipes_v2").select("id", { count: "exact", head: true }).eq("published", true).eq("cuisine_slug", slug);
    if (!count || count === 0) return { title: "Not Found", robots: { index: false } };
  }
  const info = cuisineDescriptions[slug] || defaultDesc(slug);
  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: `https://zaffaron.com/cuisine/${slug}` },
  };
}

export default async function CuisinePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
  const info = cuisineDescriptions[slug] || defaultDesc(slug);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: recipes, count } = await supabaseServer
    .from("recipes_v2")
    .select("id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at", { count: 'exact' })
    .eq("published", true)
    .eq("cuisine_slug", slug)
    .order("published_at", { ascending: false })
    .range(from, to);

  const items = (recipes as Recipe[]) || [];
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  // 404 for invalid cuisines
  if (items.length === 0 && !cuisineDescriptions[slug]) {
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{info.title}</h1>
        <p className="mt-3 max-w-2xl text-stone-500">{info.description}</p>
        <p className="mt-2 text-sm text-stone-400">{count || items.length} recipes</p>
      </div>
      {items.length === 0 ? (
        <p className="text-stone-400">No recipes in this cuisine yet.</p>
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
          {page > 1 && <Link href={`/cuisine/${slug}?page=${page - 1}`} className="rounded-lg bg-stone-100 px-4 py-2 text-sm hover:bg-amber-100">← Previous</Link>}
          <span className="px-4 py-2 text-sm text-stone-500">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`/cuisine/${slug}?page=${page + 1}`} className="rounded-lg bg-stone-100 px-4 py-2 text-sm hover:bg-amber-100">Next →</Link>}
        </nav>
      )}
    </>
  );
}
