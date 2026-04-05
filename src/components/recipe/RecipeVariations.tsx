import type { RecipeVariationSection } from '@/lib/seo/recipe-variations';

export function RecipeVariations({ sections }: { sections: RecipeVariationSection[] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="mt-10">
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900">{section.title}</h2>
          <div className="mt-4 space-y-4">
            {section.items.map((it) => (
              <div key={it.heading}>
                <h3 className="font-semibold text-stone-900">{it.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
