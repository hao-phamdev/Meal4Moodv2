interface RecipePromptParams {
  mood: number;
  country: string;
  cuisine: string;
  dishes: string[];
  diet: string[];
  cookTime: number;
  ingredients: string[];
  lastTitle?: string;
  pinnedDish?: string;
}

export function buildRecipePrompt(p: RecipePromptParams): string {
  const moodLabel = p.mood <= 20 ? "cozy and soothing" : p.mood <= 40 ? "mellow and comforting" : p.mood <= 60 ? "balanced and approachable" : p.mood <= 80 ? "bold and lively" : "wild and adventurous";

  const avoidLine = p.lastTitle ? `\nDo NOT generate a dish called "${p.lastTitle}" — it was the last recipe shown.` : "";
  const pinnedLine = p.pinnedDish ? `\nThe dish MUST be: ${p.pinnedDish}` : "";

  return `You are a world-class chef who specializes in authentic regional cuisine.

Generate ONE specific, authentic ${p.cuisine} recipe.${pinnedLine}

CRITICAL RULES:
1. The dish MUST be a REAL, traditional ${p.cuisine} dish with its correct authentic name. Do NOT invent dish names or combine random words.
2. Choose from the full range of regional specialties — not just the most famous dishes.${avoidLine}
3. Be creative — prefer lesser-known regional specialties when possible.

Country: ${p.country}
Cuisine: ${p.cuisine}
Reference dishes for inspiration (authentic examples, do not simply copy): ${p.dishes.join(", ")}
Mood: ${moodLabel} (${p.mood}/100)
Dietary restrictions: ${p.diet.length ? p.diet.join(", ") : "none"}
Max cook time: ${p.cookTime} minutes
${p.ingredients.length
  ? `Ingredients the user already has — you MUST build the recipe around these and use as many as possible: ${p.ingredients.join(", ")}`
  : "No specific ingredients specified."
}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "title": "string — the authentic dish name",
  "description": "string — 2 to 3 sentences, evocative",
  "cookTime": number,
  "servings": number,
  "ingredients": ["string"],
  "steps": ["string — complete actionable step"]
}`;
}
