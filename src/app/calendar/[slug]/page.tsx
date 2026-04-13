import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

interface CalendarEvent {
  slug: string;
  name: string;
  name_local: string | null;
  event_type: string;
  tier: number;
  date_type: string;
  date_rule: string | null;
  start_month: number | null;
  start_day: number | null;
  regions: string[];
  cuisines: string[];
  signature_dishes: { name: string; local_name?: string }[];
  cultural_context: string | null;
  search_keywords: string[];
  description: string | null;
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabaseServer
    .from("calendar_events")
    .select("name, name_local, cultural_context")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) return { title: "Event Not Found" };

  return {
    title: `${data.name} — Food Traditions & Recipes | Zaffaron`,
    description: data.cultural_context?.slice(0, 160) || `Discover the food traditions of ${data.name}.`,
    alternates: { canonical: `/calendar/${slug}` },
  };
}

export default async function CalendarEventPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: event } = await supabaseServer
    .from("calendar_events")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!event) notFound();

  const ev = event as CalendarEvent;

  // Find related recipes by matching cuisine
  const mainCuisine = ev.cuisines?.[0];
  let relatedRecipes: { slug: string; title: string; cuisine_slug: string }[] = [];
  if (mainCuisine) {
    const { data } = await supabaseServer
      .from("recipes_v2")
      .select("slug, title, cuisine_slug")
      .eq("published", true)
      .eq("cuisine_slug", mainCuisine.toLowerCase())
      .limit(6);
    relatedRecipes = data || [];
  }

  return (
    <article className="max-w-3xl">
      <Link href="/calendar" className="text-sm text-amber-600 hover:underline mb-4 block">
        ← Back to Calendar
      </Link>

      <h1 className="text-3xl font-bold mb-1">{ev.name}</h1>
      {ev.name_local && (
        <p className="text-lg text-stone-400 mb-4">{ev.name_local}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {ev.tier === 1 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            🌍 Major Global Event
          </span>
        )}
        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600 capitalize">
          {ev.event_type}
        </span>
        {ev.date_rule && (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
            📅 {ev.date_rule}
          </span>
        )}
      </div>

      {ev.cultural_context && (
        <section className="prose prose-stone mb-8">
          <h2>Cultural Context</h2>
          <p>{ev.cultural_context}</p>
        </section>
      )}

      {ev.signature_dishes && ev.signature_dishes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">🍽️ Signature Dishes</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {ev.signature_dishes.map((dish, i) => (
              <div key={i} className="rounded-lg border border-stone-200 p-3">
                <p className="font-medium">{dish.name}</p>
                {dish.local_name && (
                  <p className="text-sm text-stone-400">{dish.local_name}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        {ev.regions && ev.regions.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">Regions</h2>
            <div className="flex flex-wrap gap-1">
              {ev.regions.map((r) => (
                <span key={r} className="rounded-full bg-stone-100 px-2 py-0.5 text-sm text-stone-600">{r}</span>
              ))}
            </div>
          </section>
        )}
        {ev.cuisines && ev.cuisines.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">Cuisines</h2>
            <div className="flex flex-wrap gap-1">
              {ev.cuisines.map((c) => (
                <span key={c} className="rounded-full bg-amber-50 px-2 py-0.5 text-sm text-amber-700">{c}</span>
              ))}
            </div>
          </section>
        )}
      </div>

      {relatedRecipes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">📖 Related Recipes</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {relatedRecipes.map((r) => (
              <Link
                key={r.slug}
                href={`/recipe/${r.slug}`}
                className="rounded-lg border border-stone-200 p-3 hover:border-amber-300 transition"
              >
                <p className="font-medium text-stone-900 line-clamp-1">{r.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
