# Workflow: Fridge Photo Scan

## Objective
User uploads or captures a fridge photo; an AI vision model returns a list of detected ingredients.

## Stack
- AI vision-capable language model
- `src/lib/prompts/fridgePrompt.ts`
- `FridgeScanner` component

## Steps
1. User selects or captures photo in `FridgeScanner`
2. Client converts image to base64
3. POST to `/api/scan-fridge` with `{ image: base64string, mediaType: "image/jpeg" }`
4. API calls the AI model with image + FRIDGE_SCAN_PROMPT
5. Parse JSON array from response
6. Return ingredients to client; merge into ingredient state

## Edge Cases
- Non-food image → model returns [] or minimal list; surface to user
- Large image → resize to max 1024px on client before encoding
- JSON parse failure → return raw text as single-item array ["unknown"]

## Component
`src/components/FridgeScanner.tsx`
## Route
`POST /api/scan-fridge`
