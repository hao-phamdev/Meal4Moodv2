import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, EFFORT, AiError, assertUsable, buildMeta, errorResponse } from "@/lib/ai";
import {
  RECIPE_SYSTEM_PROMPT, REFINE_PATTERNS, RecipeSchema, RefinedRecipeSchema,
  buildRecipeUserMessage, buildRefineUserMessage,
} from "@/lib/prompts/recipePrompt";
import { parseRecipeRequest, refineInstruction, ValidationError } from "@/lib/validate";
import { rateLimited } from "@/lib/rateLimit";
import { fetchFoodImage } from "@/lib/pexels";

const Body = z.object({
  request: z.unknown(),
  recipe: RecipeSchema,
  imageUrl: z.string().optional(),
  version: z.number().int().min(1).max(100).default(1),
  instruction: refineInstruction,
});

const KNOWN_IMAGE_HOSTS = ["https://images.pexels.com/", "https://placehold.co/"];

// Iterative refinement: replay the original request and the recipe Claude
// wrote as a real conversation, then send the user's tweak as the next turn.
export async function POST(req: NextRequest) {
  if (rateLimited(req, "refine", 30, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many remixes in a short time — try again in a few minutes." }, { status: 429 });
  }

  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) throw new ValidationError("Invalid refine request");
    const { recipe: previous, instruction, version, imageUrl: previousImage } = parsed.data;
    const r = parseRecipeRequest(parsed.data.request);

    const messages = [
      { role: "user" as const, content: buildRecipeUserMessage(r) },
      { role: "assistant" as const, content: JSON.stringify(previous) },
      { role: "user" as const, content: buildRefineUserMessage(instruction) },
    ];
    const startedAt = Date.now();

    const message = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      system: [{ type: "text", text: RECIPE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
      output_config: { effort: EFFORT, format: zodOutputFormat(RefinedRecipeSchema) },
    });

    assertUsable(message);
    const recipe = message.parsed_output;
    if (!recipe) throw new AiError("The chef's revision came back garbled. Please try again.", 502);

    const meta = buildMeta(message, startedAt, {
      patterns: REFINE_PATTERNS,
      prompt: { system: RECIPE_SYSTEM_PROMPT, messages },
    });

    const sameDish = recipe.title.trim().toLowerCase() === previous.title.trim().toLowerCase();
    const reusable = previousImage && KNOWN_IMAGE_HOSTS.some(h => previousImage.startsWith(h));
    const imageUrl = sameDish && reusable ? previousImage : await fetchFoodImage(recipe.title, r.cuisine);

    return NextResponse.json({
      ...recipe,
      imageUrl,
      flag: r.flag,
      country: r.country,
      cuisine: r.cuisine,
      mood: r.mood,
      diet: r.diet,
      version: version + 1,
      meta,
    });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("refine-recipe error:", err);
    const { error, status } = errorResponse(err, "Failed to refine recipe");
    return NextResponse.json({ error }, { status });
  }
}
