import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Flame, ChefHat, CheckCircle, DollarSign } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import JumpToRecipe from "@/components/JumpToRecipe";
import type { Recipe } from "@/types";
import { DietaryBadges } from "./DietaryBadges";
import { AllergenWarning } from "./AllergenWarning";
import { FavoriteButton } from "./FavoriteButton";

const labelMap: Record<string, string> = {
  persian: "Persian",
  indian: "Indian",
  "middle-eastern": "Middle Eastern",
  stew: "Stews",
  rice: "Rice Dishes",
  kebab: "Kebabs",
  appetizer: "Appetizers",
  soup: "Soups",
  dessert: "Desserts",
  drink: "Drinks",
  breakfast: "Breakfast",
  main: "Main Courses",
  salad: "Salads",
  side: "Side Dishes",
  pickle: "Pickles",
  sweet: "Sweets",
  bread: "Breads",
};

function capitalize(s: string) {
  if (!s) return s;
  return labelMap[s.toLowerCase()] || s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface RecipeHeroProps {
  recipe: Recipe;
}

export function RecipeHero({ recipe }: RecipeHeroProps) {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const cuisineSlug = recipe.cuisine_slug || recipe.cuisine.toLowerCase();
  const categorySlug = recipe.category_slug || recipe.category.toLowerCase();
  const dietary = recipe.dietary_info;

  return (
    <header className="mb-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-500">
          <li>
            <Link href="/" className="hover:text-amber-600">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-stone-300">
            ›
          </li>
          <li>
            <Link href={`/cuisine/${cuisineSlug}`} className="hover:text-amber-600">
              {capitalize(recipe.cuisine)}
            </Link>
          </li>
          <li aria-hidden="true" className="text-stone-300">
            ›
          </li>
          <li>
            <Link href={`/category/${categorySlug}`} className="hover:text-amber-600">
              {capitalize(recipe.category)}
            </Link>
          </li>
          <li aria-hidden="true" className="text-stone-300">
            ›
          </li>
          <li aria-current="page" className="text-stone-700 font-medium truncate max-w-[200px]">
            {recipe.title}
          </li>
        </ol>
      </nav>

      {/* Category Links */}
      <div className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
        <Link href={`/cuisine/${cuisineSlug}`} className="text-amber-600 hover:text-amber-700">
          {recipe.cuisine}
        </Link>
        <span className="text-stone-300">·</span>
        <Link href={`/category/${categorySlug}`} className="text-amber-600 hover:text-amber-700">
          {recipe.category}
        </Link>
      </div>

      {/* Title with Favorite Button */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{recipe.title}</h1>
        <FavoriteButton recipeId={recipe.id} />
      </div>
      <p className="mt-3 text-lg text-stone-600">{recipe.description}</p>

      {/* Author & Date */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
        <span>By {recipe.author || "Zaffaron Kitchen"}</span>
        {recipe.published_at && <span>· Published {formatDate(recipe.published_at)}</span>}
        {recipe.verification_status === "verified" && (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle className="h-4 w-4" /> Tested Recipe
          </span>
        )}
      </div>

      {/* Dietary Badges + Allergens */}
      <div className="mt-4 space-y-3">
        <DietaryBadges dietary={dietary} />
        <AllergenWarning dietary={dietary} />
      </div>

      {/* Stats */}
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-600">
        <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
          <Clock className="h-4 w-4" /> {totalTime} min total
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
          <ChefHat className="h-4 w-4" /> Prep {recipe.prep_time_minutes}m · Cook {recipe.cook_time_minutes}m
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
          <Users className="h-4 w-4" /> {recipe.servings} servings
        </span>
        {recipe.calories_per_serving && (
          <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
            <Flame className="h-4 w-4" /> {recipe.calories_per_serving} cal
          </span>
        )}
        {recipe.cost_estimate?.per_serving_usd && (
          <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
            <DollarSign className="h-4 w-4" /> ~${recipe.cost_estimate.per_serving_usd}/serving
          </span>
        )}
      </div>

      {/* Jump to Recipe + Print */}
      <div className="mt-4 flex gap-3 print:hidden">
        <JumpToRecipe />
        <PrintButton />
      </div>

      {/* Hero Image */}
      {recipe.image_url && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={recipe.image_url}
            alt={recipe.image_alt || recipe.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}
    </header>
  );
}
