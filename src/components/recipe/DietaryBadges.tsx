import { Leaf } from "lucide-react";
import type { Recipe } from "@/types";

interface DietaryBadgesProps {
  dietary: Recipe["dietary_info"];
}

export function DietaryBadges({ dietary }: DietaryBadgesProps) {
  if (!dietary) return null;

  const badges: { label: string; color: string }[] = [];
  if (dietary.vegetarian) badges.push({ label: "Vegetarian", color: "bg-green-100 text-green-700" });
  if (dietary.vegan) badges.push({ label: "Vegan", color: "bg-green-100 text-green-700" });
  if (dietary.gluten_free) badges.push({ label: "Gluten-Free", color: "bg-blue-100 text-blue-700" });
  if (dietary.dairy_free) badges.push({ label: "Dairy-Free", color: "bg-sky-100 text-sky-700" });
  if (dietary.nut_free) badges.push({ label: "Nut-Free", color: "bg-purple-100 text-purple-700" });
  if (dietary.halal) badges.push({ label: "Halal", color: "bg-emerald-100 text-emerald-700" });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b.label}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${b.color}`}
        >
          <Leaf className="h-3 w-3" /> {b.label}
        </span>
      ))}
    </div>
  );
}
