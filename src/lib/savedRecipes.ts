import type { Recipe } from "@/lib/types";

const KEY = "m4m-saved-recipes";

export function getSavedRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

function writeSavedRecipes(recipes: Recipe[]) {
  localStorage.setItem(KEY, JSON.stringify(recipes));
}

export function saveRecipe(recipe: Recipe): string {
  const id = crypto.randomUUID();
  const entry: Recipe = { ...recipe, id, createdAt: new Date().toISOString() };
  writeSavedRecipes([entry, ...getSavedRecipes()]);
  return id;
}

export function deleteSavedRecipe(id: string) {
  writeSavedRecipes(getSavedRecipes().filter(r => r.id !== id));
}
