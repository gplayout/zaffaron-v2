import type { Recipe } from '@/types';
import PrintButton from '@/components/PrintButton';

function fmtIngredient(i: Recipe['ingredients'][number]) {
  const amt = [i.amount, i.unit].filter(Boolean).join(' ').trim();
  const base = [amt, i.item].filter(Boolean).join(' ').trim();
  return i.note ? `${base} (${i.note})` : base;
}

export function RecipeQuickCard({ recipe }: { recipe: Recipe }) {
  const total = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];

  // Keep card compact: top N ingredients/steps.
  const topIngredients = ingredients.slice(0, 12);
  const topSteps = instructions.slice(0, 6);

  return (
    <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Printable Recipe Card</h2>
          <p className="mt-1 text-sm text-stone-600">
            Servings: <span className="font-medium text-stone-800">{recipe.servings}</span> · Total:{' '}
            <span className="font-medium text-stone-800">{total} min</span> · Difficulty:{' '}
            <span className="font-medium text-stone-800">{recipe.difficulty}</span>
          </p>
        </div>

        <div className="print:hidden">
          <PrintButton />
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-700">Ingredients (quick list)</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {topIngredients.map((i, idx) => (
              <li key={`${i.item}-${idx}`}>{fmtIngredient(i)}</li>
            ))}
          </ul>
          {ingredients.length > topIngredients.length && (
            <p className="mt-2 text-xs text-stone-500">
              + {ingredients.length - topIngredients.length} more in the full ingredients section below.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-700">Steps (summary)</h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-stone-700">
            {topSteps.map((s) => (
              <li key={s.step}>
                {s.text.length > 130 ? s.text.slice(0, 127).trimEnd() + '…' : s.text}
              </li>
            ))}
          </ol>
          {instructions.length > topSteps.length && (
            <p className="mt-2 text-xs text-stone-500">
              + {instructions.length - topSteps.length} more steps in the full instructions section below.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
