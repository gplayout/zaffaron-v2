/** Shared label map for cuisine/category slugs → human-readable names */
export const LABEL_MAP: Record<string, string> = {
  persian: "Persian",
  indian: "Indian",
  "middle-eastern": "Middle Eastern",
  international: "International",
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

export function humanize(slug: string): string {
  if (!slug) return slug;
  return LABEL_MAP[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}
