# Workflow: Recipe Generation and Refinement

## Objective
Generate a personalized recipe with Claude, fetch a matching food photo from Pexels, and let the user refine it.

## Required Inputs
| Field | Type | Source |
|---|---|---|
| mood | 0–100 | MoodSlider component |
| moodPreset | string, optional | MoodSlider quick picks (Happy, Stressed, …) |
| country | string | Globe click or Quick Pick ticker |
| diet | string[] | DietarySelector |
| cookTime | number | CookTimeSelector |
| ingredients | string[] | FridgeScanner or manual input |
| pinnedDish | string, optional | Quick Pick ticker |

Cuisine, flag and reference dishes are looked up on the server from `country-cuisine-map.json`.

## Generate — `POST /api/generate-recipe`
1. Apply the per-IP rate limit (20 per 10 minutes)
2. Validate and sanitize the body in `src/lib/validate.ts`; return 400 on bad input
3. Build the user message with `buildRecipeUserMessage`; user-typed text goes inside `<user_input>` tags
4. Call Claude Haiku 5.5 with the cached `RECIPE_SYSTEM_PROMPT` (persona, mood palette, rules, few-shot examples), `effort: "low"` and `RecipeSchema` as the structured output format
5. Check `stop_reason` for `refusal` / `max_tokens`
6. Search Pexels with the dish title; fall back to broader queries, then a placeholder
7. Return the recipe, photo URL and `meta` (patterns, exact prompt, tokens, cost, latency)

## Refine — `POST /api/refine-recipe`
1. Rate limit (30 per 10 minutes) and validate: original request, current recipe, instruction (≤ 200 chars)
2. Replay the conversation: original request → Claude's recipe (assistant turn) → the user's tweak
3. Same system prompt and settings, with `RefinedRecipeSchema` (adds a `changes` summary)
4. Reuse the photo if the dish name is unchanged; otherwise search Pexels again
5. Return the revised recipe with `version + 1`

## Edge Cases
- Diet conflicts with cuisine → the prompt makes diet a hard constraint; Claude picks a naturally compliant dish or a traditional variation
- A tweak that breaks the rules (e.g. "add bacon" on a vegan recipe) → Claude makes the closest allowed change and says so in `changes`
- Refusal → 422; Anthropic rate limit → 429; missing/invalid API key → 503
- Pexels rate limit or missing key → placeholder image
