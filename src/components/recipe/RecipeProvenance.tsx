import { humanize } from "@/lib/formatting";

interface RecipeProvenanceProps {
  cuisineSlug: string | null;
  culturalSignificance: string | null;
  regionalVariations: Array<{ region: string; description?: string; difference?: string }> | null;
  author: string | null;
  publishedAt: string | null;
}

export function RecipeProvenance({
  cuisineSlug,
  culturalSignificance,
  regionalVariations,
  author,
  publishedAt,
}: RecipeProvenanceProps) {
  const hasContent = culturalSignificance || (regionalVariations && regionalVariations.length > 0);
  if (!hasContent) return null;

  return (
    <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-6">
      <h2 className="text-lg font-bold text-stone-800 mb-3">
        🪪 Recipe Passport
      </h2>

      {/* Origin */}
      <div className="flex flex-wrap gap-4 text-sm text-stone-600 mb-4">
        {cuisineSlug && (
          <div>
            <span className="font-medium text-stone-700">Origin:</span>{" "}
            {humanize(cuisineSlug)} Cuisine
          </div>
        )}
        {author && (
          <div>
            <span className="font-medium text-stone-700">Researched by:</span>{" "}
            {author}
          </div>
        )}
        {publishedAt && (
          <div>
            <span className="font-medium text-stone-700">Published:</span>{" "}
            {new Date(publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
      </div>

      {/* Cultural context */}
      {culturalSignificance && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-stone-700 mb-1">Cultural Background</h3>
          <p className="text-sm leading-relaxed text-stone-600">{culturalSignificance}</p>
        </div>
      )}

      {/* Regional variations */}
      {regionalVariations && regionalVariations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">Regional Variations</h3>
          <div className="space-y-2">
            {regionalVariations.map((v, i) => (
              <div key={i} className="text-sm text-stone-600">
                <span className="font-medium text-stone-700">{v.region}:</span>{" "}
                {v.description || v.difference}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provenance note */}
      <p className="mt-4 text-xs text-stone-400 border-t border-stone-200 pt-3">
        Researched from multiple sources and validated by the Zaffaron editorial team.
        Every recipe is tested for accuracy, measurements, and cultural authenticity.
      </p>
    </div>
  );
}
