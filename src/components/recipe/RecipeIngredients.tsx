"use client";

import { useState, useCallback } from "react";
import type { Ingredient, Substitution } from "@/types";
import { useUnitSystem, UnitSystemToggle } from "./UnitSystemToggle";
import { formatIngredient } from "@/lib/units/imperial-convert";

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

  // Phase 6.6 γ (2026-05-05): unit toggle for metric/imperial display.
  // Storage stays metric (canonical). Imperial is computed on-the-fly.
  const { system } = useUnitSystem();

  return (
    <section id="recipe-ingredients">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Ingredients</h2>
        <UnitSystemToggle />
      </div>
      <ul className="space-y-2">
        {ingredients.map((ing, i) => {
          const isChecked = checkedItems.has(i);
          const fmt = formatIngredient(ing.amount, ing.unit, system);
          // Render "amount unit" with smart spacing (omit space if unit empty).
          const measure = fmt.unit ? `${fmt.amount} ${fmt.unit}` : fmt.amount;
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
                {measure}
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
