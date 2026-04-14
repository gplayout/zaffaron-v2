import { MapPin, Calendar, Utensils } from "lucide-react";
import type { Recipe, CommonMistake, RegionalVariation } from "@/types";

function parseTips(tips: string | string[] | null): string[] {
  if (!tips) return [];
  if (Array.isArray(tips)) return tips;
  if (typeof tips === "string") {
    try {
      const p = JSON.parse(tips);
      if (Array.isArray(p)) return p;
    } catch {}
    return tips.split("\n").filter(Boolean);
  }
  return [];
}

function parseServeWith(val: string | string[] | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p;
    } catch {}
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

interface RecipeTipsProps {
  recipe: Recipe;
}

export function RecipeTips({ recipe }: RecipeTipsProps) {
  const tips = parseTips(recipe.tips);
  const mistakes = recipe.common_mistakes;
  const variations = recipe.regional_variations;
  const flavor = recipe.flavor_profile;
  const serveWith = parseServeWith(recipe.serve_with);

  return (
    <>
      {/* Cultural Significance */}
      {recipe.cultural_significance && (
        <section className="mb-8 rounded-lg border-l-4 border-amber-400 bg-amber-50/50 px-5 py-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">
            Cultural Background
          </h2>
          <p className="text-sm leading-relaxed text-stone-700">{recipe.cultural_significance}</p>
        </section>
      )}

      {/* Flavor Profile */}
      {flavor && (
        <div className="mb-8 flex flex-wrap gap-2">
          {flavor.taste?.map((t: string) => (
            <span key={t} className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs text-rose-600">
              {t}
            </span>
          ))}
          {flavor.texture?.map((t: string) => (
            <span key={t} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs text-violet-600">
              {t}
            </span>
          ))}
          {flavor.aroma?.map((a: string) => (
            <span key={a} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">
              {a}
            </span>
          ))}
          {flavor.spice_level && flavor.spice_level !== "none" && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600">
              🌶 {flavor.spice_level}
            </span>
          )}
        </div>
      )}

      {/* Equipment */}
      {recipe.equipment && Array.isArray(recipe.equipment) && recipe.equipment.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-stone-500">
            <Utensils className="h-4 w-4" /> Equipment
          </h2>
          <div className="flex flex-wrap gap-2">
            {recipe.equipment.map((e: string) => (
              <span
                key={e}
                className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600"
              >
                {e}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <section className="mt-6 rounded-lg bg-amber-50 p-6">
          <h2 className="mb-3 text-lg font-bold text-amber-800">💡 Tips</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-amber-900 list-disc list-inside">
            {tips.map((tip: string, i: number) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Common Mistakes */}
      {mistakes && Array.isArray(mistakes) && mistakes.length > 0 && (
        <section className="mt-6 rounded-lg bg-red-50 p-6">
          <h2 className="mb-3 text-lg font-bold text-red-800">⚠️ Common Mistakes</h2>
          <ul className="space-y-3">
            {mistakes.map((m: CommonMistake, i: number) => (
              <li key={i} className="text-sm space-y-1">
                <p className="font-medium text-red-700">❌ {m.mistake}</p>
                {m.why && <p className="text-red-600">💡 Why: {m.why}</p>}
                {m.fix && <p className="text-emerald-700">✅ Fix: {m.fix}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Storage Notes */}
      {recipe.storage_notes && (
        <section className="mt-6 rounded-lg bg-stone-100 p-6">
          <h2 className="mb-3 text-lg font-bold text-stone-800">🧊 How to Store</h2>
          <p className="text-sm leading-relaxed text-stone-700">{recipe.storage_notes}</p>
        </section>
      )}

      {/* Make Ahead */}
      {recipe.make_ahead && (
        <section className="mt-6 rounded-lg bg-blue-50 p-6">
          <h2 className="mb-3 text-lg font-bold text-blue-800">📅 Make Ahead</h2>
          <p className="text-sm leading-relaxed text-blue-700">{recipe.make_ahead}</p>
        </section>
      )}

      {/* Serve With */}
      {serveWith.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold">🍽️ Pairs Well With</h2>
          <ul className="list-disc pl-5 text-sm text-stone-600 space-y-1">
            {serveWith.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Regional Variations */}
      {variations && Array.isArray(variations) && variations.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold">
            <MapPin className="h-5 w-5 text-stone-400" /> Regional Variations
          </h2>
          <ul className="space-y-2">
            {variations.map((v: RegionalVariation | string, i: number) => {
              // Handle both string arrays (legacy data) and object arrays
              if (typeof v === "string") {
                if (!v.trim()) return null;
                return (
                  <li key={i} className="rounded-lg border border-stone-200 p-3 text-sm text-stone-600">
                    {v}
                  </li>
                );
              }
              const text = v.description || v.difference;
              if (!v.region && !text) return null;
              return (
                <li key={i} className="rounded-lg border border-stone-200 p-3 text-sm">
                  {v.region && <span className="font-medium text-stone-800">{v.region}</span>}
                  {text && (
                    <span className={v.region ? "block mt-0.5 text-stone-600" : "text-stone-600"}>
                      {v.region ? text : text}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Occasions */}
      {recipe.occasions && Array.isArray(recipe.occasions) && recipe.occasions.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {recipe.occasions.map((o: string) => (
            <span
              key={o}
              className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600"
            >
              <Calendar className="h-3 w-3" /> {o}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {recipe.tags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {recipe.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
