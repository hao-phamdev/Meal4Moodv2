import { z } from "zod";
import cuisineMap from "../../country-cuisine-map.json";
import { MOOD_PRESETS } from "@/lib/mood";
import type { RecipeRequest } from "@/lib/prompts/recipePrompt";

type CuisineMap = Record<string, { cuisine: string; flag: string; dishes: string[] }>;
const MAP = cuisineMap as CuisineMap;

const DIETS = ["Vegetarian", "Vegan", "Dairy-Free", "Gluten-Free", "Keto", "Pescatarian", "Nut-Free"] as const;

// Free text that ends up in a prompt: trim, cap the length, drop tag brackets
// so it can't close the <user_input> wrapper.
const cleanText = (max: number) =>
  z.string().transform(s => s.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max));

const RequestBody = z.object({
  country: z.string(),
  mood: z.number().min(0).max(100),
  moodPreset: z.string().nullish(),
  diet: z.array(z.enum(DIETS)).max(DIETS.length).default([]),
  cookTime: z.number().min(5).max(240),
  ingredients: z.array(cleanText(40)).max(25).default([]),
  lastTitle: cleanText(80).optional(),
  pinnedDish: z.string().optional(),
});

export type RecipeRequestBody = z.input<typeof RequestBody>;

export class ValidationError extends Error {}

// Server-side lookup: the cuisine and reference dishes come from our own data,
// never from the client.
export function parseRecipeRequest(raw: unknown): RecipeRequest & { flag: string } {
  const parsed = RequestBody.safeParse(raw);
  if (!parsed.success) throw new ValidationError("Invalid recipe request");
  const b = parsed.data;

  const entry = MAP[b.country];
  if (!entry) throw new ValidationError("Unknown country");

  return {
    country: b.country,
    cuisine: entry.cuisine,
    dishes: entry.dishes,
    flag: entry.flag,
    mood: Math.round(b.mood),
    feeling: b.moodPreset ? MOOD_PRESETS[b.moodPreset] : undefined,
    diet: b.diet,
    cookTime: Math.round(b.cookTime),
    ingredients: b.ingredients.filter(Boolean),
    lastTitle: b.lastTitle || undefined,
    pinnedDish: b.pinnedDish && entry.dishes.includes(b.pinnedDish) ? b.pinnedDish : undefined,
  };
}

export const refineInstruction = cleanText(200).pipe(z.string().min(2));
