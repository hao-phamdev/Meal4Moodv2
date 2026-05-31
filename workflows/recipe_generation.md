# Workflow: Recipe Generation

## Objective
Generate a personalized recipe using an AI language model and fetch a matching food photo from Pexels.

## Required Inputs
| Field | Type | Source |
|---|---|---|
| mood | 0–100 | MoodSlider component |
| country | string | Globe click |
| cuisine | string | country-cuisine-map.json |
| dishes | string[] | country-cuisine-map.json |
| diet | string[] | DietarySelector |
| cookTime | number | CookTimeSelector |
| ingredients | string[] | FridgeScanner or manual input |

## Steps
1. Validate all inputs are present; return 400 if missing country or mood
2. Build prompt via `src/lib/prompts/recipePrompt.ts`
3. Call the AI model with the prompt
4. Parse JSON response — if malformed, retry once, then return 500
5. Search Pexels using `{title} {cuisine} food` as query; take first result
6. Return combined recipe + photoUrl to client

## Route
`POST /api/generate-recipe`

## Edge Cases
- Diet conflicts with cuisine → the model handles gracefully; no pre-filtering needed
- Pexels rate limit → fall back to `https://placehold.co/800x600?text=Recipe`
- Model returns non-JSON → strip markdown fences, retry JSON.parse
