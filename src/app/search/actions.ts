"use server";

import { searchRecipes as searchRecipesApi } from "@/lib/api/recipes";
import type { Recipe } from "@/types";

export async function searchRecipes(query: string): Promise<Recipe[]> {
  return searchRecipesApi(query, 24);
}
