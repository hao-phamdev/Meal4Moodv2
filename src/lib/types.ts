export interface Recipe {
  id?: string;
  title: string;
  description: string;
  moodMatch?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  cookTime: number;
  servings: number;
  caloriesPerServing?: number;
  ingredients: string[];
  steps: string[];
  usedFridgeItems?: string[];
  chefTip?: string;
  changes?: string;
  version?: number;
  imageUrl: string;
  flag: string;
  country: string;
  cuisine: string;
  mood: number;
  diet: string[];
  createdAt?: string;
  meta?: AiMeta;
}

export interface PromptPattern {
  name: string;
  how: string;
}

// What the "Under the hood" panel shows for each AI call.
export interface AiMeta {
  model: string;
  effort: string;
  latencyMs: number;
  tokens: { input: number; output: number; cacheRead: number; cacheWrite: number };
  costUsd: number;
  patterns: PromptPattern[];
  prompt: { system: string; messages: { role: string; content: string }[] };
}

export interface CuisineEntry {
  cuisine: string;
  flag: string;
  dishes: string[];
}

export type CuisineMap = Record<string, CuisineEntry>;

export type DietaryOption =
  | "Vegetarian"
  | "Vegan"
  | "Dairy-Free"
  | "Gluten-Free"
  | "Keto"
  | "None";
