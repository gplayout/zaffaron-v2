"use server";

import { searchRecipes as searchRecipesApi } from "@/lib/api/recipes";
import type { RecipeSummary } from "@/types";

export async function searchRecipes(query: string): Promise<RecipeSummary[]> {
  return searchRecipesApi(query, 24);
}
