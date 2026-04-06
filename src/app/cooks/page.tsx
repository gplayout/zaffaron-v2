import { Metadata } from "next";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import CookCard from "@/components/CookCard";
import type { Cook } from "@/types";

export const metadata: Metadata = {
  title: "Browse Cooks",
  description: "Discover talented home cooks and professional chefs in your area. Browse menus, read reviews, and order authentic homemade meals.",
};

// Mock data for cooks
const mockCooks: Cook[] = [
  {
    id: "1",
    name: "Maryam Ahmadi",
    bio: "Passionate home cook specializing in traditional Persian stews and rice dishes. 15 years of experience cooking for family and catering events.",
    avatar_url: null,
    specialties: ["Persian", "Stews", "Rice Dishes", "Kebabs"],
    location: "Irvine, CA",
    rating: 4.9,
    review_count: 127,
    verified: true,
    created_at: "2023-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Karim Hosseini",
    bio: "Professional chef with experience from top Tehran restaurants. Now bringing authentic Persian flavors to Southern California.",
    avatar_url: null,
    specialties: ["Persian", "Fine Dining", "Seafood", "Appetizers"],
    location: "Los Angeles, CA",
    rating: 4.8,
    review_count: 89,
    verified: true,
    created_at: "2023-03-20T00:00:00Z",
  },
  {
    id: "3",
    name: "Fatima Khan",
    bio: "Self-taught cook passionate about Middle Eastern and Mediterranean fusion. Known for my famous hummus and fresh pita bread.",
    avatar_url: null,
    specialties: ["Middle Eastern", "Mediterranean", "Vegetarian", "Breads"],
    location: "San Diego, CA",
    rating: 4.7,
    review_count: 64,
    verified: false,
    created_at: "2023-06-10T00:00:00Z",
  },
  {
    id: "4",
    name: "Ali Rahmani",
    bio: "Grandfather of six who loves sharing his secret family recipes. Specializing in slow-cooked stews and traditional desserts.",
    avatar_url: null,
    specialties: ["Persian", "Desserts", "Stews", "Traditional"],
    location: "Costa Mesa, CA",
    rating: 5.0,
    review_count: 43,
    verified: true,
    created_at: "2024-01-05T00:00:00Z",
  },
  {
    id: "5",
    name: "Sarah Johnson",
    bio: "Culinary school graduate with a love for Indian cuisine. Creating authentic curries and biryanis with locally sourced ingredients.",
    avatar_url: null,
    specialties: ["Indian", "Curry", "Vegetarian", "Spicy"],
    location: "Santa Ana, CA",
    rating: 4.6,
    review_count: 52,
    verified: false,
    created_at: "2023-08-15T00:00:00Z",
  },
  {
    id: "6",
    name: "Omar Farooq",
    bio: "Street food enthusiast bringing the flavors of Lahore to California. Famous for my seekh kebabs and freshly baked naan.",
    avatar_url: null,
    specialties: ["Pakistani", "Street Food", "Kebabs", "Grill"],
    location: "Anaheim, CA",
    rating: 4.8,
    review_count: 78,
    verified: true,
    created_at: "2023-05-22T00:00:00Z",
  },
];

const cuisineTypes = ["All", "Persian", "Indian", "Middle Eastern", "Mediterranean", "Pakistani"];
const ratings = ["All", "4.5+", "4.0+", "3.5+"];
const availabilities = ["All", "Available Now", "Accepting Orders", "Fully Booked"];
const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "distance", label: "Nearest First" },
  { value: "newest", label: "Newest Arrivals" },
];

export default function CooksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <CooksPageContent searchParams={searchParams} />
  );
}

async function CooksPageContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const location = typeof params.location === "string" ? params.location : "";
  const cuisine = typeof params.cuisine === "string" ? params.cuisine : "All";
  const rating = typeof params.rating === "string" ? params.rating : "All";
  const availability = typeof params.availability === "string" ? params.availability : "All";
  const sort = typeof params.sort === "string" ? params.sort : "rating";

  // Filter cooks
  let filteredCooks = mockCooks.filter((cook) => {
    // Location filter
    if (location && !cook.location.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }
    
    // Cuisine filter
    if (cuisine !== "All" && !cook.specialties.some((s: string) => s.toLowerCase() === cuisine.toLowerCase())) {
      return false;
    }
    
    // Rating filter
    if (rating !== "All") {
      const minRating = parseFloat(rating.replace("+", ""));
      if (cook.rating < minRating) {
        return false;
      }
    }
    
    return true;
  });

  // Sort cooks
  filteredCooks = [...filteredCooks].sort((a, b) => {
    switch (sort) {
      case "rating":
        return b.rating - a.rating || b.review_count - a.review_count;
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "distance":
      default:
        return a.location.localeCompare(b.location);
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">Browse Cooks</h1>
        <p className="text-stone-600">
          Discover talented home cooks and professional chefs in your area
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        {/* Search Bar */}
        <form className="relative" action="/cooks">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            name="location"
            defaultValue={location}
            placeholder="Search by city or location..."
            className="w-full rounded-lg border border-stone-200 py-3 pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters:</span>
          </div>

          {/* Cuisine Filter */}
          <form className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="location" value={location} />
            <input type="hidden" name="sort" value={sort} />
            <select
              name="cuisine"
              defaultValue={cuisine}
              onChange={(e) => e.target.closest('form')?.requestSubmit()}
              className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {cuisineTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Cuisines" : type}
                </option>
              ))}
            </select>
          </form>

          {/* Rating Filter */}
          <form className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="location" value={location} />
            <input type="hidden" name="cuisine" value={cuisine} />
            <input type="hidden" name="sort" value={sort} />
            <select
              name="rating"
              defaultValue={rating}
              onChange={(e) => e.target.closest('form')?.requestSubmit()}
              className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {ratings.map((r) => (
                <option key={r} value={r}>
                  {r === "All" ? "All Ratings" : `${r} & Up`}
                </option>
              ))}
            </select>
          </form>

          {/* Availability Filter */}
          <form className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="location" value={location} />
            <input type="hidden" name="cuisine" value={cuisine} />
            <input type="hidden" name="rating" value={rating} />
            <input type="hidden" name="sort" value={sort} />
            <select
              name="availability"
              defaultValue={availability}
              onChange={(e) => e.target.closest('form')?.requestSubmit()}
              className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {availabilities.map((a) => (
                <option key={a} value={a}>
                  {a === "All" ? "Any Availability" : a}
                </option>
              ))}
            </select>
          </form>
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
          <p className="text-sm text-stone-600">
            <span className="font-medium text-stone-900">{filteredCooks.length}</span> cook
            {filteredCooks.length !== 1 ? "s" : ""} found
          </p>
          <form className="flex items-center gap-2">
            <input type="hidden" name="location" value={location} />
            <input type="hidden" name="cuisine" value={cuisine} />
            <input type="hidden" name="rating" value={rating} />
            <input type="hidden" name="availability" value={availability} />
            <label htmlFor="sort" className="text-sm text-stone-600">
              Sort by:
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              onChange={(e) => e.target.closest('form')?.requestSubmit()}
              className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      {filteredCooks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCooks.map((cook) => (
            <CookCard key={cook.id} cook={cook} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            <Search className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900">No cooks found</h3>
          <p className="mt-1 text-stone-600">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <a
            href="/cooks"
            className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Clear all filters
          </a>
        </div>
      )}
    </div>
  );
}


