"use client";

import { useState, useCallback } from "react";
import type { Ingredient, Substitution } from "@/types";

interface RecipeIngredientsProps {
  ingredients: Ingredient[];
  substitutions?: Substitution[] | null;
}

export function RecipeIngredients({ ingredients, substitutions }: RecipeIngredientsProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = useCallback((index: number) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  }, []);

  return (
    <section id="recipe-ingredients">
      <h2 className="mb-4 text-xl font-bold">Ingredients</h2>
      <ul className="space-y-2">
        {ingredients.map((ing, i) => {
          const isChecked = checkedItems.has(i);
          return (
            <li
              key={i}
              className={`flex gap-2 text-sm cursor-pointer transition-opacity ${
                isChecked ? "opacity-50" : "opacity-100"
              }`}
              onClick={() => toggleItem(i)}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleItem(i)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-600 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <span className={`font-medium text-stone-800 dark:text-stone-200 min-w-fit ${isChecked ? "line-through" : ""}`}>
                {ing.amount} {ing.unit}
              </span>
              <span className={`text-stone-600 dark:text-stone-400 ${isChecked ? "line-through" : ""}`}>
                {ing.item}
                {ing.note && <span className="text-stone-500 dark:text-stone-400"> ({ing.note})</span>}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Substitutions */}
      {substitutions && Array.isArray(substitutions) && substitutions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-stone-700 dark:text-stone-300">🔄 Substitutions</h3>
          <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
            {substitutions.map((sub, i) => (
              <li key={i} className="rounded-lg bg-stone-50 dark:bg-stone-800 p-2">
                <span className="font-medium">{sub.original}</span>
                <span className="block mt-0.5 text-stone-500 dark:text-stone-400">→ {sub.substitute}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
