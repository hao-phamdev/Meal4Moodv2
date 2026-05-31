export interface Recipe {
  id?: string;
  title: string;
  description: string;
  cookTime: number;
  servings: number;
  ingredients: string[];
  steps: string[];
  imageUrl: string;
  flag: string;
  country: string;
  cuisine: string;
  mood: number;
  diet: string[];
  createdAt?: string;
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
