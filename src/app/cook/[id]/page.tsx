import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, ChefHat, CheckCircle, Calendar } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import type { Cook } from "@/types/cook";
import type { Recipe } from "@/types";

// Mock data for cook profiles - replace with actual data fetching later
const mockCooks: Record<string, Cook> = {
  "sarah-johnson": {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    bio: "Persian cuisine enthusiast with 10 years of experience cooking traditional dishes passed down through generations. Specializing in stews, rice dishes, and authentic Persian appetizers.",
    avatar_url: null,
    specialties: ["Ghormeh Sabzi", "Tahdig", "Khoresh", "Persian Rice"],
    location: "Los Angeles, CA",
    rating: 4.9,
    review_count: 127,
    verified: true,
    created_at: "2023-01-15T00:00:00Z",
  },
  "ali-rezaei": {
    id: "ali-rezaei",
    name: "Ali Rezaei",
    bio: "Third-generation chef from Tehran, bringing authentic Persian flavors to your table. Known for my kebabs, traditional breads, and Persian desserts.",
    avatar_url: null,
    specialties: ["Kebab", "Barbari Bread", "Baklava", "Persian Sweets"],
    location: "Irvine, CA",
    rating: 4.8,
    review_count: 89,
    verified: true,
    created_at: "2023-03-20T00:00:00Z",
  },
};

// Mock recipes for each cook
const mockRecipes: Record<string, Recipe[]> = {
  "sarah-johnson": [],
  "ali-rezaei": [],
};

function getCookById(id: string): Cook | null {
  return mockCooks[id] || null;
}

function getCookRecipes(cookId: string): Recipe[] {
  return mockRecipes[cookId] || [];
}

interface CookProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CookProfilePageProps) {
  const { id } = await params;
  const cook = getCookById(id);
  
  if (!cook) {
    return {
      title: "Cook Not Found",
    };
  }

  return {
    title: `${cook.name} — Zaffaron Cook`,
    description: cook.bio.slice(0, 160),
  };
}

export default async function CookProfilePage({ params }: CookProfilePageProps) {
  const { id } = await params;
  const cook = getCookById(id);

  if (!cook) {
    notFound();
  }

  const recipes = getCookRecipes(id);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {cook.avatar_url ? (
              <Image
                src={cook.avatar_url}
                alt={cook.name}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-600 sm:h-28 sm:w-28">
                <ChefHat className="h-12 w-12 sm:h-14 sm:w-14" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                {cook.name}
              </h1>
              {cook.verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                  title="Verified Cook"
                >
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-stone-900">{cook.rating}</span>
              </div>
              <span className="text-stone-500">({cook.review_count} reviews)</span>
            </div>

            {/* Location */}
            <div className="mt-2 flex items-center gap-1.5 text-sm text-stone-600">
              <MapPin className="h-4 w-4" />
              <span>{cook.location}</span>
            </div>

            {/* Member Since */}
            <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
              <Calendar className="h-4 w-4" />
              <span>
                Member since{" "}
                {new Date(cook.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Bio */}
            <p className="mt-4 text-stone-700">{cook.bio}</p>

            {/* Specialties */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-stone-900">Specialties</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {cook.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Order Button */}
            <div className="mt-6">
              <button
                className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
                title="Coming soon"
              >
                Order from this cook
              </button>
              <p className="mt-2 text-xs text-stone-500">
                Ordering feature coming soon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-stone-900">
          Menu & Recipes
        </h2>
        {recipes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
            <ChefHat className="mx-auto h-12 w-12 text-stone-300" />
            <p className="mt-3 text-stone-600">
              No recipes available from this cook yet.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Check back soon for their latest dishes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
