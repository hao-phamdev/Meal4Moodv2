import { NextRequest, NextResponse } from "next/server";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, EFFORT, AiError, assertUsable, buildMeta, errorResponse } from "@/lib/ai";
import { RECIPE_SYSTEM_PROMPT, RECIPE_PATTERNS, RecipeSchema, buildRecipeUserMessage } from "@/lib/prompts/recipePrompt";
import { parseRecipeRequest, ValidationError } from "@/lib/validate";
import { rateLimited } from "@/lib/rateLimit";
import { fetchFoodImage } from "@/lib/pexels";

export async function POST(req: NextRequest) {
  if (rateLimited(req, "recipe", 20, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many recipes in a short time — take a breather and try again in a few minutes." }, { status: 429 });
  }

  try {
    const r = parseRecipeRequest(await req.json());
    const userMessage = buildRecipeUserMessage(r);
    const startedAt = Date.now();

    const message = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      system: [{ type: "text", text: RECIPE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMessage }],
      output_config: { effort: EFFORT, format: zodOutputFormat(RecipeSchema) },
    });

    assertUsable(message);
    const recipe = message.parsed_output;
    if (!recipe) throw new AiError("The chef's recipe came back garbled. Please try again.", 502);

    const meta = buildMeta(message, startedAt, {
      patterns: RECIPE_PATTERNS,
      prompt: { system: RECIPE_SYSTEM_PROMPT, messages: [{ role: "user", content: userMessage }] },
    });
    const imageUrl = await fetchFoodImage(recipe.title, r.cuisine);

    return NextResponse.json({
      ...recipe,
      imageUrl,
      flag: r.flag,
      country: r.country,
      cuisine: r.cuisine,
      mood: r.mood,
      diet: r.diet,
      version: 1,
      meta,
    });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("generate-recipe error:", err);
    const { error, status } = errorResponse(err, "Failed to generate recipe");
    return NextResponse.json({ error }, { status });
  }
}
