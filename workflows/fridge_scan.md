# Workflow: Fridge Photo Scan

## Objective
User uploads or captures a fridge photo; Claude's vision returns a list of detected ingredients.

## Stack
- Claude Haiku 5.5 (vision), structured outputs
- `src/lib/prompts/fridgePrompt.ts` — persona, few-shot example, `FridgeScanSchema`
- `FridgeScanner` component

## Steps
1. User selects or captures photo in `FridgeScanner`
2. Client downscales to max 1024px and re-encodes as JPEG (falls back to the original file if the browser can't decode it, e.g. HEIC)
3. POST to `/api/scan-fridge` with `{ image: base64string, mediaType: "image/jpeg" }`
4. API validates media type and size, applies the per-IP rate limit, then calls Claude with the image + `FRIDGE_SYSTEM_PROMPT`
5. Structured output returns `{ isFoodPhoto, items: [{ name, category, confidence }] }`
6. Drop low-confidence items and duplicates; return ingredient names to the client, which merges them into the ingredient state

## Edge Cases
- Non-food image → `isFoodPhoto: false`; the UI says "No food spotted — try another photo"
- Refusal (`stop_reason: "refusal"`) → 422 with a friendly message
- Rate limit exceeded → 429

## Component
`src/components/FridgeScanner.tsx`
## Route
`POST /api/scan-fridge`
