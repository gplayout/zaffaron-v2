import Link from "next/link";
import { getAllIngredients } from "@/lib/ingredients";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingredient Encyclopedia",
  description: "Your complete guide to specialty ingredients from Persian, Turkish, Indian, Moroccan, Lebanese, and world cuisines. Learn what to buy, how to store, and what to substitute.",
  alternates: { canonical: "https://zaffaron.com/ingredients" },
};

export default function IngredientsPage() {
  const ingredients = getAllIngredients();

  const categories = [...new Set(ingredients.map(i => i.category))];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        🧂 Ingredient Encyclopedia
      </h1>
      <p className="mt-3 text-lg text-stone-500">
        Your guide to the specialty ingredients that make these cuisines extraordinary.
        Learn what to buy, how to store, and what to substitute.
      </p>

      {categories.map((cat) => {
        const items = ingredients.filter(i => i.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mt-8">
            <h2 className="text-xl font-bold text-stone-800 capitalize mb-4">
              {cat === "spice" ? "🌶️ Spices" :
               cat === "condiment" ? "🫙 Condiments" :
               cat === "grain" ? "🌾 Grains" :
               cat === "herb" ? "🌿 Herbs" :
               cat === "dairy" ? "🥛 Dairy" :
               cat === "nut" ? "🥜 Nuts" : "📦 Other"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((ing) => (
                <Link
                  key={ing.slug}
                  href={`/ingredients/${ing.slug}`}
                  className="group rounded-xl border border-stone-200 p-4 transition hover:shadow-md hover:border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ing.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-stone-800 group-hover:text-amber-700">
                        {ing.name}
                      </h3>
                      <p className="text-sm text-stone-400">{Object.values(ing.localNames)[0] || ""}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-stone-500 line-clamp-2">{ing.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ing.cuisines.slice(0, 3).map((c) => (
                      <span key={c} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 capitalize">{c}</span>
                    ))}
                    {ing.cuisines.length > 3 && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">+{ing.cuisines.length - 3}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
