import type { NutritionInfo } from "@/types";

interface NutritionItem {
  label: string;
  value: number | null | undefined;
  unit: string;
}

interface RecipeNutritionProps {
  nutrition: NutritionInfo | null;
  calories: number | null;
}

export function RecipeNutrition({ nutrition, calories }: RecipeNutritionProps) {
  if (!nutrition && !calories) return null;

  const items: NutritionItem[] = nutrition
    ? [
        { label: "Calories", value: nutrition.calories, unit: "" },
        { label: "Protein", value: nutrition.protein_g, unit: "g" },
        { label: "Fat", value: nutrition.fat_g, unit: "g" },
        { label: "Carbs", value: nutrition.carbs_g, unit: "g" },
        { label: "Fiber", value: nutrition.fiber_g, unit: "g" },
        { label: "Sodium", value: nutrition.sodium_mg, unit: "mg" },
      ].filter((i) => i.value != null)
    : [{ label: "Calories", value: calories, unit: "" }];

  return (
    <section className="mt-6 rounded-lg border border-stone-200 p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-500">
        Nutrition per serving
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-lg font-bold text-stone-800">
              {item.value}
              {item.unit}
            </div>
            <div className="text-xs text-stone-500">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
