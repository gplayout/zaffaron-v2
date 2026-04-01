import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Flame } from "lucide-react";
import type { Recipe } from "@/types";

const labelMap: Record<string, string> = {
  persian: "Persian", indian: "Indian", "middle-eastern": "Middle Eastern",
  stew: "Stews", rice: "Rice Dishes", kebab: "Kebabs", appetizer: "Appetizers",
  soup: "Soups", dessert: "Desserts", drink: "Drinks", breakfast: "Breakfast",
  main: "Main Courses", salad: "Salads", side: "Side Dishes",
  pickle: "Pickles", sweet: "Sweets", bread: "Breads",
};
function humanize(s: string) {
  return labelMap[s?.toLowerCase()] || (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') : s);
}

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
  expert: "bg-purple-100 text-purple-700",
};

export default function RecipeCard({ recipe, priority = false }: { recipe: Recipe; priority?: boolean }) {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <Link
      href={`/recipe/${recipe.slug}`}
      className="group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] bg-stone-100">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.image_alt || recipe.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[recipe.difficulty] ?? "bg-stone-200 text-stone-700"}`}
        >
          {recipe.difficulty}
        </span>
      </div>
      <div className="p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-600">
          {humanize(recipe.cuisine)} · {humanize(recipe.category)}
        </p>
        <h3 className="text-lg font-semibold leading-tight group-hover:text-amber-700">
          {recipe.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-stone-500">
          {recipe.description}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {totalTime} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {recipe.servings}
          </span>
          {recipe.calories_per_serving && (
            <span className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" /> {recipe.calories_per_serving} cal
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
