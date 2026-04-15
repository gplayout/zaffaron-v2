import type { Instruction } from "@/types";

interface RecipeInstructionsProps {
  instructions: Instruction[];
}

export function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Instructions</h2>
      <ol className="space-y-4">
        {instructions.map((step) => (
          <li key={step.step} id={`step-${step.step}`} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
              {step.step}
            </span>
            <div>
              <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{step.text}</p>
              {step.time_minutes && (
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">⏱ {step.time_minutes} minutes</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
