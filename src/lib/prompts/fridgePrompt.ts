import { z } from "zod";
import type { PromptPattern } from "@/lib/types";

export const FridgeScanSchema = z.object({
  isFoodPhoto: z.boolean().describe("False if the photo shows no food at all"),
  items: z.array(z.object({
    name: z.string().describe("Short lowercase ingredient name, e.g. 'cherry tomatoes'"),
    category: z.enum(["produce", "protein", "dairy", "grain", "condiment", "other"]),
    confidence: z.enum(["high", "medium", "low"]),
  })),
});

export const FRIDGE_SYSTEM_PROMPT = `You are a meticulous kitchen inventory assistant. You look at photos of fridges, pantries and countertops and list the cooking ingredients a home cook could use tonight.

Rules:
- Name each distinct ingredient once, in short lowercase form ("cheddar cheese", not "a block of what appears to be cheddar").
- Read labels when you can; if you can only see a container, name its likely contents only if you are reasonably sure, otherwise skip it.
- Skip non-food items, drinks other than milk or cooking liquids, and anything that is clearly spoiled.
- Rate your confidence: "high" when clearly visible or labelled, "medium" when likely, "low" when guessing.
- If the photo contains no food at all, set isFoodPhoto to false and return no items.

Example — for a photo of a fridge door with a carton of eggs, a half-used lemon and a jar labelled "Dijon", you would return:
{"isFoodPhoto": true, "items": [{"name": "eggs", "category": "protein", "confidence": "high"}, {"name": "lemon", "category": "produce", "confidence": "high"}, {"name": "dijon mustard", "category": "condiment", "confidence": "high"}]}`;

export const FRIDGE_USER_TEXT = "List the ingredients in this photo.";

export const FRIDGE_PATTERNS: PromptPattern[] = [
  { name: "Persona", how: "A meticulous kitchen-inventory assistant, so it names ingredients the way a cook would." },
  { name: "Few-shot", how: "A worked example shows the expected naming style and confidence ratings." },
  { name: "Template / structured output", how: "A JSON schema with categories and confidence levels; low-confidence guesses are filtered out." },
];
